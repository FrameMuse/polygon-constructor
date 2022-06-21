const polygon = new Polygon

// setTimeout(() => {
polygon.blocks.add({
  id: 1,
  amount: 3,
  width: 160, // cm
  height: 20, // cm
  image: "https://picsum.photos/200/300",
  name: "Элемент стены, цвет белый 100×250",
  angle: 0,
})



polygon.blocks.add({
  id: 2,
  amount: 6,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Элемент стены, цвет белый 50×250",
  angle: 0,
})



polygon.blocks.add({
  id: 3,
  amount: 1,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Дверь раздвижная 100×250",
  angle: 0,
})


polygon.blocks.add({
  id: 4,
  amount: 1,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Занавес 100×250",
  angle: 0,
})



polygon.blocks.add({
  id: 7,
  amount: 1,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Полка настенная 1m",
  angle: 0,
})

// }, 1000)

function check() {
  if (polygon.picker.getUnderusedComponents().length > 0) {
    polygon.entries.setEntry("error", "Не все компоненты выбраны", "red")
    return false
  }

  if (polygon.picker.getOverusedComponents().length > 0) {
    polygon.entries.setEntry("error", "Выбрано слишком много компонентов", "red")
    return false
  }

  if (polygon.area.checkIfObjectsAllowed(polygon.area.objects) === false) {
    polygon.entries.setEntry("error", "Некоторые блоки расположены неправильно", "red")
    return false
  }

  polygon.entries.deleteEntry("error")
  return true
}

// polygon.area.onChange(check)
// polygon.blocks.on("add", check)
// polygon.blocks.on("remove", check)

polygon.area.ratio = 1 / 2
function onSubmit() {
  if (!check()) return

  const exportData = polygon.export()
  polygon.area.clear()
  polygon.import(...exportData)

  alert("nice")
  console.log(exportData)
}

setTimeout(() => {
  onSubmit()
}, 500)
