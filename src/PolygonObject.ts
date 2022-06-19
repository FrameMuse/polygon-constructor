function createClassModifierToggleProxy(value: unknown, onElement: HTMLElement) {
  if (!isDictionary(value)) {
    throw new Error("value is not a dictionary")
  }

  if (!Object.values(value).every(value => typeof value === "boolean")) {
    throw new Error("value must be a dictionary of booleans")
  }

  const stateModifiers = Object.keys(value).reduce((result, nextKey) => ({ ...result, [nextKey]: camelToDash(nextKey) }), {}) as Record<string, string>

  const proxy = new Proxy(value, {
    set(target, key: string, value: boolean) {
      // console.log(target, key, value)

      const stateValue = target[key]
      if (stateValue === value) return true

      target[key] = value
      toggleElementClassModification(onElement, stateModifiers[key], value)

      return true
    }
  })

  return proxy
}

function decorateClassModifierToggle<T extends object>(target: T, propertyNameOfState: keyof T, onElement: HTMLElement) {
  let proxy = createClassModifierToggleProxy(target[propertyNameOfState], onElement)

  Object.defineProperty(target, propertyNameOfState, {
    get() {
      return proxy
    },
    set(value: unknown) {
      proxy = createClassModifierToggleProxy(value, onElement)
    },
  })
}

function observeStyleChange(target: Node, mutationCallback: MutationCallback) {
  const mutationObserver = new MutationObserver(mutationCallback)
  mutationObserver.observe(target, {
    attributes: true,
    attributeFilter: ["style"],
  })
}

class PolygonObject extends BoundElement {
  block: PolygonBlock

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

  constructor(element: Node, block: PolygonBlock) {
    super(element)

    this.block = block

    decorateClassModifierToggle(this, "state", this.boundElement)

    observeStyleChange(this.boundElement, () => {
      Boundary.checkIfObjectAllowed(this)
    })

    this.on("contextmenu", (_, event) => {
      event.preventDefault()
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
    const translateX = this.transform.functions.translateX
    const translateY = this.transform.functions.translateY

    if (translateX == null || translateY == null) {
      return new Vector2(0, 0)
    }

    return new Vector2(translateX.value, translateY.value)
  }
  set position(vector: Vector2) {
    // console.log(this, vector)
    // this.transform.origin = [new CSSUnit(0, "px"), new CSSUnit(0, "px")]
    // if (this.rotated) {
    // console.log(Boundary.offset)
    // vector.rotate(this.size.divide(2), 0)
    // console.log(vector.clone().rotate(this.size.divide(2), 0))
    // console.log(vector.clone().rotate(90))

    // console.log(vector)
    // vector.minus(Boundary.offset.clone().reverse())
    // vector.minus(this.size.clone().reverse().divide(2))
    // console.log(vector)

    // }

    this.transform.functions.translateX = new CSSUnit(vector.x, "px")
    this.transform.functions.translateY = new CSSUnit(vector.y, "px")
  }

  rotated: boolean = false
  rotate(origin?: Vector2) {
    this.rotated = !this.rotated

    // this.transform.origin = [new CSSUnit(0, "px"), new CSSUnit(0, "px")]
    if (origin) {
      this.transform.origin = [new CSSUnit(origin.x, "px"), new CSSUnit(origin.y, "px")]
    }
    this.transform.functions.rotateZ = new CSSUnit(this.rotated ? 90 : 0, "deg")
  }

  clone(): PolygonObject {
    const clone = new PolygonObject(this.boundElement.cloneNode(true), this.block)
    clone.position = this.position
    clone.state = { ...this.state }
    return clone
  }

  #onSettledCallbacks: Function[] = []
  onSettled(callback: Function) {
    this.#onSettledCallbacks.push(callback)
  }

  /**
   * Says to polygonObject that it is settled
   */
  settled() {
    this.#onSettledCallbacks.forEach(callback => callback())
  }

  settle() {
    Polygon.settle(this)
  }

  #onUnsettledCallbacks: Function[] = []
  onUnsettled(callback: Function) {
    this.#onUnsettledCallbacks.push(callback)
  }

  /**
   * Says to polygonObject that it is unsettled
   */
  unsettled() {
    this.#onUnsettledCallbacks.forEach(callback => callback())
  }

  unsettle() {
    Polygon.unsettle(this)
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
