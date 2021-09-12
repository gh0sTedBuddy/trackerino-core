const { addMinutes, addDays } = require('date-fns')
const Cron = require('cron-converter')

const BaseModel = require('./BaseModel')
const Task = require('./Task')

class Tracker extends BaseModel {
	hidden = [];
	constructor () {
		super()

		this.cronInstance = new Cron ()
		this.data = {
			...this.data,
			name: '',
			message: '',
			next_tick_at: null,
			active: false,
			pattern: null,
			total_ticks: 0,
			type: 'default',
			items: [],
			...(arguments[0] || {})
		}

		this.initMethods()
	}

	trigger (_interface) {
		if(this.get('active') && this.get('next_tick_at', null) !== null && (new Date(this.get('next_tick_at'))).getTime() < _interface.currentTime.getTime()) {
			this.set('total_ticks', this.get('total_ticks') + 1)
			this.set('next_tick_at', this.calcNextTick(_interface.currentTime || new Date()))

			_interface.notify({
				title: this.get('name', 'Trackerino::Tracker'),
				message: this.get('message', 'oi'),
				sound: true,
				wait: true
			})
		}
	}

	set_active (_input, _interface) {
		this.set('active', true)
		this.set('next_tick_at', this.calcNextTick())

		_interface.say(`#${ this.get('id') } scheduled to: ${ new Date(this.get('next_tick_at')) }`)
	}

	set_inactive () {
		this.set('active', false)
		this.set('next_tick_at', null)
	}

	when (q, _interface) {
		_interface.say(`scheduled at: ${ new Date(this.get('next_tick_at')) }`)
	}

	calcNextTick (now = new Date()) {
		if(typeof now === 'object' && now.constructor.name == 'Date') {
			let pattern = this.get('pattern', null)
			if (pattern) {
				return this.cronInstance.fromString(pattern).schedule(now).next().toDate()
			}
		}
		return now
	}

	show (_value, _interface) {
		return this.get('name')
	}
}

module.exports = Tracker