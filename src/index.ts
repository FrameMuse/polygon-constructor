const boundary = document.body.querySelector("[data-pc-boundary]") as HTMLDivElement
const polygon = document.body.querySelector("[data-pc-polygon]") as HTMLDivElement
const site = document.body.querySelector("[data-pc-site]") as HTMLDivElement
const picker = document.body.querySelector("[data-pc-picker]") as HTMLDivElement

const shapes: Record<string, { title: string, type: string, elements: Set<HTMLElement> }> = {
  1: {
    title: "chair",
    type: "circle",
    elements: new Set
  },
  2: {
    title: "table",
    type: "rectangle",
    elements: new Set
  }
}

let offsetX = 0
let offsetY = 0
let dropAllowed = false
let dragging = false
let draggingElement: HTMLDivElement | null = null
boundary.addEventListener("pointermove", event => {
  if (!dragging) return
  event.preventDefault()

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

  offsetX = event.offsetX
  offsetY = event.offsetY

  dragging = true
  draggingElement = this

  commitMove(event.x, event.y)

  this.style.pointerEvents = "none"
  document.addEventListener("pointerup", onDraggingEnd)
}

function onDraggingEnd(event: PointerEvent) {
  if (draggingElement == null) return
  event.preventDefault()

  commitStore()

  draggingElement.style.pointerEvents = ""
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
  clonedShape.addEventListener("pointerdown", onDraggingStart)

  polygon.appendChild(clonedShape)
  draggingElement = clonedShape

  onDraggingStart.call(clonedShape, event)
}

function commitStore() {
  if (draggingElement == null) return

  const id = draggingElement.id
  if (dropAllowed) {
    if (!shapes[id].elements.has(draggingElement)) {
      shapes[id].elements.add(draggingElement)
    }
  } else {
    shapes[id].elements.delete(draggingElement)
  }

  // render result
  const rss = document.getElementById("r" + id) as HTMLDivElement
  rss.textContent = shapes[id].title + ": " + shapes[id].elements.size
}

for (const id in shapes) {
  if (Object.prototype.hasOwnProperty.call(shapes, id)) {
    const shape = shapes[id]
    const shapeElement = document.createElement("div")

    shapeElement.id = id
    shapeElement.innerText = shape.title
    shapeElement.classList.add("polygon-constructor__shape")
    shapeElement.classList.add("polygon-constructor__shape" + "--" + shape.type)
    shapeElement.addEventListener("pointerdown", onPointerDown)
    shapeElement.draggable = true

    picker.appendChild(shapeElement)
    // create result
    const result = document.getElementById("result") as HTMLDivElement
    const rss = document.createElement("div")
    rss.id = "r" + id
    rss.textContent = shape.title + ": 0"
    result.appendChild(rss)
  }
}

site.addEventListener("pointerenter", () => {
  dropAllowed = true

  console.log("dropAllowed")
})

site.addEventListener("pointerout", () => {
  dropAllowed = false

  console.log("not dropAllowed")
})

site.addEventListener("dragover", event => {
  event.preventDefault()
  console.log("dropAllowed")
})

site.addEventListener("drop", event => {
  event.preventDefault()
  console.log("dropAllowed")
})
