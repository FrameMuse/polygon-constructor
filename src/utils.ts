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

function toggleElementClassModification(element: HTMLElement, modifier: string, force?: boolean) {
  const baseClass = element.classList[0]

  if (force === true) {
    element.classList.add(baseClass + CLASS_SPLITTER + modifier)
  } else {
    element.classList.remove(baseClass + CLASS_SPLITTER + modifier)
  }
}

function isDictionary(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object.constructor === Object
}

function camelToDash(string: string | symbol): string {
  string = string.toString()

  if (string != string.toLowerCase()) {
    string = string.replace(/[A-Z]/g, match => "-" + match.toLowerCase())
  }

  return string
}

