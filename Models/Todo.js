const BaseModel = require('./BaseModel')

class Todo extends BaseModel {
	constructor () {
		super()

		this.data = {
			...this.data,
			task: '',
			project: null,
			expires_at: null,
			...(arguments[0] || {})
		}
	}
}

module.exports = Todo