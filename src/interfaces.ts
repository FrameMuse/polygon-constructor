interface PolygonBlock {
  id: number

  name: string
  image: string
  amount: number

  width: number // cm
  height: number // cm

  angle?: number // deg

  atop?: boolean
  type?: string
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

interface PolygonObjectCallback<E extends Event = Event> {
  (polygonObject: PolygonObject, event: E): void
}