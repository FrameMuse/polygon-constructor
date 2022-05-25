class Boundary {
  static #boundElement: HTMLElement | null = null

  static bindElement(element: HTMLElement) {
    if (this.#boundElement != null) {
      throw new Error(this.name + " boundElement has already been set")
    }

    this.#boundElement = element
  }

  static get rect(): DOMRect {
    if (this.#boundElement === null) {
      throw new Error(this.name + " boundElement is not set")
    }

    return this.#boundElement.getBoundingClientRect()
  }
  static offset: Vector2 = new Vector2(0, 0)

  static #draggingObject: PolygonObject | null = null
  /**
   * The current polygonObject which is being dragged
   */
  static get draggingObject(): PolygonObject | null {
    return this.#draggingObject
  }
  static set draggingObject(polygonObject: PolygonObject | null) {
    if (this.#draggingObject === polygonObject) return

    if (this.#draggingObject != null && polygonObject == null) {
      this.#draggingObject.dragging = false
      this.#draggingObject = null

      return
    }

    if (polygonObject != null) {
      this.#draggingObject = polygonObject
      this.#draggingObject.dragging = true

      return
    }

    throw new Error("Something wrong")
  }

  static #selectedObject: PolygonObject | null = null
  /**
   * The current polygonObject which is selected
   */
  static get selectedObject(): PolygonObject | null {
    return this.#selectedObject
  }

  static set selectedObject(polygonObject: PolygonObject | null) {
    if (polygonObject === null) return
    if (this.#selectedObject === polygonObject) return

    if (this.#selectedObject) {
      this.#selectedObject.selected = false
    }

    polygonObject.selected = true

    this.#selectedObject = polygonObject

    if (result instanceof HTMLElement) {
      const componentName = polygonObject.id ? componentNames[polygonObject.id] : "unknown"
      result.textContent = "Выбрано => " + componentName
    }
  }

  static dropNotAllowed: boolean = false

  /**
   * 
   * Checks if polygonObject can be placed 
   * 
   * Also sets notAllowed state on draggingObject accordingly
   */
  static checkIfCanDropObject(): boolean {
    if (this.#draggingObject === null) return false

    if (!Polygon.contains(this.#draggingObject)) {
      this.#draggingObject.notAllowed = true
      return false
    }

    if (Polygon.intersectsOtherObjects(this.#draggingObject)) {
      this.#draggingObject.notAllowed = true
      return false
    }

    this.#draggingObject.notAllowed = false
    return true
  }
}
