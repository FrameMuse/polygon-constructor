"use strict";
var boundary = document.body.querySelector("[data-pc-boundary]");
var polygon = document.body.querySelector("[data-pc-polygon]");
var site = document.body.querySelector("[data-pc-site]");
var picker = document.body.querySelector("[data-pc-picker]");
var shapes = new Map;
var placements = new Map;
var offsetX = 0;
var offsetY = 0;
var dropAllowed = false;
var dragging = false;
var draggingElement = null;
boundary.addEventListener("pointermove", function (event) {
    event.preventDefault();
    if (event.pressure < 0.5)
        return;
    if (!dragging)
        return;
    commitMove(event.x, event.y);
});
function commitMove(pageX, pageY) {
    if (draggingElement == null)
        return;
    var boundaryRect = boundary.getBoundingClientRect();
    var x = pageX - boundaryRect.left - offsetX;
    var y = pageY - boundaryRect.top - offsetY;
    draggingElement.style.top = y + "px";
    draggingElement.style.left = x + "px";
}
function onDraggingStart(event) {
    event.preventDefault();
    dragging = true;
    draggingElement = this;
    commitMove(event.x, event.y);
    this.classList.add("polygon-constructor__shape--dragging");
    document.addEventListener("pointerup", onDraggingEnd);
}
function onDraggingEnd(event) {
    if (draggingElement == null)
        return;
    event.preventDefault();
    commitStore();
    draggingElement.classList.remove("polygon-constructor__shape--dragging");
    if (!dropAllowed) {
        draggingElement.remove();
    }
    dragging = false;
    draggingElement = null;
    document.removeEventListener("pointerup", onDraggingEnd);
}
function onPointerDown(event) {
    var clonedShape = this.cloneNode(true);
    clonedShape.classList.add("polygon-constructor__shape--draggable");
    clonedShape.addEventListener("pointerdown", function (event) {
        var t = this.getBoundingClientRect();
        offsetX = event.x - t.left;
        offsetY = event.y - t.top;
        onDraggingStart.call(this, event);
    });
    polygon.appendChild(clonedShape);
    draggingElement = clonedShape;
    var t = this.getBoundingClientRect();
    offsetX = event.x - t.left;
    offsetY = event.y - t.top;
    onDraggingStart.call(clonedShape, event);
}
function commitStore() {
    if (draggingElement == null)
        return;
    var id = draggingElement.dataset.pcId;
    if (id == null)
        return;
    if (isNaN(+id))
        return;
    var shape = shapes.get(+id);
    if (shape == null)
        return;
    placements.set(+id, {
        shape: shape,
        x: draggingElement.offsetLeft - site.offsetLeft,
        y: draggingElement.offsetTop - site.offsetTop,
    });
    // const id = draggingElement.id
    // if (dropAllowed) {
    //   if (!shapes[id].elements.has(draggingElement)) {
    //     shapes[id].elements.add(draggingElement)
    //   }
    // } else {
    //   shapes[id].elements.delete(draggingElement)
    // }
    // // render result
    // const rss = document.getElementById("r" + id) as HTMLDivElement
    // rss.textContent = shapes[id].title + ": " + shapes[id].elements.size
}
function createShapeElement(shape) {
    var shapeElement = document.createElement("div");
    shapeElement.dataset.pcId = String(shape.id);
    shapeElement.innerText = shape.title;
    shapeElement.classList.add("polygon-constructor__shape", "polygon-constructor__shape" + "--" + shape.type);
    shapeElement.addEventListener("pointerdown", onPointerDown);
    return shapeElement;
}
function addShape(shape) {
    if (shapes.has(shape.id)) {
        throw new Error("This id is already in use");
    }
    shapes.set(shape.id, shape);
    var shapeElement = createShapeElement(shape);
    picker.appendChild(shapeElement);
}
site.addEventListener("pointerenter", function () {
    dropAllowed = true;
});
site.addEventListener("pointerout", function () {
    dropAllowed = false;
});
addShape({ title: "wall", type: "hr", id: 0 });
addShape({ title: "wall", type: "vr", id: 1 });
addShape({ title: "chair", type: "circle", id: 2 });
addShape({ title: "table", type: "rectangle", id: 3 });
