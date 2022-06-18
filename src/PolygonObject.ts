function decorateClassModifierToggle<T extends object>(target: T, propertyNameOfState: keyof T, onElement: HTMLElement) {
  const state = target[propertyNameOfState] as unknown

  if (!isDictionary(state)) {
    throw new Error(`${propertyNameOfState.toString()} is not a dictionary`)
  }

  if (Object.keys(state).length === 0) {
    throw new Error(`${propertyNameOfState.toString()} is empty`)
  }

  if (!Object.values(state).every(value => typeof value === "boolean")) {
    throw new Error(`${propertyNameOfState.toString()} must be a dictionary of booleans`)
  }

  const stateModifiers = Object.keys(state).reduce((result, nextKey) => ({ ...result, [nextKey]: camelToDash(nextKey) }), {}) as Record<string, string>

  Reflect.set(target, propertyNameOfState, new Proxy(state, {
    get(target, key) {
      return target[key]
    },
    set(target, key: string, value: boolean) {
      const stateValue = target[key]
      if (stateValue === value) return true

      // console.log(123)

      target[key] = value
      toggleElementClassModification(onElement, stateModifiers[key], value)

      return true
    }
  }))
}




class PolygonObject extends BoundElement {
  id?: keyof never

  state = {
    /**
      * Whether the polygonObject can be dragged
      */
    draggable: false,
    /**
      * Whether the polygonObject is being dragged
      */
    dragging: false,
    /**
     * Whether the polygonObject is not allowed to be dragged
     */
    notAllowed: false,
    /**
     * Whether the polygonObject is selected by pointer
     */
    selected: false,
  }

  constructor(element: unknown) {
    super(element)

    // this.boundElement.addEventListener("animationend")

    decorateClassModifierToggle(this, "state", this.boundElement)

    const mutationCallback = (_mutations: MutationRecord[], _observer: MutationObserver) => {
      Boundary.checkIfObjectAllowed(this)
    }
    const mutationObserver = new MutationObserver(mutationCallback)
    mutationObserver.observe(this.boundElement, {
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
    })

    window.addEventListener("keyup", event => {
      // if (event.altKey) return
      // if (event.ctrlKey) return
      // if (!event.shiftKey || event.key.toLowerCase() !== "shift") return
      event.preventDefault()

      if (polygon instanceof HTMLElement) {
        polygon.style.backgroundImage = ""
      }
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

  get position(): Vector2 {
    return new Vector2(this.rect.x, this.rect.y)
  }
  set position(vector: Vector2) {
    let x = vector.x - Polygon.rect.left - Boundary.offset.x
    let y = vector.y - Polygon.rect.top - Boundary.offset.y


    const computedStyle = getComputedStyle(Polygon.boundElement)

    const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)
    const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)

    const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth)
    const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth)

    // console.log(paddingX)

    x -= (paddingX / 2) + (borderX / 2)
    y -= (paddingY / 2) + (borderY / 2)

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
  }

  clone(): PolygonObject {
    const clone = new PolygonObject(this.boundElement.cloneNode(true) as HTMLElement)
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

    this.boundElement.addEventListener(type, eventFunction, options)
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

    this.boundElement.removeEventListener(type, eventFunction)
  }
}
