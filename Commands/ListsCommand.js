function ListsCommand (_input, _instance) {
	let lists = this.options.storage.get('lists', [])
	this.say(`${ lists.length } list(s):`)
	lists.map((list, index) => {
		this.say(`[${ list.get('id') }] ${ list.get('name') } (${ list.get('items').length } items)`)
	})
}

module.exports = {
	cmd: 'lists',
	description: 'prints all lists',
	handle: ListsCommand
}