class Picker {
  static #boundElement: HTMLElement | null = null
  static #components: Set<PolygonObject> = new Set

  static bindElement(element: HTMLElement) {
    if (this.#boundElement != null) {
      throw new Error(this.name + " boundElement has already been set")
    }

    this.#boundElement = element
  }

  static createComponent(options: PickerComponentOptions) {
    if (options.id == null) options.id = this.#components.size + 1

    const element = document.createElement("div")
    element.appendChild(createImageElement("elements/" + options.id.toString() + ".png"))
    element.classList.add(options.className)
    element.classList.add(...(options.modifiers || []).map(modifier => options.className + CLASS_SPLITTER + modifier))

    const polygonObject = new PolygonObject(element)
    polygonObject.id = options.id

    element.addEventListener("pointerdown", event => onPointerDown(polygonObject, event))

    this.#components.add(polygonObject)

    this.#render()
  }

  static #render() {
    if (this.#boundElement === null) {
      throw new Error(this.name + " boundElement is not set")
    }

    const firstChild = this.#boundElement.children.item(0)
    if (firstChild) {
      this.#boundElement.replaceChildren(firstChild)
    }

    for (const component of this.#components.values()) {
      const componentElement = component.getBoundElement()

      this.#boundElement.append(componentElement)
    }
  }
}

interface PickerComponentOptions {
  id?: keyof never
  className: string
  modifiers?: string[]
  // image: string
}

function createImageElement(src: string) {
  const element = document.createElement("img")
  element.src = src
  return element
}