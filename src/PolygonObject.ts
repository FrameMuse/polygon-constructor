const DRAGGABLE_MODIFIER = "draggable"
const DRAGGING_MODIFIER = "dragging"
const NOT_ALLOWED_MODIFIER = "not-allowed"
const SELECTED_MODIFIER = "selected"

class PolygonObject {
  id?: keyof never

  #boundElement: HTMLElement
  #state = {
    draggable: false,
    dragging: false,
    notAllowed: false,
    selected: false,
  }

  /**
   * The ability of to be dragged
   */
  get draggable() { return this.#state.draggable }
  set draggable(value: boolean) {
    this.#state.draggable = value

    if (value) {
      addElementClassModification(this.#boundElement, DRAGGABLE_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, DRAGGABLE_MODIFIER)
    }
  }

  /**
   * The state of being dragged
   */
  get dragging() { return this.#state.dragging }
  set dragging(value: boolean) {
    this.#state.dragging = value

    if (value) {
      addElementClassModification(this.#boundElement, DRAGGING_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, DRAGGING_MODIFIER)
    }
  }

  /**
   * The ability to be placed at Polygon
   */
  get notAllowed() { return this.#state.notAllowed }
  set notAllowed(value: boolean) {
    this.#state.notAllowed = value

    if (value) {
      addElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER)
    }
  }

  /**
   * The state of being selected
   */
  get selected() { return this.#state.selected }
  set selected(value: boolean) {
    this.#state.selected = value

    if (value) {
      addElementClassModification(this.#boundElement, SELECTED_MODIFIER)
    } else {
      removeElementClassModification(this.#boundElement, SELECTED_MODIFIER)
    }
  }

  get rect(): DOMRect {
    return this.#boundElement.getBoundingClientRect()
  }

  constructor(boundElement: HTMLElement) {
    this.#boundElement = boundElement


    const mutationObserver = new MutationObserver(mutationCallback)
    mutationObserver.observe(boundElement, {
      attributes: true,
      attributeFilter: ["style"],
    })

    function mutationCallback(_mutations: MutationRecord[], _observer: MutationObserver) {
      // console.log(1)
      Boundary.checkIfCanDropObject()
    }
  }

  /**
   * 
   * Checks whether polygonObject intersects other polygonObject
   */
  intersects(otherPolygonObject: PolygonObject): boolean {
    if (this === otherPolygonObject) return false

    const polygonObjectRect = this.rect
    const otherPolygonObjectRect = otherPolygonObject.rect

    if (polygonObjectRect.top > otherPolygonObjectRect.bottom) return false
    if (polygonObjectRect.bottom < otherPolygonObjectRect.top) return false

    if (polygonObjectRect.left > otherPolygonObjectRect.right) return false
    if (polygonObjectRect.right < otherPolygonObjectRect.left) return false

    return true
  }

  getBoundElement() {
    return this.#boundElement
  }

  get position(): Vector2 {
    return new Vector2(this.rect.x, this.rect.y)
  }
  set position(vector: Vector2) {
    // function getCurrentRotation(element: HTMLElement) {
    //   var style = window.getComputedStyle(element, null)
    //   var transform = style.getPropertyValue("-webkit-transform") ||
    //     style.getPropertyValue("-moz-transform") ||
    //     style.getPropertyValue("-ms-transform") ||
    //     style.getPropertyValue("-o-transform") ||
    //     style.getPropertyValue("transform") ||
    //     "none"
    //   if (transform != "none") {
    //     // console.log(transform)
    //     var values = transform.split('(')[1].split(')')[0].split(',')
    //     //return Math.round(Math.atan2(values[1],values[0]) * (180/Math.PI)) //this would return negative values the OP doesn't wants so it got commented and the next lines of code added
    //     var angle = Math.round(Math.atan2(+values[1], +values[0]) * (180 / Math.PI))
    //     return [(angle < 0 ? angle + 360 : angle), +values[1], +values[0]] //adding 360 degrees here when angle < 0 is equivalent to adding (2 * Math.PI) radians before
    //   }
    //   return [0, 0, 0]
    // }

    // const [angle, a, b] = getCurrentRotation(this.#boundElement)

    const oldPosition = this.position

    const x = vector.x - Boundary.rect.left - Boundary.offset.x
    const y = vector.y - Boundary.rect.top - Boundary.offset.y

    // const velocity = new Vector2(
    //   oldPosition
    // )

    // // Math.clamp()

    this.#boundElement.style.left = x + "px"
    this.#boundElement.style.top = y + "px"

    // console.log(x, y)
    // console.log(x * b, y * b)
  }

  #rotated: boolean = false
  rotate() {
    this.#rotated = !this.#rotated

    this.#boundElement.style.transform = `rotateZ(${+this.#rotated * 90}deg)`
  }

  #listeners: Map<Function, EventListener> = new Map
  /**
   * Sets up a function that will be called whenever the specified event is delivered to the target.
   * 
   * @param type A case-sensitive string representing the event type to listen for.
   * @param listener The object that receives a notification. Also provides polygonObject from the context it is called.
   * @param options An object that specifies characteristics about the event listener.
   * 
   */
  on<K extends keyof HTMLElementEventMap>(type: K, listener: (polygonObject: PolygonObject, event: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void {
    const eventFunction = ((event: HTMLElementEventMap[K]) => listener(this, event)) as EventListener
    this.#listeners.set(listener, eventFunction)

    if (type === "pointerup") {
      document.addEventListener(type, eventFunction, options)
      return
    }

    this.#boundElement.addEventListener(type, eventFunction, options)
  }

  /**
   * Removes a function that were passed to `on`.
   * 
   * @param type A case-sensitive string representing the event type to listen for.
   * @param listener The object that receives a notification. Also provides polygonObject from the context it is called.
   * 
   */
  off<K extends keyof HTMLElementEventMap>(type: K, listener: (polygonObject: PolygonObject, event: HTMLElementEventMap[K]) => void): void {
    const eventFunction = this.#listeners.get(listener)
    if (eventFunction == null) return

    if (type === "pointerup") {
      document.removeEventListener(type, eventFunction)
      return
    }

    this.#boundElement.removeEventListener(type, eventFunction)
  }
}
