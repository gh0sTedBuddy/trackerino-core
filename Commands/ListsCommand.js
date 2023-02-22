function ListsCommand(_input, _instance) {
	let lists = this.options.storage.get('lists', []);
	let output = [];
	this.say(`${lists.length} list(s):`);
	lists.forEach((list, index) => {
		this.say(`[${list.get('id')}] ${list.get('name')} (${list.get('items').length} items)`);
		output.push({
			id: list.get('id'),
			name: list.get('name'),
			count: list.get('items', []).length,
		});
	});
}

module.exports = {
	cmd: 'lists',
	description: 'prints all lists',
	handle: ListsCommand,
};
