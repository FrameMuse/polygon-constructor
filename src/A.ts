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

  times(vector: Vector2): Vector2
  times(x: number, y: number): Vector2
  times(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
      this.x *= arg1.x
      this.y *= arg1.y
    }

    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x *= arg1
      this.y *= arg2
    }

    return this
  }

  divide(vector: Vector2): Vector2
  divide(xy: number): Vector2
  divide(x: number, y: number): Vector2
  divide(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
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

  equals(vector: Vector2): boolean {
    return this.x === vector.x && this.y === vector.y
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }

  reverse() {
    this.y = this.x
    this.x = this.y

    return this
  }


  rotate(angle: number): void {
    const radians = angle * Math.PI / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    const x = this.x
    const y = this.y

    this.x = x * cos + y * sin
    this.y = x * sin - y * cos
  }

  // rotate(angle: number): Vector2 {
  //   // const radians = angle * Math.PI / 180

  //   const cos = Math.cos(angle)
  //   const sin = Math.sin(angle)

  //   const x = this.x
  //   const y = this.y

  //   this.x = x * cos + y * sin
  //   this.y = x * sin - y * cos

  //   return this
  // }

  // rotate(center: Vector2, angle: number) {
  //   const radians = (Math.PI / 180) * angle

  //   const cos = Math.cos(radians)
  //   const sin = Math.sin(radians)
  //   const nx = (cos * (this.x - center.x)) + (sin * (this.y - center.y)) + center.x
  //   const ny = (cos * (this.y - center.y)) - (sin * (this.x - center.x)) + center.y

  //   this.x = nx
  //   this.y = ny

  //   return this
  // }

  // resetOriginFromAngle(angle: number): void {
  //   const radians = angle * Math.PI / 180
  //   this.x *= Math.cos(radians)
  //   this.y *= Math.sin(radians)
  // }
}


interface PolygonBlock {
  id: number

  name: string
  image: string
  amount: number

  width: number // cm
  height: number // cm

  angle: number // deg
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

  angle: number // deg
}


class PolygonScene {
  static export(): PolygonBlockOutput[] {
    const output: PolygonBlockOutput[] = []
    for (const polygonObject of Polygon.objects) {
      const position = polygonObject.position.clone()

      if (polygonObject.rotated) {
        const origin = new Vector2(
          polygonObject.transform.origin[0].value,
          polygonObject.transform.origin[1].value
        )

        position.x += origin.x + origin.y
        position.y += origin.y - origin.x
      }

      output.push({
        id: polygonObject.block.id,
        x: position.x,
        y: position.y,
        angle: polygonObject.rotated ? 90 : 0,
      })
    }
    return output
  }

  static import(outputBlocks: PolygonBlockOutput[]): void {
    Polygon.clear()

    for (const outputBlock of outputBlocks) {
      const component = Picker.getComponentById(outputBlock.id)
      if (component == null) continue

      const polygonObject = component.polygonObject.clone()

      if (outputBlock.angle === 90) {
        polygonObject.rotate()
      }
      polygonObject.position = new Vector2(outputBlock.x, outputBlock.y)
      polygonObject.state.draggable = true
      polygonObject.on("pointerdown", startDragging)

      Polygon.settle(polygonObject)
    }
  }
}