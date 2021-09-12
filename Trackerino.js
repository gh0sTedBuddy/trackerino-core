const CommandList = require('./Commands')
const shortid = require('shortid')

const Models = require('./Models')

const slugify = require('./Helpers/slugify')

class Trackerino {
	constructor () {
		this.name = "trackerino"
		this.version = "0.0.1"
		this.currentTime = null
		this.ticker = null
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
				onError: () => {}
			},
			...(arguments[0] || {})
		}

		this.commands = {}
		this.init()
	}

	init () {
		this.isRealTime = !this.options.date
		this.currentTime = this.options.date || Date.now()

		for(let _key in CommandList) {
			this.registerCommand(CommandList[_key])
		}

		this.registerBaseCommands ()

		this.load()

		this.say(this.__(`⏰ Welcome to ${ this.name }`))

		this.ask()

		this.ticker = setInterval(this.onTick.bind(this), 1000)
	}

	storage () {
		return this.options.storage
	}

	__ (key) {
		return key
	}

	registerBaseCommands () {
		/*
		* add command /idle to automatically calculate the current time spent for idle time (pauses, breaks, private time, etc.)
		*/
		this.registerCommand({
			cmd: 'idle',
			handle: _input => {
				this.add(_input, true)
				return this.ask()
			}
		})

		/**
		* add command /realtime to reset /set by setting the system back to real time
		*/
		this.registerCommand({
			cmd: 'realtime',
			handle: _input => {
				if(!this.isRealTime) {
					this.isRealTime = true
					this.currentTime = Date.now()
					this.say('set back to real time.')
				}
				return this.ask()
			}
		})
	}

	load () {
		if(!!this.options.storage) {
			this.options.storage.load()
		}
	}

	notify(options) {
		this.options.onNotify({
			title: 'Trackerino',
			message: 'No Messages (yet?)',
			...options
		})
	}

	say (text) {
		let cmd = arguments[1] || null
		this.options.onOutput(text, cmd)
	}

	ask () {
		let question = [this.__(`⏱  What have you done?`)]
		let project = this.options.storage.get('project', null)
		let category = this.options.storage.get('category', null)
		if(!!project || !!category) {
			question.push(`[\x1b[36m${ [project,category].filter(e => !!e).join(`\x1b[0m / \x1b[32m`) }\x1b[0m]`)
		}
		this.options.onAsk(question.join(' ') + ' ', this.getAnswer.bind(this))
	}

	async getAnswer (_input) {
		if(!_input) {
			this.logError('no description given')
			return this.ask()
		}

		if(_input.toLowerCase() == 'q' || _input.toLowerCase() == 'quit') {
			return this.onClose()
		}

		if(_input.toLowerCase() == 'clear') {
			console.clear()
			return this.ask()
		}

		// check for commands
		for(let _key in this.commands) {
			let inputParts = _input.split(' ')
			if(inputParts.shift().toLowerCase() == `/${ _key }`) {
				this.commands[_key].handle(inputParts.join(' '))
				return this.ask()
			}
		}

		if(_input.startsWith('/')) {
			let [full, _id, _action, _value] = _input.match(/^\/([\w\-\_]+)\.?(\w+)?\s?(.+)?/i)

			let entities = ['tasks', 'todos', 'lists', 'projects', 'categories', 'trackers']
			while(entities.length > 0) {
				let entity = entities.shift()
				let objects = this.storage().get(entity)
				if(!!objects && objects.length > 0) {
					let result = objects.filter(obj => {
						if(!obj || !obj.get) {
							return false
						}
						return !!obj.get('id') && obj.get('id') === _id
					})


					if(!!result && result.length > 0) {
						result = result.shift()
						if(!!_action) {
							if('object' === typeof result) {
								if('delete' === _action) {
									if(_value != _id) {
										this.say(`if you want to delete ${ entity } with id ${ _id } please confirm your deletion request by adding the id to your command: /[id].delete [id]`)
									} else {
										objects = objects.filter(obj => {
											if(!obj || !obj.get) {
												return false
											}
											return !!obj.get('id') && obj.get('id') !== _id
										})
										this.storage().set(entity, objects)

										this.say(`${ entity } with id ${ _id } deleted`)
									}
									return this.ask()
								} else if('function' === typeof result[_action]) {
									let output = await result[_action](_value, this)

									if(!!output && 'string' === typeof output) {
										this.say(output)
									}
								} else {
									let property = result.get(_action)
									if('undefined' !== typeof property) {
										result.set(_action, _value)
									} else {
										this.logError(`no action/property ${ _action } on ${ _id } found`)
									}
								}
							}
							return this.ask()
						} else {
							// list object information
							this.say(`available properties/actions for ${ _id }:`)
							let props = Object.keys(result.getData())
							for (let _key = 0; _key < props.length; _key++) {
								let propName = props[_key]
								if('function' === typeof result[propName]) {
									this.say(`- ${ propName } = ${result.get(propName)}`)
								}
							}
							return this.ask()
						}
						break
					}
				}
			}
			this.logError(`command not found ${ _input }`)
			return this.ask()
		}

		this.add(_input)

		this.ask()
	}

	getLastTaskEndTime (defaultValue = null) {
		let tasks = this.options.storage.get('tasks')
		if(tasks.length > 0) {
			return tasks[tasks.length-1].get('ended_at') || this.options.storage.get('started_at', defaultValue)
		}
		return defaultValue || this.options.storage.get('started_at')
	}

	registerCommand (command) {
		try {
			this.commands[command.cmd] = {
				...command,
				...{ handle: command.handle.bind(this) }
			}
		} catch(err) {
			console.log(command)
			console.log(err)
		}
	}

	async save () {
		const callback = arguments[0] || null

		if(!!this.options.storage) {
			await this.options.storage.save(callback)
		}
	}

	add (task) {
		let isIdle = arguments[1] || false
		let started_at = this.getLastTaskEndTime(this.options.storage.get('started_at', Date.now()))
		let ended_at = this.isRealTime ? Date.now() : this.currentTime
		let amount = parseFloat(((ended_at - started_at) / 1000 / 60 / 60).toFixed(2))

		if(!this.options.storage.get('totalAmount')) this.options.storage.set('totalAmount', 0)

		this.options.storage.increase('totalAmount', amount)

		let tasks = this.options.storage.get('tasks', [])

		tasks.push(new Models.Task({
			project: !!isIdle ? null : this.options.storage.get('project'),
			category: !!isIdle ? null : this.options.storage.get('category'),
			task: task,
			started_at: started_at,
			ended_at: ended_at,
			is_idle: !!isIdle,
			amount: amount
		}))

		this.options.storage.set('tasks', tasks)

		if(isIdle) {
			this.say(`😴 pssst... you're ${ task || 'sleeping (?!)' } for ${ amount } hours (or ${ (amount * 60).toFixed(2) } minutes). 💤`)
			if(!!process && !!process.stderr) process.stderr.write("\x07")
		} else {
			this.say(`✅ awesome! that only took you ${ amount } hours (or ${ (amount * 60).toFixed(2) } minutes). 👍`)
		}
	}

	onTick () {
		if (this.isRealTime) {
			this.currentTime = new Date()
		}

		let trackers = this.options.storage.get('trackers', [])
		if(trackers.length > 0) {
			for(let index = 0; index < trackers.length; index ++) {
				let tracker = trackers[index]

				tracker.trigger(this)
			}
		}

		this.options.onTick(this)
	}

	onClose () {
		this.save(() => {
			this.say("\n👋 BYE 😊\n")
			if(this.ticker !== null) {
				clearInterval(this.ticker)
				this.ticker = null
			}
			process.exit(0)
		})
	}

	logError(text) {
		this.options.onError(text)
	}
}

module.exports = Trackerino