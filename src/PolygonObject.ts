const DRAGGABLE_MODIFIER = "draggable"
const DRAGGING_MODIFIER = "dragging"
const NOT_ALLOWED_MODIFIER = "not-allowed"

type PolygonObjectCallback = (polygonObject: PolygonObject) => void

class PolygonObject {
  #boundElement: HTMLElement
  // #callbacks: Set<PolygonObjectCallback> = new Set

  /**
   * The ability of to be dragged
   */
  get draggable() { return isElementClassModifiedBy(this.#boundElement, DRAGGABLE_MODIFIER) }
  set draggable(value: boolean) {
    if (value) {
      addElementClassModification(this.#boundElement, DRAGGABLE_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, DRAGGABLE_MODIFIER)
    }
  }

  /**
   * The state of being dragged
   */
  get dragging() { return isElementClassModifiedBy(this.#boundElement, DRAGGING_MODIFIER) }
  set dragging(value: boolean) {
    if (value) {
      addElementClassModification(this.#boundElement, DRAGGING_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, DRAGGING_MODIFIER)
    }
  }

  /**
   * The ability to be placed at Polygon
   */
  get notAllowed() { return isElementClassModifiedBy(this.#boundElement, NOT_ALLOWED_MODIFIER) }
  set notAllowed(value: boolean) {
    if (value) {
      addElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER)
    }
  }

  get DOMRect(): DOMRect {
    return this.#boundElement.getBoundingClientRect()
  }

  constructor(boundElement: HTMLElement) {
    this.#boundElement = boundElement
    // Defaults
    this.draggable = true
    this.dragging = false
    // Events
    // this.#listenDragging()
  }

  // #listenDragging() {
  //   const pointerDownEvent = () => this.dragging = true
  //   const pointerDownMoveEvent = () => this.dragging && this.#runDraggingCallbacks()
  //   const pointerDownUpEvent = () => this.dragging = false

  //   this.#boundElement.addEventListener("pointerdown", pointerDownEvent)
  //   this.#boundElement.addEventListener("pointermove", pointerDownMoveEvent)
  //   document.addEventListener("pointerup", pointerDownUpEvent)
  // }

  // #runDraggingCallbacks() {
  //   for (const callback of this.#callbacks) {
  //     callback(this)
  //   }
  // }

  /**
   * 
   * Checks whether polygonObject intersects other polygonObject
   */
  intersects(otherPolygonObject: PolygonObject): boolean {
    if (this === otherPolygonObject) return false

    const polygonObjectRect = this.DOMRect
    const otherPolygonObjectRect = otherPolygonObject.DOMRect

    if (polygonObjectRect.top > otherPolygonObjectRect.bottom) return false
    if (polygonObjectRect.bottom < otherPolygonObjectRect.top) return false

    if (polygonObjectRect.left > otherPolygonObjectRect.right) return false
    if (polygonObjectRect.right < otherPolygonObjectRect.left) return false

    return true
  }

  getBoundElement() {
    return this.#boundElement
  }

  move(pageX: number, pageY: number) {
    const boundaryRect = boundary.getBoundingClientRect()

    const x = pageX - boundaryRect.left - offsetX
    const y = pageY - boundaryRect.top - offsetY

    this.#boundElement.style.top = y + "px"
    this.#boundElement.style.left = x + "px"
  }

  // setOnDragging(callback: PolygonObjectCallback) {
  //   this.#callbacks.add(callback)
  // }
}