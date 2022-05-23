"use strict";
class Polygon {
    static #objects = new Set;
    static #boundElement = null;
    static setBoundElement(element) {
        if (this.#boundElement != null) {
            throw new Error("boundElement has already been set");
        }
        this.#boundElement = element;
    }
    static settle(polygonObject) {
        this.#objects.add(polygonObject);
        this.#render();
    }
    static unsettle(polygonObject) {
        this.#objects.delete(polygonObject);
        this.#render();
    }
    /**
     *
     * Checks whether polygonObject is within Polygon borders
     */
    static contains(polygonObject) {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        const polygonRect = this.#boundElement.getBoundingClientRect();
        const polygonObjectRect = polygonObject.DOMRect;
        if (polygonRect.left > polygonObjectRect.left)
            return false;
        if (polygonRect.top > polygonObjectRect.top)
            return false;
        if (polygonRect.right < polygonObjectRect.right)
            return false;
        if (polygonRect.bottom < polygonObjectRect.bottom)
            return false;
        return true;
    }
    /**
     *
     * Checks whether polygonObject intersects any polygonObjects inside Polygon
     */
    static intersectsOtherObjects(polygonObject) {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        for (const otherPolygonObject of this.#objects.values()) {
            if (polygonObject.intersects(otherPolygonObject))
                return true;
        }
        return false;
    }
    static #render() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        this.#boundElement.replaceChildren(this.#boundElement.firstChild || "");
        for (const polygonObject of this.#objects.values()) {
            const polygonElement = polygonObject.getBoundElement();
            this.#boundElement.append(polygonElement);
        }
    }
}
const DRAGGABLE_MODIFIER = "draggable";
const DRAGGING_MODIFIER = "dragging";
const NOT_ALLOWED_MODIFIER = "not-allowed";
class PolygonObject {
    #boundElement;
    // #callbacks: Set<PolygonObjectCallback> = new Set
    /**
     * The ability of to be dragged
     */
    get draggable() { return isElementClassModifiedBy(this.#boundElement, DRAGGABLE_MODIFIER); }
    set draggable(value) {
        if (value) {
            addElementClassModification(this.#boundElement, DRAGGABLE_MODIFIER);
        }
        else {
            removeElementClassModification(this.#boundElement, DRAGGABLE_MODIFIER);
        }
    }
    /**
     * The state of being dragged
     */
    get dragging() { return isElementClassModifiedBy(this.#boundElement, DRAGGING_MODIFIER); }
    set dragging(value) {
        if (value) {
            addElementClassModification(this.#boundElement, DRAGGING_MODIFIER);
        }
        else {
            removeElementClassModification(this.#boundElement, DRAGGING_MODIFIER);
        }
    }
    /**
     * The ability to be placed at Polygon
     */
    get notAllowed() { return isElementClassModifiedBy(this.#boundElement, NOT_ALLOWED_MODIFIER); }
    set notAllowed(value) {
        if (value) {
            addElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER);
        }
        else {
            removeElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER);
        }
    }
    get DOMRect() {
        return this.#boundElement.getBoundingClientRect();
    }
    constructor(boundElement) {
        this.#boundElement = boundElement;
        // Defaults
        this.draggable = true;
        this.dragging = false;
        // Events
        // this.#listenDragging()
    }
    // #listenDragging() {
    //   const pointerDownEvent = () => this.dragging = true
    //   const pointerDownMoveEvent = () => this.dragging && this.#runDraggingCallbacks()
    //   const pointerDownUpEvent = () => this.dragging = false
    //   this.#boundElement.addEventListener("pointerdown", pointerDownEvent)
    //   this.#boundElement.addEventListener("pointermove", pointerDownMoveEvent)
    //   document.addEventListener("pointerup", pointerDownUpEvent)
    // }
    // #runDraggingCallbacks() {
    //   for (const callback of this.#callbacks) {
    //     callback(this)
    //   }
    // }
    /**
     *
     * Checks whether polygonObject intersects other polygonObject
     */
    intersects(otherPolygonObject) {
        if (this === otherPolygonObject)
            return false;
        const polygonObjectRect = this.DOMRect;
        const otherPolygonObjectRect = otherPolygonObject.DOMRect;
        if (polygonObjectRect.top > otherPolygonObjectRect.bottom)
            return false;
        if (polygonObjectRect.bottom < otherPolygonObjectRect.top)
            return false;
        if (polygonObjectRect.left > otherPolygonObjectRect.right)
            return false;
        if (polygonObjectRect.right < otherPolygonObjectRect.left)
            return false;
        return true;
    }
    getBoundElement() {
        return this.#boundElement;
    }
    move(pageX, pageY) {
        const boundaryRect = boundary.getBoundingClientRect();
        const x = pageX - boundaryRect.left - offsetX;
        const y = pageY - boundaryRect.top - offsetY;
        this.#boundElement.style.top = y + "px";
        this.#boundElement.style.left = x + "px";
    }
}
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
const result = document.getElementById("result");
const boundary = document.body.querySelector("[data-pc-boundary]");
const polygon = document.body.querySelector("[data-pc-polygon]");
const site = document.body.querySelector("[data-pc-site]");
const picker = document.body.querySelector("[data-pc-picker]");
const siteRect = site.getBoundingClientRect();
Polygon.setBoundElement(polygon);
const shapes = new Map;
let placements = new Map;
let offsetX = 0;
let offsetY = 0;
const dropNotAllowedRef = new Proxy({ current: false }, {
    set(target, _key, value) {
        if (draggingElementRef.current === null) {
            target.current = false;
            return true;
        }
        if (value) {
            target.current = true;
            draggingElementRef.current.notAllowed = true;
            return true;
        }
        else {
            target.current = false;
            draggingElementRef.current.notAllowed = false;
            return true;
        }
        return false;
    }
});
const draggingRef = new Proxy({ current: false }, {
    get() {
        return draggingElementRef.current !== null;
    },
});
const draggingElementRef = new Proxy({ current: null }, {
    get(target) {
        return target.current;
    },
    set(polygonObject, _key, nextPolygonObject) {
        if (polygonObject.current === nextPolygonObject)
            return true;
        if (polygonObject.current != null && nextPolygonObject == null) {
            polygonObject.current.dragging = false;
            polygonObject.current = null;
            return true;
        }
        if (polygonObject.current == null && nextPolygonObject != null) {
            polygonObject.current = nextPolygonObject;
            polygonObject.current.dragging = true;
            return true;
        }
        return false;
        // nextPolygonObject?.dragging = true
        // nextPolygonObject?.boundElement
        // value?.classList.add("polygon-constructor__object--active")
        // result.textContent = `Current: ${nextPolygonObject?.textContent || nextPolygonObject}`
        // polygonObject.current?.classList.remove("polygon-constructor__object--active")
        // polygonObject.current?.classList.remove("polygon-constructor__object--not-allowed")
        // polygonObject.current = nextPolygonObject
        // return true
    }
});
/**
 * @deprecated
 */
function getNotAllowedState() {
    if (draggingElementRef.current === null)
        return false;
    if (!Polygon.contains(draggingElementRef.current)) {
        return true;
    }
    if (Polygon.intersectsOtherObjects(draggingElementRef.current)) {
        return true;
    }
    return false;
}
boundary.addEventListener("pointermove", event => {
    event.preventDefault();
    if (event.pressure < 0.5)
        return;
    if (draggingElementRef.current === null)
        return;
    dropNotAllowedRef.current = getNotAllowedState();
    draggingElementRef.current.move(event.x, event.y);
});
function startDragging(polygonObject, event) {
    event.preventDefault();
    draggingElementRef.current = polygonObject;
    dropNotAllowedRef.current = getNotAllowedState();
    polygonObject.move(event.x, event.y);
    document.addEventListener("pointerup", onDraggingEnd);
}
function onDraggingEnd(event) {
    event.preventDefault();
    console.log("onDraggingEnd");
    if (dropNotAllowedRef.current && draggingElementRef.current) {
        console.log("onDraggingEnd => dropNotAllowedRef");
        Polygon.unsettle(draggingElementRef.current);
    }
    draggingElementRef.current = null;
    document.removeEventListener("pointerup", onDraggingEnd);
}
function onPointerDown(event) {
    const polygonObject = cloneAsPolygonObject(this);
    Polygon.settle(polygonObject);
    // // polygon.appendChild(polygonObject.)
    // draggingElementRef.current = polygonObject
    const t = this.getBoundingClientRect();
    offsetX = event.x - t.left;
    offsetY = event.y - t.top;
    startDragging(polygonObject, event);
    // onDraggingStart.call(polygonObject, event)
}
function cloneAsPolygonObject(element) {
    const clonedElement = element.cloneNode(true);
    const polygonObject = new PolygonObject(clonedElement);
    clonedElement.addEventListener("pointerdown", function (event) {
        const clonedElementRect = this.getBoundingClientRect();
        offsetX = event.x - clonedElementRect.left;
        offsetY = event.y - clonedElementRect.top;
        startDragging(polygonObject, event);
    });
    return polygonObject;
}
function commitStore() {
    if (draggingElementRef.current == null)
        return;
    // const id = draggingElementRef.current.dataset.pcId
    // if (id == null) return
    // if (isNaN(+id)) return
    // const shape = shapes.get(+id)
    // if (shape == null) return
    // placements.set(+id, {
    //   x: draggingElementRef.current.offsetLeft - site.offsetLeft,
    //   y: draggingElementRef.current.offsetTop - site.offsetTop,
    // })
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
function createPolygonElement(shape) {
    const polygonElement = document.createElement("div");
    polygonElement.dataset.pcId = String(shape.id);
    polygonElement.innerText = shape.title;
    polygonElement.classList.add("polygon-constructor__object", "polygon-constructor__object" + "--" + shape.type);
    polygonElement.addEventListener("pointerdown", onPointerDown);
    return polygonElement;
}
function addShape(shape) {
    if (shapes.has(shape.id)) {
        throw new Error("This id is already in use");
    }
    shapes.set(shape.id, shape);
    const shapeElement = createPolygonElement(shape);
    picker.appendChild(shapeElement);
}
function getPlacements() {
    return [...placements.entries()];
}
function setPlacements(newPlacements) {
    polygon.querySelectorAll(".polygon-constructor__object--draggable").forEach(e => e.remove());
    placements = new Map(newPlacements);
    placements.forEach((place, key) => {
        const shape = shapes.get(key);
        if (shape == null)
            return;
        const shapeElement = createPolygonElement(shape);
        const draggableShape = cloneAsPolygonObject(shapeElement);
        // draggableShape.style.top = site.offsetTop + place.y + "px"
        // draggableShape.style.left = site.offsetLeft + place.x + "px"
        // polygon.appendChild(draggableShape)
    });
}
site.addEventListener("pointerenter", () => {
    dropNotAllowedRef.current = true;
});
site.addEventListener("pointerout", () => {
    dropNotAllowedRef.current = false;
});
addShape({ title: "wall", type: "hr", id: 0 });
addShape({ title: "wall", type: "vr", id: 1 });
addShape({ title: "chair", type: "circle", id: 2 });
addShape({ title: "table", type: "rectangle", id: 3 });
addShape({ title: "", type: "corner", id: 4 });
const CLASS_SPLITTER = "--";
function isElementClassModifiedBy(element, modifier) {
    const baseClass = element.classList[0];
    return element.classList.contains(baseClass + CLASS_SPLITTER + modifier);
}
function addElementClassModification(element, modifier) {
    if (isElementClassModifiedBy(element, modifier))
        return;
    const baseClass = element.classList[0];
    element.classList.add(baseClass + CLASS_SPLITTER + modifier);
}
function removeElementClassModification(element, modifier) {
    if (!isElementClassModifiedBy(element, modifier))
        return;
    const baseClass = element.classList[0];
    element.classList.remove(baseClass + CLASS_SPLITTER + modifier);
}
