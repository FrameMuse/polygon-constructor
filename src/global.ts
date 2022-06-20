/// <reference path="global.d.ts" />

Math.clamp = function (x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max)
}