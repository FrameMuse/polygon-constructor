abstract class PolygonComponent {
  #boundElement: HTMLElement
  #transform: CSSTransform

  // #ratio = 1 / 1 // px:cm ratio

  // get ratio() {
  //   return this.#ratio
  // }
  // /**
  //  * Has immediate effect on the element.
  //  * Affects position and size.
  //  */
  // set ratio(value) {
  //   this.#ratio = value
  // }

  constructor(element: Node) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("boundElement must be an instance of HTMLElement")
    }

    this.#boundElement = element
    this.#transform = new CSSTransform(element)
  }


  /**
   * Returns the rects of the element. It is not affected by the ratio.
   */
  get rect(): DOMRect {
    return this.#boundElement.getBoundingClientRect()
  }

  get size(): Vector2 {
    const rect = this.rect

    return new Vector2(rect.width, rect.height)
  }

  /**
   * Sets size in pixels.
   */
  set size(vector: Vector2) {
    this.boundElement.style.width = vector.x + "px"
    this.boundElement.style.height = vector.y + "px"
  }

  // get width(): number {
  //   return this.size.x
  // }

  // set width(width: number) {
  //   this.boundElement.style.width = width + "px"
  // }

  // get height(): number {
  //   return this.size.x
  // }

  // set height(height: number) {
  //   this.boundElement.style.height = height + "px"
  // }

  get leftTop(): Point {
    const rect = this.rect

    return new Point(rect.left, rect.top)
  }

  get rightBottom(): Point {
    const rect = this.rect

    return new Point(rect.right, rect.bottom)
  }

  get borderLeftTop(): Point {
    const computedStyle = getComputedStyle(this.boundElement)

    const borderX = parseFloat(computedStyle.borderLeftWidth)
    const borderY = parseFloat(computedStyle.borderTopWidth)

    return new Point(borderX, borderY)
  }

  get borderRightBottom(): Point {
    const computedStyle = getComputedStyle(this.boundElement)

    const borderX = parseFloat(computedStyle.borderRightWidth)
    const borderY = parseFloat(computedStyle.borderBottomWidth)

    return new Point(borderX, borderY)
  }

  get boundElement(): HTMLElement {
    return this.#boundElement
  }

  get transform(): CSSTransform {
    return this.#transform
  }
}
