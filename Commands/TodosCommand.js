function TodosCommand (_input, _instance) {
	let todos = this.options.storage.get('todos', [])
	let currentProject = this.options.storage.get('project', null)
	if(todos && todos.length > 0) {
		let output = []
		for(let index = 0; index < todos.length; index++) {
			let entry = todos[index]
			if(!!entry && entry.get && (!currentProject || (currentProject != null && currentProject == entry.get('project')))) {
				output.push(`☑️  [${ index }] ${ (entry.get('project') ? `[${ entry.get('project') }] ` : '') }${ entry.get('task') }`)
			}
		}
		console.log(`## ${ output.length } todos:`)
		output.map(line => {
			console.log(line)
		})
		console.log(`to finish a task just enter /todo #[index]`)
	}
}

module.exports = {
	cmd: 'todos',
	description: 'prints a list of all current todos',
	handle: TodosCommand
}