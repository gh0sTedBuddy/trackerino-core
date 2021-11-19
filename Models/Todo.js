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

	done (_interface) {
		_interface.getAnswer(`/${ this.get('id') }.delete ${ this.get('id') }`)
		_interface.getAnswer(`${ this.get('task') }`)
		return true
	}
}

module.exports = Todo