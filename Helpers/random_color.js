function RandomColorFunc () {
	let [r,g,b] = [
		100 + Math.round(Math.random() * 120),
		100 + Math.round(Math.random() * 120),
		100 + Math.round(Math.random() * 120)
	]
	return `rgb(${r},${g},${b})`
}
module.exports = RandomColorFunc