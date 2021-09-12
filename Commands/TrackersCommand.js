function TrackersCommand (_input, _instance) {
	let trackers = this.options.storage.get('trackers', [])
	this.say(`${ trackers.length } tracker(s):`)
	trackers.map((tracker, index) => {
		this.say(`[${ tracker.get('id') }] ${ tracker.get('name') } (${ tracker.get('items').length } items)`)
	})
}

module.exports = {
	cmd: 'trackers',
	description: 'prints all trackers',
	handle: TrackersCommand
}