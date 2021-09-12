const axios = require('axios')
const BaseModel = require('./BaseModel')

const slugify = require('../Helpers/slugify')

const {format} = require('date-fns')

class Project extends BaseModel {
	constructor () {
		super()

		this.data = {
			...this.data,
			redmine_api_endpoint: null,
			redmine_api_key: null,
			mite_api_endpoint: null,
			mite_api_key: null,
			name: '',
			company: null,
			slug: null,
			amount: 0.0,
			...(arguments[0] || {})
		}

		if(!!this.data.name) {
			this.data.slug = slugify(this.data.name)
		}
	}

	select (_value, _interface) {
		_interface.getAnswer(`/project ${this.get('name', _value || null)}`)
	}

	_exportCSV (tasks, _interface) {
		let csvData = []
		csvData.push([
			"DATE",
			"START",
			"END",
			"AMOUNT",
			"COMPANY",
			"PROJECT",
			"CATEGORY",
			"TASK",
		])

		tasks.map(task => csvData.push([
			format(task.started_at, _interface.options.dateFormat),
			format(task.started_at, _interface.options.timeFormat),
			format(task.ended_at, _interface.options.timeFormat),
			task.amount.toFixed(2).split('.').join(','),
			this.get('company'),
			task.project,
			task.category || '',
			task.task
		]))

		return csvData.map(entry => {
			return `"${ entry.join("\"\t\"") }"`
		}).join("\n")
	}

	async export (_value, _interface) {
		let onlyToday = _value.indexOf('--today') >= 0

		_value = _value.split(' ').filter(_i => _i != '--today').join(' ').trim()

		let tasks = []

		if(onlyToday) {
			tasks = _interface.options.storage.get('tasks')

			if(tasks.length) {
				tasks = tasks.filter(_task => _task && _task.get('project') && _task.get('project') == this.get('name'))
			}
		} else {
			const files = _interface.options.storage.getAll()
			files.forEach(file => {
				if(file.tasks && file.tasks.length > 0) {
					file.tasks.filter(_task => {
						return _task && _task.project && _task.project == this.get('name')
					}).forEach(task => tasks.push(task))
				}
			})
		}

		if(!!_value && 'string' === typeof _value) {
			_value = _value.toLowerCase()
		}

		switch(_value) {
			default:
				_interface.say(`unknown format: ${_value}; switch to default: csv`)
			case 'csv':
				_interface.say(this._exportCSV(tasks, _interface))
				break
			case 'json':
				break
			case 'mite':
				const mite_api_endpoint = this.get('mite_api_endpoint')
				const mite_api_key = this.get('mite_api_key')
				if(!mite_api_endpoint || !mite_api_key) {
					_interface.say(`api endpoint or key is missing:\n\t/${this.get('id')}.mite_api_endpoint [YOUR ENDPOINT]\n\t/${this.get('id')}.mite_api_key [YOUR KEY]\n`)
					return
				}

				const projects = await axios.get(`${ mite_api_endpoint }/projects.json?api_key=${ mite_api_key }`)
				const services = await axios.get(`${ mite_api_endpoint }/services.json?api_key=${ mite_api_key }`)

				for(let _index = 0; _index < tasks.length; _index++) {
					const task = tasks[_index]
					if(!task.get('is_idle')) {
						try {
							let project = projects.data.find(entry => entry.project.name.toLowerCase() == task.get('project').toLowerCase())
							let service = services.data.find(entry => entry.service.name.toLowerCase() == task.get('category').toLowerCase())
							if(project) {
								project = project.project
							}
							if(service) {
								service = service.service
							}

							let data = {
								api_key: mite_api_key,
								time_entry: {
									date_at: format(task.get('started_at'), _interface.options.dateFormat),
									minutes: task.get('amount') * 60,
									note: [
										`(${format(task.get('started_at'), _interface.options.timeFormat)} bis ${format(task.get('ended_at'), _interface.options.timeFormat)})`,
										task.get('task')
									].join(' '),
									project_id: project ? project.id : null,
									service_id: service ? service.id : null
								}
							}
							let resp = await axios.post(`${ mite_api_endpoint }/time_entries.json`, data)
							if (resp.data && resp.data.time_entry && resp.data.time_entry.id) {
								_interface.say(`task ${task.get('id')} sent to mite`)
							}
						} catch(err) {
							console.log(err)
						}
					}
				}
				break
			case 'redmine':
				const redmine_api_endpoint = this.get('redmine_api_endpoint')
				const redmine_api_key = this.get('redmine_api_key')
				if(!redmine_api_endpoint || !redmine_api_key) {
					_interface.say(`api endpoint or key is missing:\n\t/${this.get('id')}.redmine_api_endpoint [YOUR ENDPOINT]\n\t/${this.get('id')}.redmine_api_key [YOUR KEY]\n`)
					return
				}

				// try to send post requests for each task to redmine
				for(let _index = 0; _index < tasks.length; _index++) {
					const task = tasks[_index]
					if(!task.is_idle) {
						await axios.post(redmine_api_endpoint, {
							key: redmine_api_key,
							time_entry: {
								spent_on: format(task.started_at, _interface.options.dateFormat),
								issue_id: 7938,
								project_id: 116,
								hours: task.amount,
								comments: task.task
							}
						})
					}
				}

				break
		}
	}

	redmine_api_endpoint (_value, _interface) {
		if(!!_value) {
			this.data.redmine_api_endpoint = _value
		}
	}

	redmine_api_key (_value, _interface) {
		if(!!_value) {
			this.data.redmine_api_key = _value
		}
	}

	mite_api_endpoint (_value, _interface) {
		if(!!_value) {
			this.data.mite_api_endpoint = _value
		}
	}

	mite_api_key (_value, _interface) {
		if(!!_value) {
			this.data.mite_api_key = _value
		}
	}

	company(_value, _interface) {
		if(!!_value) {
			this.data.company = _value
		}
	}
}

module.exports = Project