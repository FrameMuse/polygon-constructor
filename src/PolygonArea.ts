class PolygonArea extends PolygonComponent {
  #objects: Set<PolygonObject> = new Set
  #events: EventEmitter<"change", (objects: PolygonObject[]) => void> = new EventEmitter

  constructor(element: Node) {
    super(element)

    this.#setBackgroundGrid()
  }

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

    polygonObject.settled()
    this.#events.emit("change", this.objects)
  }

  /**
   * Will remove it from Polygon, render it, then say to polygonObject that it is unsettled.
   * 
   * @param polygonObject PolygonObject to remove from Polygon
   */
  unsettle(polygonObject: PolygonObject) {

    this.#objects.delete(polygonObject)
    this.#render()

    polygonObject.unsettled()
    this.#events.emit("change", this.objects)
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
    return this.objects.filter(object => object.block.id === id)
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
   * @param width Width of Polygon in pixels
   * @param height Height of Polygon in pixels
   * @param color Color of Polygon in CSS format
   */
  #setBackgroundGrid(width = 100, height = 100, color = "#333") {
    this.boundElement.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='100%25' height='1000px' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='${width}px' height='${height}px' patternUnits='userSpaceOnUse'%3E%3Crect width='10000000000' height='10000000000' fill='none'/%3E%3Cpath d='M 10000000000 0 L 0 0 0 10000000000' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
  }

  #ratio = 1 / 1
  set ratio(ratio: number) {
    for (const object of this.#objects) {
      object.ratio = ratio
    }

    this.#setBackgroundGrid(100 * ratio, 100 * ratio)

    this.#ratio = ratio
    this.#render()
  }

  get ratio(): number {
    return this.#ratio
  }


  setOpenWalls(...sides: ("left" | "right" | "top" | "bottom")[]) {
    this.boundElement.style.border = "20px solid"

    for (const side of sides) {
      if (side === "left") {
        this.boundElement.style.borderLeft = "none"
      }

      if (side === "right") {
        this.boundElement.style.borderRight = "none"
      }

      if (side === "top") {
        this.boundElement.style.borderTop = "none"
      }

      if (side === "bottom") {
        this.boundElement.style.borderBottom = "none"
      }
    }
  }


  /**
   * 
   * Checks whether polygonObject is within Polygon borders
   */
  contains(polygonObject: PolygonObject): boolean {
    const leftTop = this.leftTop.clone()
    leftTop.add(this.borderLeftTop)

    const rightBottom = this.rightBottom.clone()
    rightBottom.subtract(this.borderRightBottom)

    if (leftTop.greaterThan(polygonObject.leftTop)) return false
    if (rightBottom.lessThan(polygonObject.rightBottom)) return false

    return true
  }

  /**
   * 
   * Checks whether polygonObject intersects any polygonObjects inside Polygon
   * 
   * @returns intersected `polygonObject`
   */
  intersectsAny(polygonObjectOther: PolygonObject): boolean {
    for (const polygonObject of this.#objects) {
      if (polygonObject.block.atop) continue
      if (polygonObjectOther.block.atop) continue

      if (polygonObject.intersects(polygonObjectOther)) return true
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
    // Remove borders
    relative.subtract(this.borderLeftTop)

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

    if (!polygonObject.block.atop) {
      if (this.intersectsAny(polygonObject)) {
        polygonObject.state.notAllowed = true
        return false
      }
    }

    polygonObject.state.notAllowed = false
    return true
  }

  checkIfObjectsAllowed(polygonObjects: PolygonObject[]): boolean {
    return polygonObjects.every(this.checkIfObjectAllowed.bind(this))
  }
}
