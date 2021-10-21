const {format, startOfWeek, endOfWeek} = require('date-fns')

function WeekCommand (_input, _instance) {
	this.say(`Summary for week #${ format(new Date(), 'w') }`)
	let allDays = this.options.storage.getAll()
	allDays.map((day, _index) => {
		this.say(day)
	})
}

module.exports = {
	cmd: 'week',
	description: 'lists a summary of the current week',
	handle: WeekCommand
}