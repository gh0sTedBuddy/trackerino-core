const {format, startOfWeek, endOfWeek, addDays} = require('date-fns')

function WeekCommand (_input, _instance) {
	let _total = 0
	let week_started_at = startOfWeek(new Date(), { weekStartsOn: 1 })
	let week_ended_at = endOfWeek (new Date(), {weekStartsOn: 1})

	this.say(`Summary for week #${ format(new Date(), 'w') }`)
	let allDays = (this.options.storage.getAll() || []).filter(_day => _day.started_at && _day.started_at >= week_started_at && _day.started_at < week_ended_at)
	let categories = {
		other: 0
	}
	let projects = {
		other: 0
	}

	allDays.forEach(_day => {
		if(Array.isArray(_day.tasks) && _day.tasks.length > 0) {
			_day.tasks.forEach(task => {
				if(task.category) {
					if(!categories[task.category]) {
						categories[task.category] = 0
					}
					categories[task.category] += (task.amount || 0)
				} else {
					categories.other += (task.amount || 0)
				}

				if(task.project) {
					if(!projects[task.project]) {
						projects[task.project] = 0
					}

					projects[task.project] += (task.amount || 0)
				} else {
					projects.other += (task.amount || 0)
				}
			})
		}
	})

	if(Object.values(projects).length > 0) {
		this.say('by projects:')
		Object.keys(projects).forEach(_key => {
			this.say(`\t- ${_key}:\t\t${projects[_key]} h`)
		})
	}

	if(Object.values(categories).length > 0) {
		this.say('by categories:')
		Object.keys(categories).forEach(_key => {
			this.say(`\t- ${_key}:\t\t${categories[_key]} h`)
		})
	}

	this.say(`TOTAL:\t${_total} h`)
}

module.exports = {
	cmd: 'week',
	description: 'lists a summary of the current week',
	handle: WeekCommand
}