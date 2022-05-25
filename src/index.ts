const result = document.getElementById("result")

const boundary = document.body.querySelector("[data-pc-boundary]")
const polygon = document.body.querySelector("[data-pc-polygon]")
const picker = document.body.querySelector("[data-pc-picker]")

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
    event.preventDefault()
    if (event.pressure < 0.5) return

    if (Boundary.draggingObject) {
      Boundary.draggingObject.position = new Vector2(event.x, event.y)
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

  polygonObject.position = new Vector2(event.x, event.y)
  polygonObject.on("pointerup", stopDragging, { once: true })

  Boundary.draggingObject = polygonObject
}

function stopDragging(polygonObject: PolygonObject, event: PointerEvent) {
  event.preventDefault()

  if (polygonObject.notAllowed) {
    Polygon.unsettle(polygonObject)
  } else {
    Boundary.selectedObject = polygonObject
  }

  Boundary.draggingObject = null
}

function onPointerDown(polygonObject: PolygonObject, event: PointerEvent) {
  const clonedPolygonObject = clonePolygonObject(polygonObject)

  Polygon.settle(clonedPolygonObject)

  Boundary.offset = new Vector2(
    event.x - polygonObject.rect.left,
    event.y - polygonObject.rect.top
  )

  startDragging(clonedPolygonObject, event)
}

function clonePolygonObject(polygonObject: PolygonObject): PolygonObject {
  const clonedElement = polygonObject.getBoundElement().cloneNode(true) as HTMLDivElement
  const clonedPolygonObject = new PolygonObject(clonedElement)

  clonedPolygonObject.id = polygonObject.id
  clonedPolygonObject.draggable = true
  clonedPolygonObject.on("pointerdown", (polygonObject, event) => {
    Boundary.offset = new Vector2(
      event.x - polygonObject.rect.left,
      event.y - polygonObject.rect.top
    )

    startDragging(clonedPolygonObject, event)
  })

  return clonedPolygonObject
}

const DEFAULT_CLASS_NAME = "polygon-constructor__object"

Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })
Picker.createComponent({ className: DEFAULT_CLASS_NAME })