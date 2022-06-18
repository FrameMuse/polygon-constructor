class Vector2 {
  constructor(public x: number, public y: number) { }

  plus(vector: Vector2): void
  plus(x: number, y: number): void
  plus(arg1: number | Vector2, arg2?: number): void {
    if (arg1 instanceof Vector2) {
      this.x += arg1.x
      this.y += arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x += arg1
      this.y += arg2
    }
  }

  minus(vector: Vector2): void
  minus(x: number, y: number): void
  minus(arg1: number | Vector2, arg2?: number): void {
    if (arg1 instanceof Vector2) {
      this.x -= arg1.x
      this.y -= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x -= arg1
      this.y -= arg2
    }
  }

  times(vector: Vector2): void
  times(x: number, y: number): void
  times(arg1: number | Vector2, arg2?: number): void {
    if (arg1 instanceof Vector2) {
      this.x *= arg1.x
      this.y *= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x *= arg1
      this.y *= arg2
    }
  }

  divide(vector: Vector2): void
  divide(x: number, y: number): void
  divide(arg1: number | Vector2, arg2?: number): void {
    if (arg1 instanceof Vector2) {
      this.x /= arg1.x
      this.y /= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x /= arg1
      this.y /= arg2
    }
  }

  equals(vector: Vector2): boolean {
    return this.x === vector.x && this.y === vector.y
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }
}


interface PolygonBlock {
  id: number

  name: string
  image: string
  amount: number

  width: number // cm
  height: number // cm
}

interface Area {
  width: number // cm
  height: number // cm

  blocks: PolygonBlock[]
}


interface PolygonBlockOutput {
  id: number

  x: number // cm
  y: number // cm
}
