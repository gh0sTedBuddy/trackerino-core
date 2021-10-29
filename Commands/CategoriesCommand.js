const shortid = require('shortid')
const {format} = require('date-fns')
function CategoriesCommand (_input) {
	let categories = this.options.storage.get('categories', [])
	let result = null
	if(!!categories && categories.length) {
		if(!!_input) {
			result = {
				days: [],
				total: 0,
			}
			let tasks = []
			let files = this.options.storage.getAll()

			// read tasks from all days for defined category
			files.forEach(content => {
				try {
					let _date = format(content.started_at, this.options.dateFormat)
					if(!!content && !!content.tasks && content.tasks.length > 0) {
						let dayTasks = content.tasks.forEach(task => {
							if(!!task && !!task.category && task.category.toLowerCase() === _input.toLowerCase()) {
								tasks.push(task)
							}
						})

						let dayAmount = dayTasks.reduce((v,t) => v+t.amount, 0)
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
				let categories = this.options.storage.get('categories')
				let _amount = tasks.reduce((v,t) => v + t.amount, 0.0)

				categories = categories.map(cat => {
					if(cat.get('name').toLowerCase() == _input.toLowerCase()) {
						cat.set('amount', _amount)
						cat.amount = _amount
					}

					return cat
				})

				this.options.storage.set('categories', categories)

				result.total = _amount
				this.say(`${ _input } => ${ _amount.toFixed(2) }`)
			}
			// **/
		} else {
			let currentCategory = this.options.storage.get('category', null)

			result = []

			if(!!categories && categories.length > 0) {
				categories.forEach((category, _index) => {
					if(!category || !category.get('name')) return

					let output = [category.get('id')]
					output.push(['[\x1b[36m', category.get('project'), '\x1b[0m]'].join(''))

					output.push(`${ '\x1b[32m' }${ category.get('amount').toFixed(2) }${ '\x1b[0m' }`)
					output.push(category.get('name'))

					result.push({
						id: category.get('id'),
						name: category.get('name'),
						total: category.get('amount'),
						project: category.get('project')
					})

					this.say(output.join("\t"))
				})
			}
		}
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
		description: 'the name or id for the category to see a full statistic to.'
	}],
	handle: CategoriesCommand
}