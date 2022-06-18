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

  static createComponent(options: PickerComponentOptions) {
    if (options.id == null) options.id = this.#components.size + 1

    const component = new PickerComponent(options)
    component.polygonObject.boundElement.addEventListener("pointerdown", event => {
      if (component.usedAmount >= component.maxAmount) return

      const clonedPolygonObject = clonePolygonObject(component.polygonObject)

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
    this.maxUnitsT[options.id] = options.maxAmount || Infinity

    this.#render()
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

interface PickerComponentOptions {
  id?: keyof never
  title: string
  className: string
  modifiers?: string[]
  // image: string
  maxAmount: number
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

  constructor(options: PickerComponentOptions) {
    this.maxAmount = options.maxAmount

    this.#element = composePickerBlockElement()
    this.#polygonObject = composePolygonObject(options)

    this.#element.append(composePickerBlockTitleElement(options.title))
    this.#element.append(this.#polygonObject.boundElement)

    this.#amountElement = composePickerBlockAmountElement(options.maxAmount)
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

function composePolygonObject(options: PickerComponentOptions): PolygonObject {
  if (options.id == null) options.id = -1

  const element = document.createElement("div")
  element.appendChild(composeImageElement("elements/" + options.id.toString() + ".png"))
  element.classList.add(options.className)
  element.classList.add(...(options.modifiers || []).map(modifier => options.className + CLASS_SPLITTER + modifier))

  const polygonObject = new PolygonObject(element)
  polygonObject.id = options.id

  return polygonObject
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