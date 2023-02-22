const CommandList = require('./Commands');
const shortid = require('shortid');

const Models = require('./Models');

const slugify = require('./Helpers/slugify');

class Trackerino {
	constructor() {
		this.name = 'trackerino';
		this.version = '0.0.1';
		this.currentTime = null;
		this.ticker = null;
		this.options = {
			...{
				storage: null,
				date: null,
				dateFormat: 'yyyy-MM-dd',
				timeFormat: 'HH:mm',
				onNotify: () => {},
				onTick: () => {},
				onAsk: () => {},
				onClose: () => {},
				onOutput: () => {},
				onError: () => {},
				onBeforeAnswer: () => {},
			},
			...(arguments[0] || {}),
		};

		this.commands = {};
		this.init();
	}

	init() {
		this.isRealTime = !this.options.date;
		this.currentTime = this.options.date || Date.now();

		for (let _key in CommandList) {
			this.registerCommand(CommandList[_key]);
		}

		this.registerBaseCommands();

		this.load();

		this.say(this.__(`⏰ Welcome to ${this.name}`));

		this.ask();

		this.ticker = setInterval(this.onTick.bind(this), 1000);
	}

	storage() {
		return this.options.storage;
	}

	__(key) {
		return key;
	}

	registerBaseCommands() {
		/*
		 * add command /idle to automatically calculate the current time spent for idle time (pauses, breaks, private time, etc.)
		 */
		this.registerCommand({
			cmd: 'idle',
			description: 'saves the given task as idle time',
			usage: '/idle Pause',
			handle: (_input) => {
				let output = this.add(_input, true);
				this.ask();
				return output;
			},
		});

		/**
		 * add command /realtime to reset /set by setting the system back to real time
		 */
		this.registerCommand({
			cmd: 'realtime',
			description: 'switches from set fixed time to current real time',
			handle: (_input) => {
				if (!this.isRealTime) {
					this.isRealTime = true;
					this.currentTime = Date.now();
					this.say('set back to real time.');
				}
				return this.currentTime;
			},
		});
	}

	load() {
		if (!!this.options.storage) {
			this.options.storage.load();
		}
	}

	notify(options) {
		this.options.onNotify({
			title: 'Trackerino',
			message: 'No Messages (yet?)',
			...options,
		});
	}

	say(text) {
		let cmd = arguments[1] || null;
		this.options.onOutput(text, cmd);
	}

