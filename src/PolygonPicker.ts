const PICKET_BLOCK_CLASS = "polygon-constructor-sidebar-block"

class PolygonPicker extends PolygonComponent {
  #components: Map<number, PolygonPickerComponent> = new Map // id => component

  addComponent(block: PolygonBlock): PolygonPickerComponent {

    const component = new PolygonPickerComponent(block)
    if (component.maxAmount === 0) {
      this.removeComponent(block) // Remove if there is already block
      this.#render()
      return component
    }

    this.#components.set(block.id, component)
    this.#render()

    return component
  }

  removeComponent(block: PolygonBlock) {
    const component = this.getComponentById(block.id)
    if (component == null) return


    this.removeComponentById(block.id)
  }

  removeComponentById(id: number) {
    this.#components.delete(id)
    this.#render()
  }

  getComponentById(id: number): PolygonPickerComponent | undefined {
    return [...this.#components.values()].find(component => component.polygonObject.block.id === id)
  }

  clearUsedAmount() {
    for (const component of this.#components.values()) {
      component.usedAmount = 0
    }
  }

  get components(): PolygonPickerComponent[] {
    return [...this.#components.values()]
  }

  getUnrealizedComponents(): PolygonPickerComponent[] {
    return [...this.#components.values()].filter(component => component.usedAmount !== component.maxAmount)
  }

  getUnderusedComponents(): PolygonPickerComponent[] {
    return [...this.#components.values()].filter(component => component.usedAmount < component.maxAmount)
  }

  getOverusedComponents(): PolygonPickerComponent[] {
    return [...this.#components.values()].filter(component => component.usedAmount > component.maxAmount)
  }

  #render() {
    // Remove all children
    this.boundElement.replaceChildren()
    // Add all components
    for (const component of this.#components.values()) {
      this.boundElement.append(component.element)
    }
  }
}

class PolygonPickerComponent {
  #element: HTMLElement // Picket wrapper element
  #polygonObject: PolygonObject
  #amountElement: HTMLElement

  maxAmount: number = 0
  #usedAmount: number = 0
  set usedAmount(value: number) {
    // if (value < 0) return

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

