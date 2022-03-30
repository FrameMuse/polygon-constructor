const boundary = document.body.querySelector("[data-pc-boundary]") as HTMLDivElement
const polygon = document.body.querySelector("[data-pc-polygon]") as HTMLDivElement
const site = document.body.querySelector("[data-pc-site]") as HTMLDivElement
const picker = document.body.querySelector("[data-pc-picker]") as HTMLDivElement

interface Shape {
  id: number
  title: string
  type: string
}

interface Placement {
  shape: Shape
  x: number
  y: number
}

const shapes: Map<Shape["id"], Shape> = new Map
const placements: Map<Shape["id"], Placement> = new Map

let offsetX = 0
let offsetY = 0
let dropAllowed = false
let dragging = false
let draggingElement: HTMLDivElement | null = null
boundary.addEventListener("pointermove", event => {
  event.preventDefault()

  if (event.pressure < 0.5) return

  if (!dragging) return
  commitMove(event.x, event.y)
})

function commitMove(pageX: number, pageY: number) {
  if (draggingElement == null) return

  const boundaryRect = boundary.getBoundingClientRect()

  const x = pageX - boundaryRect.left - offsetX
  const y = pageY - boundaryRect.top - offsetY

  draggingElement.style.top = y + "px"
  draggingElement.style.left = x + "px"
}

function onDraggingStart(this: HTMLDivElement, event: PointerEvent) {
  event.preventDefault()

  dragging = true
  draggingElement = this

  commitMove(event.x, event.y)

  this.classList.add("polygon-constructor__shape--dragging")
  document.addEventListener("pointerup", onDraggingEnd)
}

function onDraggingEnd(event: PointerEvent) {
  if (draggingElement == null) return
  event.preventDefault()

  commitStore()

  draggingElement.classList.remove("polygon-constructor__shape--dragging")

  if (!dropAllowed) {
    draggingElement.remove()
  }

  dragging = false
  draggingElement = null

  document.removeEventListener("pointerup", onDraggingEnd)
}

function onPointerDown(this: HTMLDivElement, event: PointerEvent) {
  const clonedShape = this.cloneNode(true) as HTMLDivElement

  clonedShape.classList.add("polygon-constructor__shape--draggable")
  clonedShape.addEventListener("pointerdown", function (this, event) {
    const t = this.getBoundingClientRect()

    offsetX = event.x - t.left
    offsetY = event.y - t.top

    onDraggingStart.call(this, event)
  })

  polygon.appendChild(clonedShape)
  draggingElement = clonedShape


  const t = this.getBoundingClientRect()

  offsetX = event.x - t.left
  offsetY = event.y - t.top

  onDraggingStart.call(clonedShape, event)
}

function commitStore() {
  if (draggingElement == null) return

  const id = draggingElement.dataset.pcId
  if (id == null) return
  if (isNaN(+id)) return

  const shape = shapes.get(+id)
  if (shape == null) return

  placements.set(+id, {
    shape,
    x: draggingElement.offsetLeft - site.offsetLeft,
    y: draggingElement.offsetTop - site.offsetTop,
  })

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

function createShapeElement(shape: Shape) {
  const shapeElement = document.createElement("div")

  shapeElement.dataset.pcId = String(shape.id)
  shapeElement.innerText = shape.title
  shapeElement.classList.add("polygon-constructor__shape", "polygon-constructor__shape" + "--" + shape.type)
  shapeElement.addEventListener("pointerdown", onPointerDown)

  return shapeElement
}

function addShape(shape: Shape) {
  if (shapes.has(shape.id)) {
    throw new Error("This id is already in use")
  }

  shapes.set(shape.id, shape)

  const shapeElement = createShapeElement(shape)
  picker.appendChild(shapeElement)
}

site.addEventListener("pointerenter", () => {
  dropAllowed = true
})

site.addEventListener("pointerout", () => {
  dropAllowed = false
})

addShape({ title: "wall", type: "hr", id: 0 })
addShape({ title: "wall", type: "vr", id: 1 })
addShape({ title: "chair", type: "circle", id: 2 })
addShape({ title: "table", type: "rectangle", id: 3 })