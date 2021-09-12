function DebugCommand (_input) {
	console.log(this.options.storage.get('data'))
}

module.exports = {
	cmd: 'debug',
	description: 'shows the current data object',
	handle: DebugCommand
}