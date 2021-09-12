const Models = require('../Models')

function ConfigCommand (_input) {
	let _config = this.options.storage.get('config', [])
	const setData = function (key, data) {
		if(key && data.length > 0) {
			if(data.length > 1) {
				data = data.join(' ')
			} else {
				data = data.shift()
				if(data == 'true' || data == 'yes') {
					data = true
				} else if(data == 'false' || data == 'no') {
					data = false
				}
			}
			_config[key] = data
			console.log(`set ${key} to ${data}`)
		}
	}
	if(_input) {
		let input  = _input.split(' ')
		let data = []
		let key = null
		for(let _index = 0; _index < input.length; _index++) {
			let _key_or_value = input[_index]

			if(_key_or_value.startsWith('--')) {
				_key_or_value = _key_or_value.substr(2,_key_or_value.length)
			}

			if(_config.hasOwnProperty(_key_or_value)) {
				setData(key, data)
				data = []
				key = _key_or_value
			} else {
				data.push(_key_or_value)
			}
		}

		if(key && data.length > 0) {
			setData(key, data)
		}

		this.options.storage.set('config', _config)
	} else {
		console.log('show config')
		let keys = Object.keys(_config)
		for(let k in keys) {
			console.log("\t-", keys[k], _config[keys[k]])
		}
	}
}

module.exports = {
	cmd: 'config',
	description: 'sets configuration variables',
	handle: ConfigCommand
}