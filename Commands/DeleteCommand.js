function DeleteCommand (_input) {
	let tasks = this.options.storage.get('tasks', [])
	try {
		let deleteIndex = parseInt(_input)
		if(deleteIndex != NaN && deleteIndex >= 0 && deleteIndex < tasks.length) {

			tasks = tasks.filter((task, _index) => {
				return task !== null && _index !== deleteIndex
			})

			this.say(`task with index ${ deleteIndex } was deleted`)
		}

		this.options.storage.set('tasks', tasks)
	} catch(err) {
		this.logError(err)
	}

	this.getAnswer('/tasks')
}

module.exports = {
	cmd: 'delete',
	description: 'deletes an task entry.',
	handle: DeleteCommand
}