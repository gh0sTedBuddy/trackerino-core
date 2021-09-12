const {format} = require('date-fns')

function SetStartCommand (_input, _instance) {
	let regex = /^(\d{2})\:(\d{2})$/
	if(regex.test(_input)) {
		let startedTime = new Date(this.options.storage.get('started_at') || Date.now())
		let [time, hours, minutes] = _input.match(regex)
		hours = parseInt(hours)
		minutes = parseInt(minutes)

		startedTime.setHours(hours)
		startedTime.setMinutes(minutes)
		this.options.storage.set('started_at', startedTime.getTime())

		this.say(`set current time: ${ format(startedTime, this.options.timeFormat) }`)

		let tasks = this.options.storage.get('tasks', [])
		if(!!tasks && tasks.length > 0) {
			let firstTask = tasks[0]
			if(firstTask.started_at != startedTime.getTime()) {
				firstTask.started_at = startedTime.getTime()
				firstTask.amount = parseFloat(((firstTask.ended_at - firstTask.started_at) / 60 / 60).toFixed(2))
				this.say(`adjusted your first task of the day`)
				tasks[0] = firstTask
				this.getAnswer('/tasks')
			}
		}
	} else {
		this.logError(`wrong time format, kept time at current time: ${ format(this.options.storage.get('started_at'), this.options.timeFormat) }`)
	}
}

module.exports = {
	cmd: 'started', // aliases: /start
	aliases: 'start,begin'.split(','),
	description: 'sets the time you started your day',
	handle: SetStartCommand
}