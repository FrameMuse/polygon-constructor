class Polygon {
  static #objects: Set<PolygonObject> = new Set
  static #boundElement: HTMLElement | null = null

  static bindElement(element: HTMLElement) {
    if (this.#boundElement != null) {
      throw new Error(this.name + " boundElement has already been set")
    }

    this.#boundElement = element
  }

  static settle(polygonObject: PolygonObject) {
    this.#objects.add(polygonObject)

    this.#render()
  }

  static unsettle(polygonObject: PolygonObject) {
    this.#objects.delete(polygonObject)

    this.#render()
  }

  /**
   * 
   * Checks whether polygonObject is within Polygon borders
   */
  static contains(polygonObject: PolygonObject): boolean {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    const polygonRect = this.#boundElement.getBoundingClientRect()
    const polygonObjectRect = polygonObject.rect


    if (polygonRect.left > polygonObjectRect.left) return false
    if (polygonRect.top > polygonObjectRect.top) return false

    if (polygonRect.right < polygonObjectRect.right) return false
    if (polygonRect.bottom < polygonObjectRect.bottom) return false


    return true
  }

  /**
   * 
   * Checks whether polygonObject intersects any polygonObjects inside Polygon
   */
  static intersectsOtherObjects(polygonObject: PolygonObject): boolean {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    for (const otherPolygonObject of this.#objects.values()) {
      if (polygonObject.intersects(otherPolygonObject)) return true
    }

    return false
  }

  static #render() {
    if (this.#boundElement === null) {
      throw new Error("boundElement is not set")
    }

    const firstChild = this.#boundElement.children.item(0)
    if (firstChild) {
      this.#boundElement.replaceChildren(firstChild)
    }

    for (const polygonObject of this.#objects.values()) {
      const polygonElement = polygonObject.getBoundElement()

      this.#boundElement.append(polygonElement)
    }
  }
}
