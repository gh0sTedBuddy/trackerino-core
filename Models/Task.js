const ProjectModel = require('./Project')
const CategoryModel = require('./Category')
const BaseModel = require('./BaseModel')

class Task extends BaseModel {
	constructor () {
		super()

		this.data = {
			...this.data,
			task: '',
			project: null,
			category: null,
			started_at: Date.now(),
			ended_at: null,
			is_idle: false,
			...(arguments[0] || {})
		}

		this.initMethods()
	}

	project (_value, _interface) {
		const projects = _interface.options.storage.get('projects', [])
		if(!!_value) {
			console.log(`set project of ${ this.get('id') } to ${ _value }`)
			let proj = projects.filter(project => {
				return project.get('name').toLowerCase() === _value.toLowerCase()
			})

			if(!!proj && proj.length > 0) {
				proj = proj.shift()
			} else {
				projects.push(new ProjectModel({
					name: _value
				}))
				_interface.options.storage.set('projects', projects)
			}
			this.data.project = _value
		}
	}

	category (_value, _interface) {
		const categories = _interface.options.storage.get('categories', [])
		if(!!_value) {
			console.log(`set category of ${ this.get('id') } to ${ _value }`)
			let proj = categories.filter(category => {
				return category.get('name').toLowerCase() === _value.toLowerCase()
			})

			if(!!proj && proj.length > 0) {
				proj = proj.shift()
			} else {
				categories.push(new CategoryModel({
					name: _value
				}))
				_interface.options.storage.set('categories', categories)
			}
			this.data.category = _value
		}
	}
}

module.exports = Task