	ask(_q = null) {
		let question = [_q || this.__(`⏱  What have you done?`)];
		let project = this.options.storage.get('project', null);
		let category = this.options.storage.get('category', null);
		if (!!project || !!category) {
			question.push(`[\x1b[36m${[project, category].filter((e) => !!e).join(`\x1b[0m / \x1b[32m`)}\x1b[0m]`);
		}
		this.options.onAsk(question.join(' ') + ' ', this.getAnswer.bind(this), this);
	}

	async getAnswer(_input) {
		let response = {
			command: _input,
			input: _input,
			entity: null,
			data: null,
		};

		this.options.onBeforeAnswer(_input, this);

		if (!_input) {
			this.logError('no input given');
			return;
		}

		// check for commands
		for (let _key in this.commands) {
			let inputParts = _input.split(' ');
			if (inputParts.shift().toLowerCase() == `/${_key}`) {
				response.data = await this.commands[_key].handle(inputParts.join(' '));
				response.command = _key;
				return response;
			}
		}

		if (_input.startsWith('/')) {
			let [full, _id, _action, _value] = _input.match(/^\/([\w\-\_]+)\.?(\w+)?\s?(.+)?/i);

			let entities = ['tasks', 'todos', 'lists', 'projects', 'categories', 'trackers'];
			while (entities.length > 0) {
				let entity = entities.shift();
				let objects = this.storage().get(entity);
				if (!!objects && objects.length > 0) {
					let result = objects.filter((obj) => {
						if (!obj || !obj.get) {
							return false;
						}
						return !!obj.get('id') && obj.get('id') === _id;
					});

					if (!!result && result.length > 0) {
						result = result.shift();
						if (!!_action) {
							if ('object' === typeof result) {
								if ('delete' === _action) {
									if (_value != _id) {
										this.say(`if you want to delete ${entity} with id ${_id} please confirm your deletion request by adding the id to your command: /[id].delete [id]`, _input);
										response.data = false;
									} else {
										objects = objects.filter((obj) => {
											if (!obj || !obj.get || !obj.get('id')) {
												return false;
											}

											if (obj.get('id') == _id) {
												response.entity = obj;
												return false;
											}

											return true;
										});

										if (!response.entity) {
											this.logError(`${entity} with id ${_id} not found!`);
										} else {
											this.storage().set(entity, objects);

											this.say(`${entity} with id ${_id} deleted`, _input);
											response.data = true;
										}
									}
								} else if ('function' === typeof result[_action]) {
									response.data = await result[_action](_value, this);

									if (!!response.data && 'string' === typeof response.data) {
										this.say(response.data, _input);
									}
								} else {
									response.data = result.get(_action);
									if ('undefined' !== typeof response.data) {
										result.set(_action, _value);
									} else {
										this.logError(`no action/property ${_action} on ${_id} found`);
									}
								}
							}
						} else {
							// list object information
							this.say(`available properties/actions for ${_id}:`, _input);
							let props = Object.keys(result.getData());
							response.data = {};
							for (let _key = 0; _key < props.length; _key++) {
								let propName = props[_key];
								if ('function' === typeof result[propName]) {
									this.say(`- ${propName} = ${result.get(propName)}`, _input);
									response.data[propName] = result.get(propName);
								}
							}
						}
						return response;
					}
				}
			}
			this.logError(`command not found ${_input}`);
			return null;
		}

		return this.add(_input);
	}

	getLastTaskEndTime(defaultValue = null) {
		let tasks = this.options.storage.get('tasks');
		if (tasks.length > 0) {
			return tasks[tasks.length - 1].get('ended_at') || this.options.storage.get('started_at', defaultValue);
		}
		return defaultValue || this.options.storage.get('started_at');
	}

	registerCommand(command) {
		try {
			this.commands[command.cmd] = {
				...command,
				...{ handle: command.handle.bind(this) },
			};
		} catch (err) {
			console.log(command);
			console.log(err);
		}
	}

	async save() {
		const callback = arguments[0] || null;

		if (!!this.options.storage) {
			await this.options.storage.save(callback);
		}
	}

	add(description) {
		let isIdle = arguments[1] || false;
		let started_at = this.getLastTaskEndTime(this.options.storage.get('started_at', Date.now()));
		let ended_at = this.isRealTime ? Date.now() : this.currentTime;
		let amount = parseFloat(((ended_at - started_at) / 1000 / 60 / 60).toFixed(2));

		if (!this.options.storage.get('totalAmount', null)) this.options.storage.set('totalAmount', 0);

		this.options.storage.increase('totalAmount', amount);

		let tasks = this.options.storage.get('tasks', []);
		let task = new Models.Task({
			project: !!isIdle ? null : this.options.storage.get('project'),
			category: !!isIdle ? null : this.options.storage.get('category'),
			task: description,
			started_at: started_at,
			ended_at: ended_at,
			is_idle: !!isIdle,
			amount: amount,
		});
		tasks.push(task);

		this.options.storage.set('tasks', tasks);

		if (isIdle) {
			this.say(`😴 pssst... you're ${description || 'sleeping (?!)'} for ${amount} hours (or ${(amount * 60).toFixed(2)} minutes). 💤`);
			if (!!process && !!process.stderr) process.stderr.write('\x07');
		} else {
			this.say(`✅ awesome! that only took you ${amount} hours (or ${(amount * 60).toFixed(2)} minutes). 👍`);
		}

		return task;
	}

	onTick() {
		if (this.isRealTime) {
			this.currentTime = new Date();
		}

		let trackers = this.options.storage.get('trackers', []);
		if (trackers.length > 0) {
			for (let index = 0; index < trackers.length; index++) {
				let tracker = trackers[index];

				tracker.trigger(this);
			}
		}

		this.options.onTick(this);
	}

	onClose() {
		this.quit();
	}

	quit() {
		this.save(() => {
			if (this.ticker !== null) {
				clearInterval(this.ticker);
				this.ticker = null;
			}

			this.options.onClose();
		});
	}

	logError(text) {
		this.options.onError(text);
	}
}

module.exports = Trackerino;
