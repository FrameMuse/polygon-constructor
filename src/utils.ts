function observeObject<T extends object>(target: T, property: keyof T, callbacks: Function[]) {
  const value = target[property]

  if (!isDictionary(value)) {
    throw new Error(`${property.toString()} is not a dictionary`)
  }

  const valueProxy = new Proxy(value, {
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      if (!result) return false

      // Call back immediately after setting the property
      for (const callback of callbacks) callback()

      return true
    },
  })

  Reflect.set(target, property, valueProxy);
}

function observeStyleChange(target: Node, mutationCallback: MutationCallback) {
  const mutationObserver = new MutationObserver(mutationCallback)
  mutationObserver.observe(target, {
    attributes: true,
    attributeFilter: ["style"],
  })
}






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


function createClassModifierToggleProxy(value: unknown, onElement: HTMLElement) {
  if (!isDictionary(value)) {
    throw new Error("value is not a dictionary")
  }

  if (!Object.values(value).every(value => typeof value === "boolean")) {
    throw new Error("value must be a dictionary of booleans")
  }

  const stateModifiers = Object.keys(value).reduce((result, nextKey) => ({ ...result, [nextKey]: camelToDash(nextKey) }), {}) as Record<string, string>

  const proxy = new Proxy(value, {
    set(target, key: string, value: boolean) {
      // console.log(target, key, value)

      const stateValue = target[key]
      if (stateValue === value) return true

      target[key] = value
      toggleElementClassModification(onElement, stateModifiers[key], value)

      return true
    }
  })

  return proxy
}

function decorateClassModifierToggle<T extends object>(target: T, propertyNameOfState: keyof T, onElement: HTMLElement) {
  let proxy = createClassModifierToggleProxy(target[propertyNameOfState], onElement)

  Object.defineProperty(target, propertyNameOfState, {
    get() {
      return proxy
    },
    set(value: unknown) {
      proxy = createClassModifierToggleProxy(value, onElement)
    },
  })
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

