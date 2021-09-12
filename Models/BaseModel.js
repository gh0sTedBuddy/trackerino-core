const shortid = require('shortid')

class BaseModel {
	constructor () {
		this.data = {
			id: shortid.generate(),
			created_at: Date.now(),
			updated_at: Date.now(),
			deleted_at: null,
			of_type: this.constructor.name
		}
	}

	getData () {
		return this.data
	}

	get (key, _default = null) {
		if(typeof this.data[key] === undefined) {
			return  _default
		}
		return this.data[key]
	}

	set (key, value) {
		this.data[key] = value
		this.data.updated_at = Date.now()
	}

	setInt(key, value) {
		try {
			let intValue = parseInt(value)
			this.set(key, intValue)
		} catch (err) {
		}
	}

	initMethods () {
		let keys = Object.keys(this.data).filter( key => {
			return [
				'id', 'created_at', 'updated_at', 'deleted_at', 'of_type'
			].indexOf(key) < 0
		} )

		for(let _index = 0; _index < keys.length; _index++) {
			let key = keys[_index]
			if(!this[key] && 'object' !== typeof this.data[key]) {
				this[key] = (new_val) => {
					if(new_val !== this.get(key)) {
						this.set(key, new_val)
						return true
					}
					return false
				}
			}

			this['delete'] = () => {
				this.data.deleted_at = Date.now()
			}
		}
	}
}

module.exports = BaseModel