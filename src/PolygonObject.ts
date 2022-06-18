const DRAGGABLE_MODIFIER = "draggable"
const DRAGGING_MODIFIER = "dragging"
const NOT_ALLOWED_MODIFIER = "not-allowed"
const SELECTED_MODIFIER = "selected"

class PolygonObject {
  id?: keyof never

  #clumpedPositionStep: boolean = false
  #boundElement: HTMLElement
  #state = {
    draggable: false,
    dragging: false,
    notAllowed: false,
    selected: false,
  }

  transform: CSSTransform

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

  constructor(boundElement: unknown) {
    if (!(boundElement instanceof HTMLElement)) {
      throw new Error("boundElement must be an instance of HTMLElement")
    }

    this.#boundElement = boundElement
    this.transform = new CSSTransform(this.#boundElement)

    const mutationCallback = (_mutations: MutationRecord[], _observer: MutationObserver) => {
      Boundary.checkIfObjectAllowed(this)
    }
    const mutationObserver = new MutationObserver(mutationCallback)
    mutationObserver.observe(boundElement, {
      attributes: true,
      attributeFilter: ["style"],
    })

    this.on("contextmenu", (_, event) => {
      event.preventDefault()
    })

    window.addEventListener("keydown", event => {
      if (event.altKey) return
      if (event.ctrlKey) return
      if (!event.shiftKey || event.key.toLowerCase() !== "shift") return
      event.preventDefault()
      // console.log(event)

      if (polygon instanceof HTMLElement) {
        polygon.style.backgroundImage = `
          repeating-linear-gradient(90deg, transparent 0 23px, rgba(0, 0, 0, 0.25) 23px 30px),
          repeating-linear-gradient(transparent 0 23px, rgba(0, 0, 0, 0.25) 23px 30px)
        `
      }
      this.#clumpedPositionStep = true
    })

    window.addEventListener("keyup", event => {
      // if (event.altKey) return
      // if (event.ctrlKey) return
      // if (!event.shiftKey || event.key.toLowerCase() !== "shift") return
      event.preventDefault()

      if (polygon instanceof HTMLElement) {
        polygon.style.backgroundImage = ""
      }
      this.#clumpedPositionStep = false
    })
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

  get boundElement() {
    return this.#boundElement
  }

  get position(): Vector2 {
    return new Vector2(this.rect.x, this.rect.y)
  }
  set position(vector: Vector2) {
    // function normalize(value: number, by: number): number {
    //   return value - (value % by)
    // }

    let x = vector.x - Polygon.rect.left - Boundary.offset.x
    let y = vector.y - Polygon.rect.top - Boundary.offset.y


    const computedStyle = getComputedStyle(Polygon.boundElement)

    const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)
    const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)

    const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth)
    const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth)


    x -= (paddingX / 2) + (borderX / 2)
    y -= (paddingY / 2) + (borderY / 2)


    // if (this.#clumpedPositionStep && !this.#state.notAllowed) {
    //   x = normalize(x, 30)
    //   y = normalize(y, 30)
    // }

    this.transform.functions.translateX = new CSSUnit(x, "px")
    this.transform.functions.translateY = new CSSUnit(y, "px")
  }

  rotated: boolean = false
  rotate(origin?: Vector2) {
    this.rotated = !this.rotated

    Polygon.contains

    if (origin) {
      this.transform.origin = [new CSSUnit(origin.x, "px"), new CSSUnit(origin.y, "px")]
    }
    this.transform.functions.rotateZ = new CSSUnit(this.rotated ? 90 : 0, "deg")


    // setTimeout(() => {
    //   if (this.notAllowed) {
    //     this.rotate(origin)
    //   }
    // })
  }

  clone(): PolygonObject {
    const clone = new PolygonObject(this.#boundElement.cloneNode(true) as HTMLElement)
    clone.position = this.position
    clone.rotated = this.rotated
    return clone
  }

  #onSettledCallbacks: Function[] = []
  onSettled(callback: Function) {
    this.#onSettledCallbacks.push(callback)
  }

  /**
   * Says to polygonObject that it is settled
   */
  settle() {
    this.#onSettledCallbacks.forEach(callback => callback())
  }

  #onUnsettledCallbacks: Function[] = []
  onUnsettled(callback: Function) {
    this.#onUnsettledCallbacks.push(callback)
  }

  /**
   * Says to polygonObject that it is unsettled
   */
  unsettle() {
    this.#onUnsettledCallbacks.forEach(callback => callback())
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
