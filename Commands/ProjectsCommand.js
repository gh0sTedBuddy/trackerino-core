const {format} = require('date-fns')
const shortid = require('shortid')
function ProjectsCommand (_input) {
	let projects = this.options.storage.get('projects', [])
	if(!!projects && projects.length) {
		if(!!_input) {
			let tasks = []
			let files = this.options.storage.getAll()

			for(let _index = 0; _index < files.length; _index++) {
				try {
					let content = files[_index]
					if(!!content && !!content.tasks && content.tasks.length > 0) {
						let dayTasks = content.tasks.filter(task => !!task && !!task.project && task.project.toLowerCase() === _input.toLowerCase())
						tasks = [...tasks, ...dayTasks]
						let dayAmount = dayTasks.reduce((v,t) => v+t.amount, 0)
						if(dayAmount > 0) {
							this.say(`${ format(content.started_at, this.options.dateFormat) } (${ dayTasks.length }): ${ dayAmount.toFixed(2) } hours`)
						}
					}
				} catch(err) {
					this.logError(err)
				}
			}

			if(tasks.length > 0) {

				let projects = this.options.storage.get('projects')
				let _amount = tasks.reduce((v,t) => v + t.amount, 0.0)

				projects = projects.map(proj => {
					if(proj.get('name').toLowerCase() == _input.toLowerCase()) {
						proj.set('amount', _amount)
						proj.amount = _amount
					}

					return proj
				})

				this.options.storage.set('projects', projects)

				this.say(`${ _input } => ${ _amount.toFixed(2) }`)
			}
			// **/
		} else {
			let currentProject = this.options.storage.get('project', null)
			if(!!projects && projects.length > 0) {
				projects.map((project, _index) => {
					if(!project || !project.get('name')) return

					let output = [project.get('id')]
					if(!!currentProject && project.get('name').toLowerCase() === currentProject.toLowerCase()) {
						output.push(['[\x1b[36m', 'X', '\x1b[0m]'].join(''))
					} else {
						output.push('[ ]')
					}

					output.push(`${ '\x1b[32m' }${ project.get('amount').toFixed(2) }${ '\x1b[0m' }`)
					output.push(project.get('name'))

					this.say(output.join("\t"))
				})
			}
		}

	} else {
		this.logError(`no projects yet`)
		this.say(`add projects by /project [PROJECTNAME]`)
	}
}

module.exports = {
	cmd: 'projects',
	description: 'prints a list of all current projects',
	handle: ProjectsCommand
}