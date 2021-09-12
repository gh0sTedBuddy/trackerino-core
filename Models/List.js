const BaseModel = require('./BaseModel')
const ListItem = require('./ListItem')

class List extends BaseModel {
	hidden = [];
	constructor () {
		super()

		this.data = {
			...this.data,
			name: '',
			items: [],
			...(arguments[0] || {})
		}

		this.initMethods()

		if(!!this.data.items && this.data.items.length > 0) {
			this.data.items = this.data.items.map(itm => {
				return new ListItem(itm)
			})
		}
	}

	getData () {
		return {
			...this.data,
			items: this.data.items.map(itm => itm.getData())
		}
	}

	check (_entry) {
		for(let _index = 0; _index < this.data.items.length; _index ++) {
			if(this.data.items[_index].get('id') === _entry) {
				this.data.items[_index].set('is_checked', true)
				break
			}
		}
	}

	uncheck (_entry) {
		for(let _index = 0; _index < this.data.items.length; _index ++) {
			if(this.data.items[_index].get('id') === _entry) {
				this.data.items[_index].set('is_checked', false)
				break
			}
		}
	}

	add (_entry) {
		this.data.items.push(new ListItem({
			title: _entry
		}))
	}

	remove (_entry) {
		this.data.items = this.data.items.filter(itm => itm.get('id') != _entry)
	}

	done (_entry, _interface) {
		if(!_entry) {
			_interface.say('no entry given. please provide id of the done list entry item')
			return
		}

		// search for entry
		let item = this.data.items.filter(item => {
			return item.get('id') == _entry
		})

		if(item.length > 0) {
			item = item.shift()
		}

		if(item.get('is_checked')) {
			console.log('already done. please uncheck first.')
		} else {
			_interface.getAnswer(`/${ this.get('id') }.check ${ _entry }`)
			_interface.getAnswer(item.get('title'))
		}
	}

	list (_value, _interface) {
		return this.show(_value, _interface)
	}

	show (_value, _interface) {
		let output = []

		for(let _index  = 0; _index < this.data.items.length; _index++) {
			let itm = this.data.items[_index]
			if((_value === 'checked' && !itm.get('is_checked')) || (_value === 'unchecked' && itm.get('is_checked'))) continue;
			output.push([
				itm.get('is_checked') ? '[✅]' : '[  ]',
				`- [${ itm.get('id') }] ${ itm.get('title') }`
			].join("\t"))
		}
		output = [
			`${ this.get('name') } (${ output.length } of ${ this.data.items.length } items)`,
			...output
		]
		return output.join("\n")
	}
}

module.exports = List