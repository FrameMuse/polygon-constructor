const resultTitle = document.getElementById("result-title") as HTMLElement
const resultText = document.getElementById("result-text") as HTMLElement

const boundary = document.body.querySelector("[pc-boundary]")
const polygon = document.body.querySelector("[pc-polygon]")
const picker = document.body.querySelector("[pc-picker]")

const CLASS_SPLITTER = "--"

const componentNames: Record<keyof never, string> = {
  1: "Элемент стены, цвет белый 100×250",
  2: "Элемент стены, цвет белый 50×250",
  3: "Дверь раздвижная 100×250",
  4: "Занавес 100×250",
  5: "Витрина с внутренней подсветкой 1×0.5h-2.5m",
  6: "Стеллаж сборный на профиле, металлический 4 полки 0.5×1×H-2m",
  7: "Полка настенная 1m",
  8: "Барная стойка H-1m    L-1m",
  9: "Радиусная барная стойка R-1m",
  10: "Витрина 0.5×1×h-1.8m",
  11: "Витрина 0.5×0.5×h-2.5m",
  12: "Витрина 0.5×1×h-1.1m",
  13: "Витрина 0.5×1×h-1.1m (монтажная)",
  14: "Витрина 0.5×0.5×h-1.1m",
  15: "Радиальная витрина R 1.0×R 0.5×H-1.1m",
  16: "Радиальная витрина R 1.0×R 0.5×H-2.5m",
  17: "Подиум 0.5×1×H-0.8m",
  18: "Подиум 1×1×H-0.8m",
  19: "Вешалка настенная",
}

if (picker instanceof HTMLElement) {
  Picker.bindElement(picker)
}

if (polygon instanceof HTMLElement) {
  Polygon.bindElement(polygon)
}

if (boundary instanceof HTMLElement) {
  Boundary.bindElement(boundary)

  boundary.addEventListener("pointermove", event => {
    Boundary.currentPointerEvent = event

    event.preventDefault()
    if (event.pressure < 0.5) return

    if (Boundary.draggingObject) {
      // console.log(event)
      Boundary.draggingObject.position = Polygon.fromAbsoluteToRelative(new Vector2(event.x, event.y))
    }
  })
  window.addEventListener("keydown", event => {
    if (event.altKey) return
    if (event.ctrlKey) return
    if (event.key.toLowerCase() !== "r") return

    event.preventDefault()

    if (Boundary.draggingObject) {
      Boundary.draggingObject.rotate()
    }
  })
}


function startDragging(polygonObject: PolygonObject, event: PointerEvent) {
  event.preventDefault()

  Boundary.updateOffset(event)
  Boundary.draggingObject = polygonObject

  polygonObject.transform.origin = [
    new CSSUnit(event.offsetX, "px"),
    new CSSUnit(event.offsetY, "px")
  ]
  polygonObject.position = Polygon.fromAbsoluteToRelative(new Vector2(event.x, event.y))
  polygonObject.on("pointerup", stopDragging, { once: true })
}

function stopDragging(polygonObject: PolygonObject, event: PointerEvent) {
  event.preventDefault()

  if (polygonObject.state.notAllowed) {
    Polygon.unsettle(polygonObject)
  } else {
    Boundary.selectedObject = polygonObject
  }

  Boundary.draggingObject = null
}

const DEFAULT_CLASS_NAME = "polygon-constructor__object"

Picker.addComponent({
  id: 1,
  amount: 3,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Элемент стены, цвет белый 100×250",
  angle: 0,
})

Picker.addComponent({
  id: 2,
  amount: 6,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Элемент стены, цвет белый 50×250",
  angle: 0,
})

Picker.addComponent({
  id: 3,
  amount: 1,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Дверь раздвижная 100×250",
  angle: 0,
})

Picker.addComponent({
  id: 4,
  amount: 1,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Занавес 100×250",
  angle: 0,
})

Picker.addComponent({
  id: 7,
  amount: 1,
  width: 5, // cm
  height: 5, // cm
  image: "https://picsum.photos/200/300",
  name: "Полка настенная 1m",
  angle: 0,
})