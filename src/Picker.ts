const PICKER_BLOCK_TEMPLATE = document.body.querySelector("[pc-picker-block-example]") as HTMLTemplateElement
const PICKET_BLOCK_CLASS = "polygon-constructor-sidebar-block"

class Picker {
  static #boundElement: HTMLElement | null = null
  static #components: Set<PickerComponent> = new Set
  /**
   * @deprecated
   */
  static maxUnitsT: Record<keyof never, number> = {}

  static bindElement(element: HTMLElement) {
    if (this.#boundElement != null) {
      throw new Error(this.name + " boundElement has already been set")
    }

    this.#boundElement = element
  }

  static addComponent(block: PolygonBlock) {
    const component = new PickerComponent(block)
    component.polygonObject.on("pointerdown", (_, event) => {
      if (component.usedAmount >= component.maxAmount) return

      const clonedPolygonObject = component.polygonObject.clone()

      clonedPolygonObject.state.draggable = true
      clonedPolygonObject.on("pointerdown", startDragging)

      clonedPolygonObject.onSettled(() => {
        component.usedAmount++
      })
      clonedPolygonObject.onUnsettled(() => {
        component.usedAmount--
      })

      startDragging(clonedPolygonObject, event)
      Polygon.settle(clonedPolygonObject)
    })

    this.#components.add(component)
    this.#render()
  }

  static getComponentById(id: number): PickerComponent | undefined {
    return [...this.#components.values()].find(component => component.polygonObject.block.id === id)
  }

  static #render() {
    if (this.#boundElement === null) {
      throw new Error(this.name + " boundElement is not set")
    }

    // Remove all children
    this.#boundElement.replaceChildren()

    for (const component of this.#components) {
      this.#boundElement.append(component.element)
    }
  }
}

class PickerComponent {
  #element: HTMLElement // Picket wrapper element
  #polygonObject: PolygonObject
  #amountElement: HTMLElement

  maxAmount: number = 0
  #usedAmount: number = 0
  set usedAmount(value: number) {
    if (value < 0) return

    this.#usedAmount = value
    this.#amountElement.textContent = "x" + String(this.maxAmount - value)

    toggleElementClassModification(this.#element, "disabled", value >= this.maxAmount)
  }

  get usedAmount(): number {
    return this.#usedAmount
  }

  constructor(block: PolygonBlock) {
    this.maxAmount = block.amount

    this.#element = composePickerBlockElement()
    this.#polygonObject = composePolygonObject(block)

    this.#element.append(composePickerBlockTitleElement(block.name))
    this.#element.append(this.#polygonObject.boundElement)

    this.#amountElement = composePickerBlockAmountElement(block.amount)
    this.#element.append(this.#amountElement)
  }

  get element(): HTMLElement {
    return this.#element
  }

  get polygonObject(): PolygonObject {
    return this.#polygonObject
  }
}

function composePickerBlockElement() {
  const pickerElement = document.createElement("div")
  pickerElement.className = PICKET_BLOCK_CLASS

  return pickerElement
}

function composePolygonObject(block: PolygonBlock): PolygonObject {
  if (block.id == null) block.id = -1

  const element = document.createElement("div")
  element.appendChild(composeImageElement("elements/" + block.id.toString() + ".png"))
  element.classList.add(DEFAULT_CLASS_NAME)


  return new PolygonObject(element, block)
}

function composeImageElement(src: string) {
  const element = document.createElement("img")
  element.src = src

  return element
}

function composePickerBlockTitleElement(title: string) {
  const element = document.createElement("div")
  element.className = PICKET_BLOCK_CLASS + "__title"
  element.textContent = title

  return element
}

function composePickerBlockAmountElement(amount: number) {
  const element = document.createElement("div")
  element.className = PICKET_BLOCK_CLASS + "__amount"
  element.textContent = "x" + String(amount)

  return element
}