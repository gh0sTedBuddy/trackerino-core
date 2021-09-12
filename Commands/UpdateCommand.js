function UpdateCommand (_input, _instance) {
	let tasks = this.options.storage.get('tasks', [])
	try {
		let inputParts = _input.split(' ')
		let updateIndex = parseInt(inputParts.shift())
		let correction = parseFloat(inputParts.shift() || 0)
		let description = inputParts.join(' ')
		if(updateIndex >= 0 && updateIndex < tasks.length) {
			let task = tasks[updateIndex]

			if(correction !== 0) {
				task.set('amount', task.get('amount')  + correction)
				task.set('ended_at', task.get('ended_at')  + (correction * 60 * 60))
			}

			if(description) {
				task.set('task', description)
			}

			tasks[updateIndex] = task
			this.options.storage.set('tasks', tasks)
			this.say(`updated task #${ updateIndex } with ${ correction } hours`, !!description ? `and new description: ${ '\x1b[2m' }${ description }${ '\x1b[0m' }` : '')
			this.getAnswer('/tasks')
		} else {
			this.say(`ERR: no task index given`)
		}
	} catch(err) {
		this.logError(err)
	}
}

module.exports = {
	cmd: 'update',
	description: 'updates an task by its index',
	handle: UpdateCommand
}