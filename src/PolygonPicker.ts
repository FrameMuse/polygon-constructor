const PICKET_BLOCK_CLASS = "polygon-constructor-sidebar-block"

class PolygonPicker extends PolygonComponent {
  #components: Map<number, PolygonPickerComponent> = new Map // id => component
  #events: EventEmitter<"add" | "remove", (component: PolygonPickerComponent) => void> = new EventEmitter

  addComponent(block: PolygonBlock): PolygonPickerComponent {
    const component = new PolygonPickerComponent(block)

    this.#events.emit("add", component)

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
    this.#events.emit("remove", this.getComponentById(id)!)

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

  onComponentAdded(callback: (component: PolygonPickerComponent) => void) {
    this.#events.on("add", callback)
  }

  onComponentRemoved(callback: (component: PolygonPickerComponent) => void) {
    this.#events.on("remove", callback)
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