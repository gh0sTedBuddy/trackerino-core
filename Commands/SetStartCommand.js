const {format} = require('date-fns')

function SetStartCommand (_input, _instance) {
	if(!_input) {
		let started_at = this.options.storage.get('started_at', null)

		if(!started_at) {
			this.logError('no starting time defined yet')
			return null
		} else {
			this.say(`you started on: ${ format(started_at, this.options.timeFormat) }`)
		}
	}

	let regex = /^(\d{2})\:(\d{2})$/
	if(regex.test(_input)) {
		let startedTime = new Date(this.options.storage.get('started_at') || Date.now())
		let [time, hours, minutes] = _input.match(regex)
		hours = parseInt(hours)
		minutes = parseInt(minutes)

		startedTime.setHours(hours)
		startedTime.setMinutes(minutes)
		startedTime.setSeconds(0)

		this.options.storage.set('started_at', startedTime.getTime())

		this.say(`set current time: ${ format(startedTime, this.options.timeFormat) }`)

		return startedTime
	} else {
		this.logError(`wrong time format, kept time at current time: ${ format(this.options.storage.get('started_at'), this.options.timeFormat) }`)
		return null
	}
}

module.exports = {
	cmd: 'started',
	aliases: 'start,begin'.split(','),
	description: 'sets the time you started your day',
	params: [{
		name: 'time',
		type: 'String',
		description: 'the starting time in format HH:MM'
	}],
	handle: SetStartCommand
}