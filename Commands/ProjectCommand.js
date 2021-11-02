const Models = require('../Models')

function ProjectCommand (_input) {
	let project = this.options.storage.get('project', null)
	let projects = this.options.storage.get('projects', [])
	if(_input) {
		this.say(`set project to ${ _input }`)
		let proj = projects.filter(project => project.get('name').toLowerCase() == _input.toLowerCase() || project.get('id') == _input.toLowerCase()).shift()

		if(proj) {
			this.options.storage.set('project', proj.get('name'))
			return proj
		} else {
			projects.push(new Models.Project({
				name: _input
			}))

			this.options.storage.set('projects', projects)
			this.options.storage.set('project', _input)

			return projects[projects.length - 1]
		}
	} else {
		this.options.storage.set('project', null)
		return null
	}
}

module.exports = {
	cmd: 'project',
	description: 'sets project or starts dialog for creating new project',
	params: [{
		name: 'name',
		type: 'String',
		description: 'the name for the new project to be created'
	}],
	handle: ProjectCommand
}