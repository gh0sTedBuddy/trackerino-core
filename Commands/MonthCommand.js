const { format, startOfMonth, endOfMonth } = require('date-fns');

function MonthCommand(_input, _instance) {
	let _total = 0;
	let month_started_at = startOfMonth(new Date(), { weekStartsOn: 1 });
	let month_ended_at = endOfMonth(new Date(), { weekStartsOn: 1 });

	this.say(`Summary for month #${format(new Date(), 'm')}`);
	let allDays = (this.options.storage.getAll() || []).filter((_day) => _day.started_at && _day.started_at >= month_started_at && _day.started_at < month_ended_at);
	let categories = {
		other: 0,
	};
	let projects = {
		other: 0,
	};

	allDays.forEach((_day) => {
		if (Array.isArray(_day.tasks) && _day.tasks.length > 0) {
			let _date = format(_day.started_at, this.options.dateFormat);
			let _dayAmount = 0;
			let _idleAmount = 0;
			_day.tasks.forEach((task) => {
				let _amount = task.amount || 0;
				let _project = task.project || 'other';
				let _category = task.category || 'other';
				_total += _amount;
				if (task.is_idle) {
					_idleAmount += _amount;
				} else {
					_dayAmount += _amount;
				}

				if (!categories[_category]) {
					categories[_category] = 0;
				}
				categories[_category] += _amount;

				if (!projects[_project]) {
					projects[_project] = 0;
				}
				projects[_project] += _amount;
			});
			this.say('######');
			this.say(`# ${_date}: ${_dayAmount.toFixed(2)} h`);
			this.say(`#\tIdle: ${_idleAmount.toFixed(2)} h`);
		}
	});

	this.say('######');
	this.say(`TOTAL:\t${_total.toFixed(2)} h`);

	if (Object.values(projects).filter((v) => v > 0).length > 0) {
		this.say('by projects:');
		Object.keys(projects).forEach((_key) => {
			this.say(`\t- ${_key}:\t\t${projects[_key].toFixed(2)} h`);
		});
	}

	if (Object.values(categories).filter((v) => v > 0).length > 0) {
		this.say('by categories:');
		Object.keys(categories).forEach((_key) => {
			this.say(`\t- ${_key}:\t\t${categories[_key].toFixed(2)} h`);
		});
	}
}

module.exports = {
	cmd: 'month',
	description: 'lists a summary of the current month',
	handle: MonthCommand,
};
