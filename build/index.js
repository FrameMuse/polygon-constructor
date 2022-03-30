"use strict";
var boundary = document.body.querySelector("[data-pc-boundary]");
var polygon = document.body.querySelector("[data-pc-polygon]");
var site = document.body.querySelector("[data-pc-site]");
var picker = document.body.querySelector("[data-pc-picker]");
var shapes = new Map;
var offsetX = 0;
var offsetY = 0;
var dropAllowed = false;
var dragging = false;
var draggingElement = null;
boundary.addEventListener("pointermove", function (event) {
    if (!dragging)
        return;
    event.preventDefault();
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
    offsetX = event.offsetX;
    offsetY = event.offsetY;
    dragging = true;
    draggingElement = this;
    commitMove(event.x, event.y);
    this.style.pointerEvents = "none";
    document.addEventListener("pointerup", onDraggingEnd);
}
function onDraggingEnd(event) {
    if (draggingElement == null)
        return;
    event.preventDefault();
    commitStore();
    draggingElement.style.pointerEvents = "";
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
    clonedShape.addEventListener("pointerdown", onDraggingStart);
    polygon.appendChild(clonedShape);
    draggingElement = clonedShape;
    onDraggingStart.call(clonedShape, event);
}
function commitStore() {
    if (draggingElement == null)
        return;
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
for (var id in shapes.keys()) {
    if (Object.prototype.hasOwnProperty.call(shapes, id)) {
        var shape = shapes.get(+id);
        var shapeElement = document.createElement("div");
        if (shape == null)
            continue;
        shapeElement.id = id;
        shapeElement.innerText = shape.title;
        shapeElement.classList.add("polygon-constructor__shape");
        shapeElement.classList.add("polygon-constructor__shape" + "--" + shape.type);
        shapeElement.addEventListener("pointerdown", onPointerDown);
        shapeElement.draggable = true;
        picker.appendChild(shapeElement);
        // create result
        var result = document.getElementById("result");
        var rss = document.createElement("div");
        rss.id = "r" + id;
        rss.textContent = shape.title + ": 0";
        result.appendChild(rss);
    }
}
site.addEventListener("pointerenter", function () {
    dropAllowed = true;
    console.log("dropAllowed");
});
site.addEventListener("pointerout", function () {
    dropAllowed = false;
    console.log("not dropAllowed");
});
site.addEventListener("dragover", function (event) {
    event.preventDefault();
    console.log("dropAllowed");
});
site.addEventListener("drop", function (event) {
    event.preventDefault();
    console.log("dropAllowed");
});
