const {format} = require('date-fns')
function TodayCommand (_input, _instance) {
	let result = {
		started_at: this.options.storage.get('started_at', null),
		project: this.options.storage.get('project', null),
		category: this.options.storage.get('category', null),
		tasks: [],
		total: 0,
		idle: 0
	}

	let tasks = this.options.storage.get('tasks', [])
	let totalTime = 0
	let idleTime = 0
	this.say(format(this.currentTime, this.options.dateFormat))
	tasks.map((task, index) => {
		if(!task) return
		let output = [
			`[${ totalTime.toFixed(2) } ${ !!task.get('is_idle') ? '\x1b[47m' : '\x1b[32m' } +${ (task.get('amount') || 0.0).toFixed(2) } ${ '\x1b[0m' }]`
		]

		output.push(`${ format(task.get('started_at'), this.options.timeFormat) }-${ format(task.get('ended_at'), this.options.timeFormat) }`)
		let _taskinfo = [`#${task.get('id')}`]

		if(task.get('project')) {
			_taskinfo.push(`\x1b[46m ${ task.get('project') } \x1b[0m`)
		}

		if(task.get('category')) {
			_taskinfo.push(`\x1b[36m${ task.get('category') }\x1b[0m`)
		}

		output.push([_taskinfo.join(':'), task.get('task')].join(' '))

		if(!!task.get('is_idle')) {
			idleTime += task.get('amount')
		}
		totalTime += task.get('amount')

		result.tasks.push({
			id: task.get('id'),
			task: task.get('task'),
			category: task.get('category', null),
			project: task.get('project', null),
			amount: task.get('amount', 0),
			progress: totalTime,
			is_idle: task.get('is_idle', false),
			idle_time: idleTime
		})

		this.say(output.join("\t"))
	})
	this.say(
		`[${ (totalTime).toFixed(2) }] total time today.`,
		`[${ (idleTime).toFixed(2) }] idle`
	)
	this.say(`[${ (totalTime - idleTime).toFixed(2) }] total work today.`)

	result.total = totalTime
	result.idle = idleTime

	return result
}

module.exports = {
	cmd: 'today',
	description: 'list all tasks for today and show how much time you invested to finish them',
	handle: TodayCommand
}