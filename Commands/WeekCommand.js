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
			let _date = format(_day.started_at, this.options.dateFormat)
			let _dayAmount = 0
			_day.tasks.forEach(task => {
				let _amount = task.amount || 0
				let _project = task.project || 'other'
				let _category = task.category || 'other'
				_total += _amount
				_dayAmount += _amount

				if(!categories[_category]) {
					categories[_category] = 0
				}
				categories[_category] += _amount

				if(!projects[_project]) {
					projects[_project] = 0
				}
				projects[_project] += _amount
			})
			this.say('######')
			this.say(`# ${ _date }: ${ _dayAmount } h`)
		}
	})

	this.say('######')
	this.say(`TOTAL:\t${_total} h`)

	if(Object.values(projects).filter(v => v > 0).length > 0) {
		this.say('by projects:')
		Object.keys(projects).forEach(_key => {
			this.say(`\t- ${_key}:\t\t${projects[_key]} h`)
		})
	}

	if(Object.values(categories).filter(v => v > 0).length > 0) {
		this.say('by categories:')
		Object.keys(categories).forEach(_key => {
			this.say(`\t- ${_key}:\t\t${categories[_key]} h`)
		})
	}
}

module.exports = {
	cmd: 'week',
	description: 'lists a summary of the current week',
	handle: WeekCommand
}