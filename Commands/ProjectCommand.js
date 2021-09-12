const Models = require('../Models')

function ProjectCommand (_input) {
	let project = this.options.storage.get('project', null)
	let projects = this.options.storage.get('projects', [])
	if(_input) {
		console.log(`set project to ${ _input }`)
		let proj = projects.filter(project => {
			return project.get('name').toLowerCase() === _input.toLowerCase()
		})

		if(!!proj && proj.length > 0) {
			proj = proj.shift()
			this.options.storage.set('project', proj.get('name'))
		} else {
			projects.push(new Models.Project({
				name: _input
			}))
			this.options.storage.set('projects', projects)
			this.options.storage.set('project', _input)
		}
	} else {
		this.options.storage.set('project', null)
	}
}

module.exports = {
	cmd: 'project',
	description: 'sets project or starts dialog for creating new project',
	handle: ProjectCommand
}