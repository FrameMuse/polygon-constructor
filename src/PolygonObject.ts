type PolygonObjectEvent = "settle" | "unsettle" | "destroy"

const DEFAULT_RATIO = 1 / 1

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

  #ratio = DEFAULT_RATIO // px:cm ratio

  set ratio(ratio: number) {
    this.size = this.baseSize.multiply(ratio)
    this.transform.origin.divide(this.#ratio).multiply(ratio)
    this.position = this.#position.clone().divide(this.#ratio).multiply(ratio)

    this.#ratio = ratio
  }

  get ratio(): number {
    return this.#ratio
  }

  get baseSize(): Vector2 {
    return new Vector2(this.block.width, this.block.height)
  }

  constructor(element: Node, block: PolygonBlock) {
    super(element)

    this.block = block
    this.size = new Vector2(this.block.width, this.block.height)

    this.on("contextmenu", (_, event) => {
      event.preventDefault()
    })

    decorateClassModifierToggle(this, "state", this.boundElement)
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

  #position: Point = new Point(0, 0)
  get position(): Point {
    return this.#position
  }
  set position(point: Point) {
    this.#position = point

    this.transform.functions.translateX = new CSSUnit(point.x, "px")
    this.transform.functions.translateY = new CSSUnit(point.y, "px")
  }

  toRational(point: Point): Point {
    return point.multiply(this.ratio)
  }

  fromRational(point: Point): Point {
    return point.divide(this.ratio)
  }

  rotate(origin?: Point) {
    this.rotated = !this.rotated

    if (origin) {
      this.transform.origin = origin.clone()
      // this.transform.functions.rotateZ = this.transform.functions.rotateZ
    }

    this.transform.functions.rotateZ = new CSSUnit(this.rotated ? 90 : 0, "deg")
  }

  clone(): PolygonObject {
    const clone = new PolygonObject(this.boundElement.cloneNode(true), this.block)
    clone.position = this.position
    clone.state = { ...this.state }
    clone.ratio = this.ratio
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
