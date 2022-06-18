function observeObject(target: object, property: string, callbacks: Function[]) {
  const value = ((target as never)[property] as object);

  ((target as never)[property] as unknown) = new Proxy(value, {
    set(target, key, value, receiver) {
      // Call immediately after setting the property
      setTimeout(() => {
        for (const callback of callbacks) callback()
      })
      return Reflect.set(target, key, value, receiver)
    },
  })
}
function observeProperty<T extends object>(target: T, property: keyof T, callbacks: Function[]) {
  const value = ((target as never)[property] as unknown);

  ((target as never)[property] as unknown) = new Proxy({ current: value }, {
    set(target, _key, value, receiver) {
      // Call immediately after setting the property
      setTimeout(() => {
        for (const callback of callbacks) callback()
      })
      return Reflect.set(target, "current", value, receiver)
    },
  })
}

class CSSTransform {
  /**
   * The `transform` functions
   */
  functions: Partial<CSSTransformFunctions>
  origin: [CSSUnit, CSSUnit] = [new CSSUnit(0), new CSSUnit(0)]

  #callbacks: Function[] = []

  constructor(transform: string)
  constructor(transform: CSSTransform)
  constructor(element: HTMLElement)
  constructor(arg1: string | CSSTransform | HTMLElement) {
    this.functions = {}

    if (typeof arg1 === "string") {
      this.functions = CSSTransform.parse(arg1)
    }


    if (arg1 instanceof CSSTransform) {
      this.functions = arg1.functions
    }

    if (arg1 instanceof HTMLElement) {
      const transform = arg1.style.transform

      this.functions = CSSTransform.parse(transform)
      this.connect(arg1)
    }

    observeObject(this, "functions", this.#callbacks)
    observeProperty(this, "origin", this.#callbacks)
  }

  /**
   * Triggers the callback when the `transform` functions are changed
   * 
   * @param callback The callback to be called when the `transform` is changed
   */
  observe(callback: Function): void {
    this.#callbacks.push(callback)
  }

  connect(element: HTMLElement) {
    this.observe(() => {
      element.style.transform = this.stringifyFunctions()
      element.style.transformOrigin = this.stringifyOrigin()
    })
  }

  stringifyFunctions(): string {
    const result: string[] = []
    for (const [transformFunction, domUnit] of Object.entries(this.functions)) {
      result.push(transformFunction + "(" + domUnit.toString() + ")")
    }

    return result.join(" ")
  }

  stringifyOrigin(): string {
    return this.origin[0].toString() + " " + this.origin[1].toString()
  }

  static parse(transform: string): Record<string, CSSUnit> {
    if (transform.length === 0) return {}

    const result: Record<string, CSSUnit> = {}

    for (const transformFunction of transform.split(" ")) {
      const [key, value] = transformFunction.split("(")
      result[key] = new CSSUnit(value.slice(0, -1))
    }

    return result
  }
}

interface CSSTransformFunctions {
  translateX: CSSUnit,
  translateY: CSSUnit,

  scaleX: CSSUnit,
  scaleY: CSSUnit,

  skewX: CSSUnit,
  skewY: CSSUnit,

  rotateX: CSSUnit,
  rotateY: CSSUnit,
  rotateZ: CSSUnit,

  matrix: CSSUnit,
}


class CSSUnit {
  value: number
  type?: CSSUnitType

  static readonly Types = ["px", "cm", "mm", "in", "pt", "pc", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "%", "deg", "rad", "turn", "s", "ms", "Hz", "kHz", "dpi", "dpcm", "dppx", "fr"] as CSSUnitType[]

  constructor(unit: string)
  constructor(value: number, type?: CSSUnitType)
  constructor(arg1: string | number, arg2?: CSSUnitType) {
    this.value = 0
    this.type = undefined

    if (typeof arg1 === "string" && arg2 === undefined) {
      const valueSplitted = /([0-9.]+)(.*)?/.exec(arg1)
      if (valueSplitted === null) throw new Error("Invalid unit")

      const probableValue = valueSplitted[1]
      const probableType = valueSplitted[2]

      if (!CSSUnit.checkType(probableType)) {
        throw new Error("Invalid unit type")
      }

      this.value = parseFloat(probableValue)
      this.type = probableType
    }

    if (typeof arg1 === "number") {
      this.value = arg1
      this.type = arg2
    }
  }

  toString(): string {
    return this.value + (this.type ?? "")
  }

  static checkType(type: string): type is CSSUnitType {
    // We don't need to care about the type of `type` here.
    return CSSUnit.Types.includes(type as never)
  }
}

type CSSUnitType =
  | "px"
  | "cm"
  | "mm"
  | "in"
  | "pt"
  | "pc"
  | "em"
  | "ex"
  | "ch"
  | "rem"
  | "vw"
  | "vh"
  | "vmin"
  | "vmax"
  | "%"
  | "deg"
  | "rad"
  | "turn"
  | "s"
  | "ms"
  | "Hz"
  | "kHz"
  | "dpi"
  | "dpcm"
  | "dppx"
  | "fr"