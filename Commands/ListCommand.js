const Models = require('../Models')
function ListCommand (_input, _instance) {
	let project = this.options.storage.get('project', null)
	let lists = this.options.storage.get('lists', [])
	let check = lists.filter(list => list.get('name').toLowerCase() == _input.toLowerCase()).shift()
	if(check) {
		this.logError(`list ${ _input } already exists`)
		return null
	} else {
		lists.push(new Models.List({
			name: _input
		}))

		this.options.storage.set('lists', lists)

		this.say(`➕ created list: ${ _input }`)
		return lists[lists.length - 1]
	}
}

module.exports = {
	cmd: 'list',
	description: 'creates a new list',
	params: [{
		name: 'name',
		type: 'String',
		description: 'the name for the new list to be created'
	}],
	handle: ListCommand
}