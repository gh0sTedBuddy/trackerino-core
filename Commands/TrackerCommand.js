const Models = require('../Models')
function TrackerCommand (_input, _instance) {
	let project = this.options.storage.get('project', null)
	let tracker = this.options.storage.get('trackers', [])

	// try to receive crontype settings (https://crontab.guru/)
	// if no setup was given the tracker will remain inactive

	let newTracker = new Models.Tracker({
		name: _input
	})

	this.say(`➕ created tracker: ${ newTracker.get('name') } (${ newTracker.get('id') })`)

	tracker.push(newTracker)
	this.options.storage.set('trackers', tracker)
}

module.exports = {
	cmd: 'tracker',
	description: 'creates a new tracker',
	handle: TrackerCommand
}