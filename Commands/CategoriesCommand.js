const shortid = require('shortid')
const {format} = require('date-fns')
function CategoriesCommand (_input) {
	let categories = this.options.storage.get('categories', [])
	if(!!categories && categories.length) {
		if(!!_input) {
			let tasks = []
			let files = this.options.storage.getAll()

			for(let _index = 0; _index < files.length; _index++) {
				try {
					let content = files[_index]
					if(!!content && !!content.tasks && content.tasks.length > 0) {
						let dayTasks = content.tasks.filter(task => !!task && !!task.category && task.category.toLowerCase() === _input.toLowerCase())
						tasks = [...tasks, ...dayTasks]
						let dayAmount = dayTasks.reduce((v,t) => v+t.amount, 0)
						if(dayAmount > 0) {
							this.say(`${ format(content.started_at, this.options.dateFormat) } (${ dayTasks.length }): ${ dayAmount.toFixed(2) } hours`)
						}
					}
				} catch(err) {
					this.logError(err)
				}
			}

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

				this.say(`${ _input } => ${ _amount.toFixed(2) }`)
			}
			// **/
		} else {
			let currentCategory = this.options.storage.get('category', null)
			if(!!categories && categories.length > 0) {
				categories.map((category, _index) => {
					if(!category || !category.get('name')) return

					let output = [category.get('id')]
					output.push(['[\x1b[36m', category.get('project'), '\x1b[0m]'].join(''))

					output.push(`${ '\x1b[32m' }${ category.get('amount').toFixed(2) }${ '\x1b[0m' }`)
					output.push(category.get('name'))

					this.say(output.join("\t"))
				})
			}
		}

	} else {
		this.logError(`no categories yet`)
		this.say(`add categories by /category [CATEGORYNAME]`)
	}
}

module.exports = {
	cmd: 'categories',
	description: 'prints a list of all current categories',
	handle: CategoriesCommand
}