abstract class PolygonComponent {
  #boundElement: HTMLElement
  #transform: CSSTransform

  constructor(element: Node) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("boundElement must be an instance of HTMLElement")
    }

    this.#boundElement = element
    this.#transform = new CSSTransform(element)
  }

  get rect(): DOMRect {
    return this.#boundElement.getBoundingClientRect()
  }

  get size(): Point {
    const rect = this.rect

    return new Point(rect.width, rect.height)
  }

  get offset(): Point {
    const rect = this.rect

    return new Point(rect.left, rect.top)
  }

  get boundElement(): HTMLElement {
    return this.#boundElement
  }

  get transform(): CSSTransform {
    return this.#transform
  }
}
