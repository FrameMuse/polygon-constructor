const result = document.getElementById("result") as HTMLDivElement

const boundary = document.body.querySelector("[data-pc-boundary]") as HTMLDivElement
const polygon = document.body.querySelector("[data-pc-polygon]") as HTMLDivElement
const site = document.body.querySelector("[data-pc-site]") as HTMLDivElement
const picker = document.body.querySelector("[data-pc-picker]") as HTMLDivElement

const siteRect = site.getBoundingClientRect()

Polygon.setBoundElement(polygon)

interface IPolygonObject {
  id: number
  title: string
  type: string
}

interface Placement {
  x: number
  y: number
}

const shapes: Map<IPolygonObject["id"], IPolygonObject> = new Map
let placements: Map<IPolygonObject["id"], Placement> = new Map

let offsetX = 0
let offsetY = 0

const dropNotAllowedRef = new Proxy<{ current: boolean }>({ current: false }, {
  set(target, _key, value: boolean) {
    if (draggingElementRef.current === null) {
      target.current = false

      return true
    }

    if (value) {
      target.current = true
      draggingElementRef.current.notAllowed = true

      return true
    } else {
      target.current = false
      draggingElementRef.current.notAllowed = false

      return true
    }

    return false
  }
})
const draggingRef = new Proxy<{ current: boolean }>({ current: false }, {
  get() {
    return draggingElementRef.current !== null
  },
})
const draggingElementRef = new Proxy<{ current: PolygonObject | null }>({ current: null }, {
  get(target) {
    return target.current
  },

  set(polygonObject, _key, nextPolygonObject: PolygonObject | null) {
    if (polygonObject.current === nextPolygonObject) return true

    if (polygonObject.current != null && nextPolygonObject == null) {
      polygonObject.current.dragging = false
      polygonObject.current = null

      return true
    }

    if (polygonObject.current == null && nextPolygonObject != null) {
      polygonObject.current = nextPolygonObject
      polygonObject.current.dragging = true

      return true
    }

    return false

    // nextPolygonObject?.dragging = true

    // nextPolygonObject?.boundElement

    // value?.classList.add("polygon-constructor__object--active")
    // result.textContent = `Current: ${nextPolygonObject?.textContent || nextPolygonObject}`
    // polygonObject.current?.classList.remove("polygon-constructor__object--active")
    // polygonObject.current?.classList.remove("polygon-constructor__object--not-allowed")

    // polygonObject.current = nextPolygonObject
    // return true
  }
})

/**
 * @deprecated
 */
function getNotAllowedState(): boolean {
  if (draggingElementRef.current === null) return false

  if (!Polygon.contains(draggingElementRef.current)) {
    return true
  }

  if (Polygon.intersectsOtherObjects(draggingElementRef.current)) {
    return true
  }

  return false
}

boundary.addEventListener("pointermove", event => {
  event.preventDefault()

  if (event.pressure < 0.5) return
  if (draggingElementRef.current === null) return

  dropNotAllowedRef.current = getNotAllowedState()
  draggingElementRef.current.move(event.x, event.y)
})

function startDragging(polygonObject: PolygonObject, event: PointerEvent) {
  event.preventDefault()

  draggingElementRef.current = polygonObject
  dropNotAllowedRef.current = getNotAllowedState()

  polygonObject.move(event.x, event.y)

  document.addEventListener("pointerup", onDraggingEnd)
}

function onDraggingEnd(event: PointerEvent) {
  event.preventDefault()
  console.log("onDraggingEnd")

  if (dropNotAllowedRef.current && draggingElementRef.current) {
    console.log("onDraggingEnd => dropNotAllowedRef")
    Polygon.unsettle(draggingElementRef.current)
  }
  draggingElementRef.current = null

  document.removeEventListener("pointerup", onDraggingEnd)
}

function onPointerDown(this: HTMLDivElement, event: PointerEvent) {
  const polygonObject = cloneAsPolygonObject(this)

  Polygon.settle(polygonObject)
  // // polygon.appendChild(polygonObject.)
  // draggingElementRef.current = polygonObject


  const t = this.getBoundingClientRect()

  offsetX = event.x - t.left
  offsetY = event.y - t.top

  startDragging(polygonObject, event)
  // onDraggingStart.call(polygonObject, event)
}

function cloneAsPolygonObject(element: HTMLDivElement): PolygonObject {
  const clonedElement = element.cloneNode(true) as HTMLDivElement
  const polygonObject = new PolygonObject(clonedElement)

  clonedElement.addEventListener("pointerdown", function (this, event) {
    const clonedElementRect = this.getBoundingClientRect()

    offsetX = event.x - clonedElementRect.left
    offsetY = event.y - clonedElementRect.top

    startDragging(polygonObject, event)
  })

  return polygonObject
}

function commitStore() {
  if (draggingElementRef.current == null) return

  // const id = draggingElementRef.current.dataset.pcId
  // if (id == null) return
  // if (isNaN(+id)) return

  // const shape = shapes.get(+id)
  // if (shape == null) return

  // placements.set(+id, {
  //   x: draggingElementRef.current.offsetLeft - site.offsetLeft,
  //   y: draggingElementRef.current.offsetTop - site.offsetTop,
  // })

  // const id = draggingElement.id
  // if (dropAllowed) {
  //   if (!shapes[id].elements.has(draggingElement)) {
  //     shapes[id].elements.add(draggingElement)
  //   }
  // } else {
  //   shapes[id].elements.delete(draggingElement)
  // }

  // // render result
  // const rss = document.getElementById("r" + id) as HTMLDivElement
  // rss.textContent = shapes[id].title + ": " + shapes[id].elements.size
}

function createPolygonElement(shape: IPolygonObject) {
  const polygonElement = document.createElement("div")

  polygonElement.dataset.pcId = String(shape.id)
  polygonElement.innerText = shape.title
  polygonElement.classList.add("polygon-constructor__object", "polygon-constructor__object" + "--" + shape.type)
  polygonElement.addEventListener("pointerdown", onPointerDown)

  return polygonElement
}

function addShape(shape: IPolygonObject) {
  if (shapes.has(shape.id)) {
    throw new Error("This id is already in use")
  }

  shapes.set(shape.id, shape)

  const shapeElement = createPolygonElement(shape)
  picker.appendChild(shapeElement)
}

function getPlacements() {
  return [...placements.entries()]
}

function setPlacements(newPlacements: [IPolygonObject["id"], Placement][]) {
  polygon.querySelectorAll(".polygon-constructor__object--draggable").forEach(e => e.remove())
  placements = new Map(newPlacements)
  placements.forEach((place, key) => {
    const shape = shapes.get(key)
    if (shape == null) return

    const shapeElement = createPolygonElement(shape)
    const draggableShape = cloneAsPolygonObject(shapeElement)

    // draggableShape.style.top = site.offsetTop + place.y + "px"
    // draggableShape.style.left = site.offsetLeft + place.x + "px"

    // polygon.appendChild(draggableShape)
  })
}

site.addEventListener("pointerenter", () => {
  dropNotAllowedRef.current = true
})

site.addEventListener("pointerout", () => {
  dropNotAllowedRef.current = false
})

addShape({ title: "wall", type: "hr", id: 0 })
addShape({ title: "wall", type: "vr", id: 1 })
addShape({ title: "chair", type: "circle", id: 2 })
addShape({ title: "table", type: "rectangle", id: 3 })
addShape({ title: "", type: "corner", id: 4 })
