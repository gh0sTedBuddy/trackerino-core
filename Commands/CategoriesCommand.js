const shortid = require('shortid')
const {format} = require('date-fns')
function CategoriesCommand (_input) {
	let categories = this.options.storage.get('categories', [])
	let result = null
	if(!!categories && categories.length) {
		if(!_input) {
			result = []

			categories.forEach((category, _index) => {
				if(!category || !category.get('name')) return

				let output = [category.get('id')]
				output.push(['[\x1b[36m', category.get('project'), '\x1b[0m]'].join(''))

				output.push(`${ '\x1b[32m' }${ category.get('amount').toFixed(2) }${ '\x1b[0m' }`)
				output.push(category.get('name'))

				result.push({
					id: category.get('id'),
					name: category.get('name'),
					amount: category.get('amount', 0),
					project: category.get('project')
				})

				this.say(output.join("\t"))
			})

			return result
		}

		result = {
			days: [],
			total: 0,
		}

		let files = this.options.storage.getAll()

		categories = categories.map(cat => {
			if(cat.get('name').toLowerCase() == _input.toLowerCase() || cat.get('id').toLowerCase() == _input.toLowerCase()) {
				let _amount = cat.get('amount', 0)
				let tasks = []

				files.forEach(content => {
					try {
						let _date = format(content.started_at, this.options.dateFormat)
						if(!!content && !!content.tasks && content.tasks.length > 0) {
							let dayTasks = content.tasks.filter(task => !!task && !!task.category && task.category.toLowerCase() === cat.get('name', '').toLowerCase())
							let dayAmount = dayTasks.reduce((v,t) => v+t.amount, 0)

							tasks = [...tasks, ...dayTasks]

							if(dayAmount > 0) {
								result.days[_date] = {
									started_at: content.started_at,
									amount: dayAmount,
									count: dayTasks.length
								}
								this.say(`${ _date } (${ dayTasks.length }): ${ dayAmount.toFixed(2) } hours`)
							}
						}
					} catch(err) {
						this.logError(err)
					}
				})

				if(tasks.length > 0) {
					_amount = tasks.reduce((v,t) => v + t.amount, 0.0)
				}

				result.total = _amount

				cat.set('amount', _amount)
				cat.amount = _amount

				this.say(`${ cat.get('name') } => ${ _amount.toFixed(2) }`)
			}

			return cat
		})

		this.options.storage.set('categories', categories)
		// **/
	} else {
		this.logError(`no categories yet`)
		this.say('add categories by /category [CATEGORYNAME]', [])
	}

	return result
}

module.exports = {
	cmd: 'categories',
	description: 'prints a list of all categories',
	params: [{
		name: 'name',
		type: 'String',
		optional: true,
		description: 'the name or id for the category to see a full statistic to.'
	}],
	handle: CategoriesCommand
}