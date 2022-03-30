"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var boundary = document.body.querySelector("[data-pc-boundary]");
var polygon = document.body.querySelector("[data-pc-polygon]");
var site = document.body.querySelector("[data-pc-site]");
var picker = document.body.querySelector("[data-pc-picker]");
var siteRect = site.getBoundingClientRect();
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
    var draggableShape = cloneAsDraggableShape(this);
    polygon.appendChild(draggableShape);
    draggingElement = draggableShape;
    var t = this.getBoundingClientRect();
    offsetX = event.x - t.left;
    offsetY = event.y - t.top;
    onDraggingStart.call(draggableShape, event);
}
function cloneAsDraggableShape(shape) {
    var clonedShape = shape.cloneNode(true);
    clonedShape.classList.add("polygon-constructor__shape--draggable");
    clonedShape.addEventListener("pointerdown", function (event) {
        var t = this.getBoundingClientRect();
        offsetX = event.x - t.left;
        offsetY = event.y - t.top;
        onDraggingStart.call(this, event);
    });
    return clonedShape;
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
function getPlacements() {
    return __spreadArray([], __read(placements.entries()), false);
}
function setPlacements(newPlacements) {
    polygon.querySelectorAll(".polygon-constructor__shape--draggable").forEach(function (e) { return e.remove(); });
    placements = new Map(newPlacements);
    placements.forEach(function (place, key) {
        var shape = shapes.get(key);
        if (shape == null)
            return;
        var shapeElement = createShapeElement(shape);
        var draggableShape = cloneAsDraggableShape(shapeElement);
        draggableShape.style.top = site.offsetTop + place.y + "px";
        draggableShape.style.left = site.offsetLeft + place.x + "px";
        polygon.appendChild(draggableShape);
    });
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
