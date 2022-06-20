class PolygonArea extends PolygonComponent {
  #objects: Set<PolygonObject> = new Set
  #events: EventEmitter<"change", (objects: PolygonObject[]) => void> = new EventEmitter

  /**
   * Will add it to Polygon, render it, then say to polygonObject that it is settled.
   * 
   * @param polygonObject PolygonObject to add to Polygon
   */
  settle(polygonObject: PolygonObject) {
    observeStyleChange(polygonObject.boundElement, () => {
      this.checkIfObjectAllowed(polygonObject)
    })

    this.#objects.add(polygonObject)
    this.#render()

    this.#events.emit("change", this.objects)
    polygonObject.settled()
  }

  /**
   * Will remove it from Polygon, render it, then say to polygonObject that it is unsettled.
   * 
   * @param polygonObject PolygonObject to remove from Polygon
   */
  unsettle(polygonObject: PolygonObject) {

    this.#objects.delete(polygonObject)
    this.#render()

    this.#events.emit("change", this.objects)
    polygonObject.unsettled()
  }

  unsettleAllById(id: number) {
    for (const object of this.#objects) {
      if (object.block.id === id) {
        this.unsettle(object)
      }
    }
  }

  unsettleLastById(id: number) {
    for (const object of this.#objects) {
      if (object.block.id === id) {
        this.unsettle(object)
        return
      }
    }
  }

  #render() {
    // Remove all children
    this.boundElement.replaceChildren()
    // Add all polygon objects
    for (const polygonObject of this.#objects) {
      this.boundElement.append(polygonObject.boundElement)
    }
  }

  get objects(): PolygonObject[] {
    return [...this.#objects]
  }

  get objectsCount(): number {
    return this.#objects.size
  }

  getObjectsById(id: number): PolygonObject[] {
    return [...this.#objects].filter(object => object.block.id === id)
  }

  clear() {
    this.#objects.clear()

    this.#render()
  }

  onChange(callback: (objects: PolygonObject[]) => void) {
    this.#events.on("change", callback)
  }





  /**
   * 
   * Checks whether polygonObject is within Polygon borders
   */
  contains(polygonObject: PolygonObject): boolean {
    const polygonRect = this.rect
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
  intersectsAny(polygonObject: PolygonObject): boolean {
    for (const otherPolygonObject of this.#objects) {
      if (polygonObject.intersects(otherPolygonObject)) return true
    }

    return false
  }

  /**
   * 
   * @param absolute `Point` in absolute coordinates (not relative to Polygon, but to document)
   * @returns `Point` in relative coordinates to Polygon
   */
  fromAbsoluteToRelative(absolute: Point): Point {
    const relative = absolute.clone()

    // Removing top, left of `Polygon`
    relative.subtract(this.rect.left, this.rect.top)


    const computedStyle = getComputedStyle(this.boundElement)

    const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth)
    const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth)


    // Remove borders
    relative.subtract(borderX, borderY)

    return relative
  }

  /**
   * 
   * Checks if polygonObject can be placed 
   * 
   * Also sets notAllowed state on draggingObject accordingly
   */
  checkIfObjectAllowed(polygonObject: PolygonObject): boolean {
    if (!this.contains(polygonObject)) {
      polygonObject.state.notAllowed = true
      return false
    }

    if (this.intersectsAny(polygonObject)) {
      polygonObject.state.notAllowed = true
      return false
    }

    polygonObject.state.notAllowed = false
    return true
  }

  // checkIfObjectsAllowed(polygonObjects: PolygonObject[]): boolean {
  //   return polygonObjects.every(this.checkIfObjectAllowed)
  // }

  // checkIfObjectsAllowedAndSetDropNotAllowed(polygonObjects: PolygonObject[]): boolean {
  //   const result = this.checkIfObjectsAllowed(polygonObjects)

  //   if (!result) {
  //     this.dropNotAllowed = true
  //   } else {
  //     this.dropNotAllowed = false
  //   }

  //   return result
  // }
}
