class PolygonBoundary extends PolygonComponent {
  #draggingEvents: EventEmitter<"drag" | "dragstart" | "dragend", PolygonObjectCallback<PointerEvent>> = new EventEmitter
  #events: EventEmitter<"selectedObjectChange", (polygonObject: PolygonObject) => void> = new EventEmitter

  #draggingObject: PolygonObject | null = null
  /**
   * The current polygonObject which is being dragged
   */
  get draggingObject(): PolygonObject | null {
    return this.#draggingObject
  }
  set draggingObject(polygonObject: PolygonObject | null) {
    if (this.#draggingObject === polygonObject) return

    if (this.#draggingObject != null && polygonObject == null) {
      this.#draggingObject.state.dragging = false
      this.#draggingObject = null



      return
    }

    if (polygonObject != null) {
      this.#draggingObject = polygonObject
      this.#draggingObject.state.dragging = true

      return
    }

    throw new Error("Something wrong")
  }

  #selectedObject: PolygonObject | null = null
  /**
   * The current polygonObject which is selected
   */
  get selectedObject(): PolygonObject | null {
    return this.#selectedObject
  }

  set selectedObject(polygonObject: PolygonObject | null) {
    if (polygonObject === null) return
    if (this.#selectedObject === polygonObject) return

    if (this.#selectedObject) {
      this.#selectedObject.state.selected = false
    }

    polygonObject.state.selected = true

    this.#selectedObject = polygonObject
    this.#events.emit("selectedObjectChange", polygonObject)
  }

  startDragging(polygonObject: PolygonObject, pointerDownEvent: PointerEvent) {
    if (this.draggingObject) return

    if (polygonObject.state.dragging) return
    if (!polygonObject.state.draggable) return

    if (pointerDownEvent.pressure < 0.5) {
      throw new Error("Pointer down event pressure is too low, probably not a real pointer down event.")
    }

    pointerDownEvent.preventDefault()

    this.draggingObject = polygonObject
    this.#draggingEvents.emit("dragstart", polygonObject, pointerDownEvent)

    const pointermoveEvent = (pointermoveEvent: PointerEvent) => {
      this.#draggingEvents.emit("drag", polygonObject, pointermoveEvent)
    }

    this.boundElement.addEventListener("pointermove", pointermoveEvent)

    window.addEventListener("pointerup", pointerupEvent => {
      this.draggingObject = null

      this.boundElement.removeEventListener("pointermove", pointermoveEvent)
      this.#draggingEvents.emit("dragend", polygonObject, pointerupEvent)
    }, { once: true })
  }

  makePolygonObjectDraggable(polygonObject: PolygonObject) {
    if (polygonObject.state.dragging) return
    if (polygonObject.state.draggable) return

    polygonObject.state.draggable = true
    polygonObject.on("pointerdown", this.startDragging.bind(this))
  }

  onSelectedObjectChange(callback: (polygonObject: PolygonObject) => void) {
    this.#events.on("selectedObjectChange", callback)
  }

  onDrag(callback: PolygonObjectCallback<PointerEvent>) {
    this.#draggingEvents.on("drag", callback)
  }

  onDragStart(callback: PolygonObjectCallback<PointerEvent>) {
    this.#draggingEvents.on("dragstart", callback)
  }

  onDragEnd(callback: PolygonObjectCallback<PointerEvent>) {
    this.#draggingEvents.on("dragend", callback)
  }

  onKeyDown(key: string, callback: (event: KeyboardEvent) => void) {
    window.addEventListener("keydown", event => {
      if (event.code === ("Key" + key.toUpperCase())) {
        callback(event)
      }
    })
  }
}
