const { format, startOfMonth, endOfMonth } = require('date-fns');

async function ExportCommand(_input) {
	let tasks = [];
	let month_started_at = startOfMonth(new Date(), { weekStartsOn: 1 });
	let month_ended_at = endOfMonth(new Date(), { weekStartsOn: 1 });
	let allDays = (this.options.storage.getAll() || []).filter((_day) => _day.started_at && _day.started_at >= month_started_at && _day.started_at < month_ended_at);
	allDays.forEach((_day) => {
		if (Array.isArray(_day.tasks) && _day.tasks.length > 0) {
			let _date = format(_day.started_at, this.options.dateFormat);
			let _dayAmount = 0;
			let _idleAmount = 0;
			_day.tasks.forEach((task) => {
				tasks.push(task);
			});
		}
	});

	let fileformat = 'csv';

	if (_input.toLowerCase() === 'json') {
		fileformat = 'json';
	}

	switch (fileformat.toLowerCase()) {
		case 'csv':
			let csvData = [];
			csvData.push(['DATE', 'START', 'END', 'AMOUNT', 'PROJECT', 'CATEGORY', 'TASK']);

			tasks.forEach((task) => {
				if ('object' == typeof task) {
					csvData.push([
						format(task.started_at, this.options.dateFormat),
						format(task.started_at, this.options.timeFormat),
						format(task.ended_at, this.options.timeFormat),
						task.amount.toFixed(2).split('.').join(','),
						task.is_idle ? 'BREAK' : task.category,
						task.project,
						task.task,
					]);
				}
			});

			return csvData
				.map((entry) => {
					return `"${entry.join('"\t"')}"`;
				})
				.join('\n');
		case 'json':
			let output = [];

			tasks.forEach((task) => {
				try {
					if ('object' == typeof task) {
						output.push({
							date: format(this.currentTime, this.options.dateFormat),
							started_at: format(task.get('started_at'), this.options.timeFormat),
							ended_at: format(task.get('ended_at'), this.options.timeFormat),
							amount: task.get('amount'),
							project: task.get('project'),
							task: task.get('task'),
						});
					}
				} catch (err) {
					this.logError(err);
				}
			});

			return JSON.stringify(output);
		case 'mite':
			const mite_api_endpoint = this.get('mite_api_endpoint');
			const mite_api_key = this.get('mite_api_key');
			if (!mite_api_endpoint || !mite_api_key) {
				_interface.say(`api endpoint or key is missing:\n\t/${this.get('id')}.mite_api_endpoint [YOUR ENDPOINT]\n\t/${this.get('id')}.mite_api_key [YOUR KEY]\n`);
				return;
			}

			const projects = await axios.get(`${mite_api_endpoint}/projects.json?api_key=${mite_api_key}`);
			const services = await axios.get(`${mite_api_endpoint}/services.json?api_key=${mite_api_key}`);

			for (let _index = 0; _index < tasks.length; _index++) {
				const task = tasks[_index];
				if (!task.is_idle) {
					let project = projects.data.find((entry) => entry.project.name.toLowerCase() == task.project.toLowerCase());
					let service = services.data.find((entry) => entry.service.name.toLowerCase() == task.category.toLowerCase());
					if (project) {
						project = project.project;
					}
					if (service) {
						service = service.service;
					}

					let data = {
						api_key: mite_api_key,
						time_entry: {
							date_at: format(task.started_at, _interface.options.dateFormat),
							minutes: task.amount * 60,
							note: task.task,
							project_id: project.id || null,
							service_id: service.id || null,
						},
					};
					let resp = await axios.post(`${mite_api_endpoint}/time_entries.json`, data);

					this.say(data, resp.data || null);
				}
			}
			break;
	}
}

module.exports = {
	cmd: 'export',
	description: 'exports todays task entries as csv or json',
	usage: '/export [csv|json](default: csv)',
	handle: ExportCommand,
};
