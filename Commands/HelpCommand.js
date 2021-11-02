function HelpCommand (_input) {
	if(this.commands) {
		for(let _key in this.commands) {
			let command = this.commands[_key]
			if (!_input || _input.toLowerCase() == _key) {
				this.say(`/${ command.cmd }\t${ '\x1b[2m' }– ${ command.description }${ '\x1b[0m' }`)
				if(command.usage) {
					this.say(`\tusage: ${ command.usage }`)
				}
			}
		}
	}

	return this.commands
}

module.exports = {
	cmd: 'help',
	description: 'lists all or one registered command(s) and their/its options',
	params: [{
		name: 'command',
		type: 'String',
		optional: true,
		description: 'the command to show information for'
	}],
	handle: HelpCommand
}