const Models = require('../Models')
function ListCommand (_input, _instance) {
	let project = this.options.storage.get('project', null)
	let lists = this.options.storage.get('lists', [])
	this.say(`➕ created list: ${ _input }`)

	lists.push(new Models.List({
		name: _input
	}))

	this.options.storage.set('lists', lists)
}

module.exports = {
	cmd: 'list',
	description: 'adds a new list',
	handle: ListCommand
}