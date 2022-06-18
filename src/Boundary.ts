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

    const componentName = polygonObject.id ? componentNames[polygonObject.id] : "unknown"
    const objectsByGroups = Polygon.getObjectsByGroups()

    resultTitle.innerHTML = componentName
    const rotateButton = document.createElement("button")
    rotateButton.type = "button"
    rotateButton.textContent = "Rotate"
    rotateButton.addEventListener("pointerdown", () => {
      const origin = new Vector2(polygonObject.rect.width / 2, polygonObject.rect.height / 2)
      polygonObject.rotate(origin)
    })
    resultTitle.append(rotateButton)

    resultText.innerHTML = `Использованные блоки => <br>${Object.keys(objectsByGroups).map(key => {
      const objectsGroup = objectsByGroups[key]

      return `"${componentNames[key]}": ${objectsGroup?.length || "Bug detected"}`
    }).join(",<br>")}`
  }

  static dropNotAllowed: boolean = false

  /**
   * 
   * Checks if polygonObject can be placed 
   * 
   * Also sets notAllowed state on draggingObject accordingly
   */
  static checkIfObjectAllowed(polygonObject: PolygonObject): boolean {
    if (!Polygon.contains(polygonObject)) {
      polygonObject.notAllowed = true
      return false
    }

    if (Polygon.intersectsOtherObjects(polygonObject)) {
      polygonObject.notAllowed = true
      return false
    }

    polygonObject.notAllowed = false
    return true
  }

  static checkIfObjectsAllowed(polygonObjects: PolygonObject[]): boolean {
    return polygonObjects.every(this.checkIfObjectAllowed)
  }

  static checkIfObjectsAllowedAndSetDropNotAllowed(polygonObjects: PolygonObject[]): boolean {
    const result = this.checkIfObjectsAllowed(polygonObjects)

    if (!result) {
      this.dropNotAllowed = true
    } else {
      this.dropNotAllowed = false
    }

    return result
  }

  static currentPointerEvent: PointerEvent = new PointerEvent("")

  static updateOffset(pointerEvent?: PointerEvent): Vector2 {
    const event = pointerEvent ?? this.currentPointerEvent

    Boundary.offset = new Vector2(event.offsetX, event.offsetY)
    return Boundary.offset
  }
}
