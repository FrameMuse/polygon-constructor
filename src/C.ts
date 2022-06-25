class Point {
  constructor(public x: number, public y: number) { }

  add(point: Point): Point
  add(x: number, y: number): Point
  add(arg1: number | Point, arg2?: number): Point {
    if (arg1 instanceof Point) {
      this.x += arg1.x
      this.y += arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x += arg1
      this.y += arg2
    }

    return this
  }

  subtract(point: Point): Point
  subtract(x: number, y: number): Point
  subtract(arg1: number | Point, arg2?: number): Point {
    if (arg1 instanceof Point) {
      this.x -= arg1.x
      this.y -= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x -= arg1
      this.y -= arg2
    }

    return this
  }

  multiply(point: Point): Point
  multiply(xy: number): Point
  multiply(x: number, y: number): Point
  multiply(arg1: number | Point, arg2?: number): Point {
    if (arg1 instanceof Point) {
      this.x *= arg1.x
      this.y *= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "undefined") {
      this.x *= arg1
      this.y *= arg1
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x *= arg1
      this.y *= arg2
    }

    return this
  }

  divide(point: Point): Point
  divide(xy: number): Point
  divide(x: number, y: number): Point
  divide(arg1: number | Point, arg2?: number): Point {
    if (arg1 instanceof Point) {
      this.x /= arg1.x
      this.y /= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "undefined") {
      this.x /= arg1
      this.y /= arg1
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x /= arg1
      this.y /= arg2
    }

    return this
  }

  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y
  }

  lessThan(point: Point): boolean {
    return this.x < point.x || this.y < point.y
  }

  greaterThan(point: Point): boolean {
    return this.x > point.x || this.y > point.y
  }

  clone(): Point {
    return new Point(this.x, this.y)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }

  reverse() {
    this.y = this.x
    this.x = this.y

    return this
  }

  normalize(normalizer: (x: number) => number): Point {
    this.x = normalizer(this.x)
    this.y = normalizer(this.y)

    return this
  }
}

class Vector2 extends Point { }

class CSSTransform {
  /**
   * The `transform` functions.
   * Have side effects.
   * Use `observe` to listen for changes.
   */
  readonly functions: Partial<CSSTransformFunctions>
  origin: Point = new Point(0, 0)

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
  }

  /**
   * Triggers the callback when the `transform` functions are changed
   * 
   * @param callback The callback to be called when the `transform` is changed
   */
  observe(callback: Function): void {
    this.#callbacks.push(callback)
  }

  /**
   * Connects the `transform` to the given element.
   * This will update the `transform` on the `element` when a function is changed. 
   * In addition, this will update the `origin` when the `origin` is changed.
   * 
   * @param element The element to connect to
   */
  connect(element: HTMLElement): void {
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

  stringifyOrigin(unitType: CSSUnitType = "px"): string {
    // console.log(this.origin)
    // console.log(this.origin)
    return `${this.origin.x}${unitType} ${this.origin.y}${unitType}`
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

  scale: CSSUnit,

  skewX: CSSUnit,
  skewY: CSSUnit,

  rotateX: CSSUnit,
  rotateY: CSSUnit,
  rotateZ: CSSUnit,
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


// TODO: Refactor generics
class EventEmitter<Type extends string, Listener extends (...args: never[]) => void> {
  #listeners: Map<Type, Set<Listener>> = new Map

  on(event: Type, listener: Listener): void {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set())
    }

    this.#listeners.get(event)!.add(listener)
  }

  off(event: Type, listener: Listener): void {
    if (!this.#listeners.has(event)) {
      return
    }

    this.#listeners.get(event)!.delete(listener)
  }

  emit(event: Type, ...listenerParams: Parameters<Listener>): void {
    if (!this.#listeners.has(event)) {
      return
    }

    for (const listener of this.#listeners.get(event)!) {
      listener(...listenerParams)
    }
  }
}
