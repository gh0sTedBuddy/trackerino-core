const axios = require('axios')
const BaseModel = require('./BaseModel')

const slugify = require('../Helpers/slugify')

class Category extends BaseModel {
	constructor () {
		super()

		this.data = {
			...this.data,
			slug: null,
			project: null,
			company: null,
			amount: 0.0,
			days_config: null,
			...(arguments[0] || {})
		}

		if(!!this.data.name) {
			this.data.slug = slugify(this.data.name)
		}
	}

	company(_value, _interface) {
		if(!!_value) {
			this.data.company = _value
		}
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
				proj = new ProjectModel({
					name: _value
				})

				projects.push(proj)

				_interface.options.storage.set('projects', projects)
			}
			this.data.project = proj.get('name', _value)
		}
	}

	days(_value, _interface) {
		if(!!_value) {
			let available_days = ['mo','tu','we','th','fr','sa','su']
			let days = _value.split(',')
			days.map(day => {
				if(day.indexOf('-') > 2) {
					// day span
				}
			})
			_interface.say(`TODO: interpret ${ _value } to save days_config`)
			// this.data.days_config = _value
		}
	}

	select (_value, _interface) {
		_interface.getAnswer(`/category ${this.get('name', _value || null)}`)
	}
}

module.exports = Category