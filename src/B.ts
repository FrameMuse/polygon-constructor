

// Math.clamp = function (x: number, min: number, max: number) {
//   return Math.min(Math.max(x, min), max);
// }

abstract class BoundElement {
  #boundElement: HTMLElement
  #transform: CSSTransform

  constructor(element: unknown) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("boundElement must be an instance of HTMLElement")
    }

    this.#boundElement = element

    this.#transform = new CSSTransform(element)
  }

  get rect(): DOMRect {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    return this.#boundElement.getBoundingClientRect()
  }

  get boundElement(): HTMLElement {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    return this.#boundElement
  }

  get transform(): CSSTransform {
    return this.#transform
  }
}

abstract class BoundElementStatic {
  static #boundElement: HTMLElement | null = null

  static bindElement(element: unknown) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("boundElement must be an instance of HTMLElement")
    }

    if (this.#boundElement != null) {
      throw new Error(this.name + " boundElement has already been set")
    }

    this.#boundElement = element
  }

  static get rect(): DOMRect {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    return this.#boundElement.getBoundingClientRect()
  }

  static get boundElement() {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    return this.#boundElement
  }
}