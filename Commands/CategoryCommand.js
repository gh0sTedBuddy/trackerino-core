const Models = require('../Models')

function CategoryCommand (_input) {
	let category = this.options.storage.get('category', null)
	let categories = this.options.storage.get('categories', [])
	if(_input) {
		this.say(`set category to ${ _input }`)
		let cat = categories.filter(category => {
			return category.get('name').toLowerCase() === _input.toLowerCase()
		})

		if(!!cat && cat.length > 0) {
			cat = cat.shift()
			this.options.storage.set('category', cat.get('name'))
			return cat
		} else {
			categories.push(new Models.Category({
				name: _input
			}))
			this.options.storage.set('categories', categories)
			this.options.storage.set('category', _input)
			return categories[categories.length - 1]
		}
	} else {
		this.say('unset category')
		this.options.storage.set('category', null)
		return null
	}
}

module.exports = {
	cmd: 'category',
	description: 'sets and unsets current used category by name',
	params: [{
		name: 'name',
		type: 'String',
		optional: true,
		description: 'the name for the category to be created or selected. if empty the current category gets unset'
	}],
	handle: CategoryCommand
}