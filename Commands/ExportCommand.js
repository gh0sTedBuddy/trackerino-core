const {format} = require('date-fns')

async function ExportCommand (_input) {
	let tasks = this.options.storage.get('tasks', [])
	let fileformat = 'csv'

	if(_input.toLowerCase() === 'json') {
		fileformat = 'json'
	}

	switch(fileformat.toLowerCase()) {
		case 'csv':
			let csvData = []
			csvData.push([
				"DATE",
				"START",
				"END",
				"AMOUNT",
				"PROJECT",
				"CATEGORY",
				"TASK",
			])

			tasks.map(task => csvData.push([
				format(this.currentTime, this.options.dateFormat),
				format(task.get('started_at'), this.options.timeFormat),
				format(task.get('ended_at'), this.options.timeFormat),
				task.get('amount').toFixed(2).split('.').join(','),
				'',
				task.get('project'),
				task.get('task')
			]))

			this.say(csvData.map(entry => {
				return `"${ entry.join("\"\t\"") }"`
			}).join("\n"))
			break
		case 'json':
			let output = []

			tasks.map(task => output.push({
				date: format(this.currentTime, this.options.dateFormat),
				started_at: format(task.started_at, this.options.timeFormat),
				ended_at: format(task.ended_at, this.options.timeFormat),
				amount: task.amount,
				project: task.project,
				task: task.task
			}))

			this.say(JSON.stringify(output))
			break
		case 'mite':
			const mite_api_endpoint = this.get('mite_api_endpoint')
			const mite_api_key = this.get('mite_api_key')
			if(!mite_api_endpoint || !mite_api_key) {
				_interface.say(`api endpoint or key is missing:\n\t/${this.get('id')}.mite_api_endpoint [YOUR ENDPOINT]\n\t/${this.get('id')}.mite_api_key [YOUR KEY]\n`)
				return
			}

			const projects = await axios.get(`${ mite_api_endpoint }/projects.json?api_key=${ mite_api_key }`)
			const services = await axios.get(`${ mite_api_endpoint }/services.json?api_key=${ mite_api_key }`)

			for(let _index = 0; _index < tasks.length; _index++) {
				const task = tasks[_index]
				if(!task.is_idle) {
					let project = projects.data.find(entry => entry.project.name.toLowerCase() == task.project.toLowerCase())
					let service = services.data.find(entry => entry.service.name.toLowerCase() == task.category.toLowerCase())
					if(project) {
						project = project.project
					}
					if(service) {
						service = service.service
					}

					let data = {
						api_key: mite_api_key,
						time_entry: {
							date_at: format(task.started_at, _interface.options.dateFormat),
							minutes: task.amount * 60,
							note: task.task,
							project_id: project.id || null,
							service_id: service.id || null
						}
					}
					let resp = await axios.post(`${ mite_api_endpoint }/time_entries.json`, data)

					console.log(data, resp.data || null)
				}
			}
			break
	}
}

module.exports = {
	cmd: 'export',
	description: 'exports todays task entries as csv or json',
	usage: '/export [csv|json](default: csv)',
	handle: ExportCommand
}