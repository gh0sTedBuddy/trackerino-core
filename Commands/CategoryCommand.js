const Models = require('../Models')

function CategoryCommand (_input) {
	let category = this.options.storage.get('category', null)
	let categories = this.options.storage.get('categories', [])
	if(_input) {
		console.log(`set category to ${ _input }`)
		let cat = categories.filter(category => {
			return category.get('name').toLowerCase() === _input.toLowerCase()
		})

		if(!!cat && cat.length > 0) {
			cat = cat.shift()
			this.options.storage.set('category', cat.get('name'))
		} else {
			categories.push(new Models.Category({
				name: _input
			}))
			this.options.storage.set('categories', categories)
			this.options.storage.set('category', _input)
		}
	} else {
		this.options.storage.set('category', null)
	}
}

module.exports = {
	cmd: 'category',
	description: 'sets category or starts dialog for creating new category',
	handle: CategoryCommand
}