const BaseModel = require('./BaseModel')

class ListItem extends BaseModel {
	constructor () {
		super()

		this.data = {
			...this.data,
			title: '',
			is_checked: false,
			url: '',
			expires_at: null,
			...(arguments[0] || {})
		}
	}
}

module.exports = ListItem