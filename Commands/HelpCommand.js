function HelpCommand (_input) {
	if(this.commands) {
		for(let _key in this.commands) {
			let command = this.commands[_key]
			this.say(`/${ command.cmd }\t${ '\x1b[2m' }– ${ command.description }${ '\x1b[0m' }`)
			if(command.usage) {
				this.say(`\tusage: ${ command.usage }`)
			}
		}
	}
}

module.exports = {
	cmd: 'help',
	description: 'lists all registered commands and their options',
	handle: HelpCommand
}