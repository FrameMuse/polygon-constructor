function isElementClassModifiedBy(element: HTMLElement, modifier: string): boolean {
  const baseClass = element.classList[0]
  return element.classList.contains(baseClass + CLASS_SPLITTER + modifier)
}

function addElementClassModification(element: HTMLElement, modifier: string) {
  if (isElementClassModifiedBy(element, modifier)) return

  const baseClass = element.classList[0]
  element.classList.add(baseClass + CLASS_SPLITTER + modifier)
}

function removeElementClassModification(element: HTMLElement, modifier: string) {
  if (!isElementClassModifiedBy(element, modifier)) return

  const baseClass = element.classList[0]
  element.classList.remove(baseClass + CLASS_SPLITTER + modifier)
}
