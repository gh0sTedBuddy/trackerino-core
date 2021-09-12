function SyncCommand (_input, _instance) {
}

module.exports = {
	cmd: 'sync',
	description: 'sends your data to the api-server we need to develop.',
	handle: SyncCommand
}