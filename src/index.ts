"use strict"

const CLASS_SPLITTER = "--"

const DEFAULT_CLASS_NAME = "polygon-constructor__object"

const polygon = new Polygon

// setTimeout(() => {
polygon.blocks.add({
  id: 1,
  amount: 3,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Элемент стены, цвет белый 100×250",
  angle: 0,
})

setTimeout(() => {
  polygon.blocks.add({
    id: 1,
    amount: 1,
    width: 5, // cm
    height: 5, // cm
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 100×250",
    angle: 0,
  })
}, 1000)

setTimeout(() => {
  polygon.blocks.add({
    id: 2,
    amount: 6,
    width: 5, // cm
    height: 5, // cm
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 50×250",
    angle: 0,
  })
}, 2000)

setTimeout(() => {
  polygon.blocks.add({
    id: 3,
    amount: 1,
    width: 5, // cm
    height: 5, // cm
    image: "https://picsum.photos/200/300",
    name: "Дверь раздвижная 100×250",
    angle: 0,
  })
}, 3000)

setTimeout(() => {
  polygon.blocks.add({
    id: 4,
    amount: 1,
    width: 5, // cm
    height: 5, // cm
    image: "https://picsum.photos/200/300",
    name: "Занавес 100×250",
    angle: 0,
  })
}, 4000)

setTimeout(() => {
  polygon.blocks.add({
    id: 7,
    amount: 1,
    width: 5, // cm
    height: 5, // cm
    image: "https://picsum.photos/200/300",
    name: "Полка настенная 1m",
    angle: 0,
  })
}, 5000)
// }, 1000)


// setTimeout(() => {
//   polygon.blocks.removeById(1)
// }, 7000)

function check() {
  if (polygon.picker.getUnderusedComponents().length > 0) {
    polygon.entries.setEntry("error", "Не все компоненты выбраны", "red")
    return
  }

  if (polygon.picker.getOverusedComponents().length > 0) {
    polygon.entries.setEntry("error", "Выбрано слишком много компонентов", "red")
    return
  }

  polygon.entries.deleteEntry("error")
}

polygon.area.onChange(check)
polygon.picker.onComponentAdded(check)
polygon.picker.onComponentRemoved(check)


function asd() {
  if (polygon.picker.getUnderusedComponents().length > 0) return
  if (polygon.picker.getOverusedComponents().length > 0) return

  const asd = polygon.export()
  polygon.area.clear()
  polygon.import(...asd)
}

setTimeout(() => {
  asd()
}, 500)