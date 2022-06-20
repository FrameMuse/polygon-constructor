type PolygonObjectEvent = "settle" | "unsettle" | "destroy"

class PolygonObject extends PolygonComponent {
  #listeners: Map<Function, EventListener> = new Map
  #onSettledCallbacks: Function[] = []
  #onUnsettledCallbacks: Function[] = []

  rotated: boolean = false
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

  get position(): Point {
    const translateX = this.transform.functions.translateX
    const translateY = this.transform.functions.translateY

    return new Point(translateX?.value ?? 0, translateY?.value ?? 0)
  }
  set position(vector: Point) {
    this.transform.functions.translateX = new CSSUnit(vector.x, "px")
    this.transform.functions.translateY = new CSSUnit(vector.y, "px")
  }


  rotate(origin?: Point) {
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


  onSettled(callback: Function) {
    this.#onSettledCallbacks.push(callback)
  }

  /**
   * Says to polygonObject that it is settled
   */
  settled() {
    for (const callback of this.#onSettledCallbacks) callback()
  }


  onUnsettled(callback: Function) {
    this.#onUnsettledCallbacks.push(callback)
  }

  /**
   * Says to polygonObject that it is unsettled
   */
  unsettled() {
    for (const callback of this.#onUnsettledCallbacks) callback()
  }

  destroy() {
    this.boundElement.remove()
    this.#listeners.clear()
  }

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
}
