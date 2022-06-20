class PolygonEntries extends PolygonComponent {
  entries: Map<number | string, HTMLElement> = new Map // id => element

  setEntry(id: number | string, textContent: string, modification?: string): HTMLElement {
    this.deleteEntry(id)

    // if (!this.entries.has(id)) {
    const element = this.createEntryElement()

    this.entries.set(id, element)
    this.boundElement.appendChild(element)
    // }

    // const element = this.entries.get(id)!
    element.textContent = textContent

    if (modification) {
      addElementClassModification(element, modification)
    }

    return element
  }

  deleteEntry(id: number | string): void {
    this.entries.get(id)?.remove()
    this.entries.delete(id)
  }


  createEntryElement(): HTMLElement {
    const element = document.createElement("div")
    element.classList.add(this.boundElement.className + "__entry")

    return element
  }
}