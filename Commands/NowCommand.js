const {format, differenceInMinutes, differenceInSeconds} = require('date-fns')

function NowCommand (_input) {
	let started_at = this.options.storage.get('started_at')

	const tasks = this.options.storage.get('tasks', [])
	const categories = this.options.storage.get('categories', [])

	let result = {
		started_at: started_at,
		current_time: this.currentTime,
		daily_work_time: (this.options.storage.get('config').daily_work_time || 0),
		last_entry_at: null,
		work_time: 0,
		time_left: 0
	}

	this.say([
		`You started at: ${ format(started_at, this.options.timeFormat) }`,
		`and now is: ${ format(this.currentTime, this.options.timeFormat) }.`
	].join(' '))

	let dailyWorkTime = result.daily_work_time
	if(!!tasks && tasks.length > 0) {
		let workTime = tasks.filter(task => !task.get('is_idle')).map(task => task.get('amount')).reduce((a,c) => a+c)
		let lastEntry = tasks[tasks.length - 1]

		if(dailyWorkTime > 0 && workTime >= 0) {
			let timeLeft =  dailyWorkTime - workTime
			if(timeLeft > 0) {
				timeLeft = `${ timeLeft.toFixed(2) } hours left (${ (timeLeft * 60).toFixed(2) } mins)`
			} else {
				timeLeft = timeLeft.toFixed(2)
			}
			this.say(`Total work today: ${workTime.toFixed(2)}/${dailyWorkTime.toFixed(2)} hours, ${timeLeft}`)
			result.time_left = timeLeft * 60 * 60
		}

		if(lastEntry && lastEntry.get('ended_at')) {
			this.say(`You ended your last task at: ${ format(lastEntry.get('ended_at'), this.options.timeFormat) } (${ differenceInMinutes(this.currentTime, lastEntry.get('ended_at')) } minutes ago).`)
			result.last_entry_at = lastEntry.get('ended_at', null)
		}

		result.work_time = (dailyWorkTime || 0) * 60 * 60
	}

	return result
}

module.exports = {
	cmd: 'now',
	description: 'shows you important data about the current moment',
	handle: NowCommand
}