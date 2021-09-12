function DoneCommand (_input, _instance) {
	let todos = this.options.storage.get('todos', [])
	let currentProject = this.options.storage.get('project')
	try {
		let doneIndex = parseInt(_input)
		if(doneIndex >= 0) {
			if(doneIndex <= todos.length - 1) {
				let oldProject = currentProject
				currentProject = todos[doneIndex].get('project') || null
				this.add(todos[doneIndex].get('task'))
				currentProject = oldProject
				this.options.storage.set('todos', todos.filter((todo, index) => index !== doneIndex))
			} else {
				this.logError('no valid index given')
			}
		} else {
			console.log('ERR no valid done index')
		}
	} catch(err) {
		console.log('ERR ' . err)
	}
}

module.exports = {
	cmd: 'done',
	description: 'marks an todo as "done".',
	handle: DoneCommand
}