"use strict"

const CLASS_SPLITTER = "--"

const DEFAULT_CLASS_NAME = "polygon-constructor__object"






class Polygon {
  boundary: PolygonBoundary
  area: PolygonArea
  picker: PolygonPicker
  entries: PolygonEntries

  blocks: PolygonBlocks

  constructor() {
    const boundaryElement = document.body.querySelector("[pc-boundary]")
    const areaElement = document.body.querySelector("[pc-area]")
    const pickerElement = document.body.querySelector("[pc-picker]")
    const entriesElement = document.body.querySelector("[pc-entries]")


    if (!(boundaryElement instanceof HTMLElement)) {
      throw new Error("Polygon constructor: no boundary element found")
    }

    if (!(pickerElement instanceof HTMLElement)) {
      throw new Error("Polygon constructor: no picker element found")
    }

    if (!(areaElement instanceof HTMLElement)) {
      throw new Error("Polygon constructor: no polygon element found")
    }

    if (!(entriesElement instanceof HTMLElement)) {
      throw new Error("Polygon constructor: no entries element found")
    }


    this.boundary = new PolygonBoundary(boundaryElement)
    this.area = new PolygonArea(areaElement)
    this.picker = new PolygonPicker(pickerElement)
    this.entries = new PolygonEntries(entriesElement)

    this.blocks = new PolygonBlocks


    this.#startLogic()
  }

  #startLogic() {
    /**
     * A relative point where a polygonObject is grabbed. 
     */
    let polygonObjectGrabOffset: Point = new Point(0, 0)

    this.boundary.onDragStart((polygonObject: PolygonObject, event: PointerEvent) => {
      event.preventDefault()

      polygonObjectGrabOffset = new Point(event.offsetX, event.offsetY)
      polygonObjectGrabOffset.divide(polygonObject.ratio).multiply(this.area.ratio)

      const position = new Point(event.x, event.y)
      position.subtract(polygonObjectGrabOffset)

      polygonObject.ratio = this.area.ratio
      polygonObject.transform.origin = polygonObjectGrabOffset.clone()
      polygonObject.position = this.area.fromAbsoluteToRelative(position)

      this.area.checkIfObjectAllowed(polygonObject)
    })
    this.boundary.onDrag((polygonObject: PolygonObject, event: PointerEvent) => {
      event.preventDefault()

      const position = new Point(event.x, event.y)
      position.subtract(polygonObjectGrabOffset)

      polygonObject.position = this.area.fromAbsoluteToRelative(position)

      this.area.checkIfObjectAllowed(polygonObject)
    })
    this.boundary.onDragEnd((polygonObject: PolygonObject, event: PointerEvent) => {
      event.preventDefault()

      this.boundary.selectedObject = polygonObject

      if (polygonObject.state.notAllowed) {
        this.area.unsettle(polygonObject)
      }
    })

    this.boundary.onKeyDown("r", event => {
      if (event.altKey) return
      if (event.ctrlKey) return

      event.preventDefault()

      if (this.boundary.draggingObject) {
        this.boundary.draggingObject.rotate()
      }
    })


    this.boundary.onSelectedObjectChange((polygonObject) => {
      const entryElement = this.entries.setEntry("selected-block", polygonObject.block.name)

      const rotateButton = document.createElement("button")
      rotateButton.type = "button"
      rotateButton.textContent = "Rotate"
      rotateButton.addEventListener("pointerdown", () => {
        const origin = new Point(polygonObject.rect.width / 2, polygonObject.rect.height / 2)
        polygonObject.rotate(origin)
      })

      entryElement.append(rotateButton)
      addElementClassModification(entryElement, "blue")
    })



    this.blocks.on("add", block => {
      const component = this.picker.addComponent(block)

      this.area.getObjectsById(block.id).forEach(polygonObject => {
        component.usedAmount++
        polygonObject.onUnsettled(() => {
          component.usedAmount--
        })
      })

      component.polygonObject.on("pointerdown", (_, event) => {
        event.preventDefault()

        if (component.usedAmount >= component.maxAmount) return
        const clonedPolygonObject = component.polygonObject.clone()

        this.boundary.makePolygonObjectDraggable(clonedPolygonObject)

        component.usedAmount++
        clonedPolygonObject.onUnsettled(() => {
          component.usedAmount--
        })

        this.boundary.startDragging(clonedPolygonObject, event)
        this.area.settle(clonedPolygonObject)
      })
    })

    this.blocks.on("remove", block => {
      this.area.unsettleAllById(block.id)
      this.picker.removeComponent(block)
    })










  }

  /**
   * Resets the `polygon` to its initial state. Removes all polygonObjects from `area` and clears `blocks`.
   */
  reset(): void {
    this.area.clear()
    this.blocks.clear()
  }

  export(normalizer?: (x: number) => number): PolygonBlockOutput[] {
    const output: PolygonBlockOutput[] = []
    for (const polygonObject of this.area.objects) {
      const position = polygonObject.position.clone()

      if (polygonObject.rotated) {
        const origin = polygonObject.transform.origin.clone()

        position.x += origin.x + origin.y
        position.y += origin.y - origin.x
      }

      if (normalizer) {
        position.normalize(normalizer)
      }

      output.push({
        id: polygonObject.block.id,
        x: position.x,
        y: position.y,
        angle: polygonObject.rotated ? 90 : 0,
      })
    }
    return output
  }

  import(...outputBlocks: PolygonBlockOutput[]): void {
    if (this.area.objectsCount > 0) {
      throw new Error("Polygon import: cannot import when there are already objects in the area.")
    }

    this.picker.clearUsedAmount()

    for (const outputBlock of outputBlocks) {
      const component = this.picker.getComponentById(outputBlock.id)
      if (component == null) {
        throw new Error(`Polygon import: block with id ${outputBlock.id} not found`)
      }

      const polygonObject = component.polygonObject.clone()
      if (outputBlock.angle === 90) {
        polygonObject.rotate()
      }

      polygonObject.ratio = this.area.ratio

      polygonObject.position = new Point(outputBlock.x, outputBlock.y)
      // polygonObject.position.divide(polygonObject.ratio)
      this.boundary.makePolygonObjectDraggable(polygonObject)

      component.usedAmount++
      polygonObject.onUnsettled(() => {
        component.usedAmount--
      })

      this.area.settle(polygonObject)
    }
  }
}


type PolygonBlocksEvent = "add" | "remove" | "clear"
type PolygonBlocksEventListener = (block: PolygonBlock) => void

class PolygonBlocks extends EventEmitter<PolygonBlocksEvent, PolygonBlocksEventListener> {
  #blocks: Map<number, PolygonBlock> = new Map() // id => block

  add(block: PolygonBlock): void {
    this.#blocks.set(block.id, block)

    this.emit("add", block)
  }

  remove(block: PolygonBlock): void {
    this.#blocks.delete(block.id)

    this.emit("remove", block)
  }

  removeById(id: number): void {
    const block = this.getById(id)
    if (block == null) return

    this.remove(block)
  }

  getById(id: number): PolygonBlock | null {
    return this.#blocks.get(id) || null
  }

  clear(): void {
    for (const block of this.#blocks.values()) {
      this.remove(block)
    }
  }

  get size(): number {
    return this.#blocks.size
  }

  get list(): PolygonBlock[] {
    return [...this.#blocks.values()]
  }
}
