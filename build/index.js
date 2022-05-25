"use strict";
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
// Math.clamp = function (x: number, min: number, max: number) {
//   return Math.min(Math.max(x, min), max);
// }
class Boundary {
    static #boundElement = null;
    static bindElement(element) {
        if (this.#boundElement != null) {
            throw new Error(this.name + " boundElement has already been set");
        }
        this.#boundElement = element;
    }
    static get rect() {
        if (this.#boundElement === null) {
            throw new Error(this.name + " boundElement is not set");
        }
        return this.#boundElement.getBoundingClientRect();
    }
    static offset = new Vector2(0, 0);
    static #draggingObject = null;
    /**
     * The current polygonObject which is being dragged
     */
    static get draggingObject() {
        return this.#draggingObject;
    }
    static set draggingObject(polygonObject) {
        if (this.#draggingObject === polygonObject)
            return;
        if (this.#draggingObject != null && polygonObject == null) {
            this.#draggingObject.dragging = false;
            this.#draggingObject = null;
            return;
        }
        if (polygonObject != null) {
            this.#draggingObject = polygonObject;
            this.#draggingObject.dragging = true;
            return;
        }
        throw new Error("Something wrong");
    }
    static #selectedObject = null;
    /**
     * The current polygonObject which is selected
     */
    static get selectedObject() {
        return this.#selectedObject;
    }
    static set selectedObject(polygonObject) {
        if (polygonObject === null)
            return;
        if (this.#selectedObject === polygonObject)
            return;
        if (this.#selectedObject) {
            this.#selectedObject.selected = false;
        }
        polygonObject.selected = true;
        this.#selectedObject = polygonObject;
        if (result instanceof HTMLElement) {
            const componentName = polygonObject.id ? componentNames[polygonObject.id] : "unknown";
            result.textContent = "Выбрано => " + componentName;
        }
    }
    static dropNotAllowed = false;
    /**
     *
     * Checks if polygonObject can be placed
     *
     * Also sets notAllowed state on draggingObject accordingly
     */
    static checkIfCanDropObject() {
        if (this.#draggingObject === null)
            return false;
        if (!Polygon.contains(this.#draggingObject)) {
            this.#draggingObject.notAllowed = true;
            return false;
        }
        if (Polygon.intersectsOtherObjects(this.#draggingObject)) {
            this.#draggingObject.notAllowed = true;
            return false;
        }
        this.#draggingObject.notAllowed = false;
        return true;
    }
}
class Picker {
    static #boundElement = null;
    static #components = new Set;
    static bindElement(element) {
        if (this.#boundElement != null) {
            throw new Error(this.name + " boundElement has already been set");
        }
        this.#boundElement = element;
    }
    static createComponent(options) {
        if (options.id == null)
            options.id = this.#components.size + 1;
        const element = document.createElement("div");
        element.appendChild(createImageElement("elements/" + options.id.toString() + ".png"));
        element.classList.add(options.className);
        element.classList.add(...(options.modifiers || []).map(modifier => options.className + CLASS_SPLITTER + modifier));
        const polygonObject = new PolygonObject(element);
        polygonObject.id = options.id;
        element.addEventListener("pointerdown", event => onPointerDown(polygonObject, event));
        this.#components.add(polygonObject);
        this.#render();
    }
    static #render() {
        if (this.#boundElement === null) {
            throw new Error(this.name + " boundElement is not set");
        }
        const firstChild = this.#boundElement.children.item(0);
        if (firstChild) {
            this.#boundElement.replaceChildren(firstChild);
        }
        for (const component of this.#components.values()) {
            const componentElement = component.getBoundElement();
            this.#boundElement.append(componentElement);
        }
    }
}
function createImageElement(src) {
    const element = document.createElement("img");
    element.src = src;
    return element;
}
class Polygon {
    static #objects = new Set;
    static #boundElement = null;
    static bindElement(element) {
        if (this.#boundElement != null) {
            throw new Error(this.name + " boundElement has already been set");
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
        const polygonObjectRect = polygonObject.rect;
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
        const firstChild = this.#boundElement.children.item(0);
        if (firstChild) {
            this.#boundElement.replaceChildren(firstChild);
        }
        for (const polygonObject of this.#objects.values()) {
            const polygonElement = polygonObject.getBoundElement();
            this.#boundElement.append(polygonElement);
        }
    }
}
const DRAGGABLE_MODIFIER = "draggable";
const DRAGGING_MODIFIER = "dragging";
const NOT_ALLOWED_MODIFIER = "not-allowed";
const SELECTED_MODIFIER = "selected";
class PolygonObject {
    id;
    #boundElement;
    #state = {
        draggable: false,
        dragging: false,
        notAllowed: false,
        selected: false,
    };
    /**
     * The ability of to be dragged
     */
    get draggable() { return this.#state.draggable; }
    set draggable(value) {
        this.#state.draggable = value;
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
    get dragging() { return this.#state.dragging; }
    set dragging(value) {
        this.#state.dragging = value;
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
    get notAllowed() { return this.#state.notAllowed; }
    set notAllowed(value) {
        this.#state.notAllowed = value;
        if (value) {
            addElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER);
        }
        else {
            removeElementClassModification(this.#boundElement, NOT_ALLOWED_MODIFIER);
        }
    }
    /**
     * The state of being selected
     */
    get selected() { return this.#state.selected; }
    set selected(value) {
        this.#state.selected = value;
        if (value) {
            addElementClassModification(this.#boundElement, SELECTED_MODIFIER);
        }
        else {
            removeElementClassModification(this.#boundElement, SELECTED_MODIFIER);
        }
    }
    get rect() {
        return this.#boundElement.getBoundingClientRect();
    }
    constructor(boundElement) {
        this.#boundElement = boundElement;
        const mutationObserver = new MutationObserver(mutationCallback);
        mutationObserver.observe(boundElement, {
            attributes: true,
            attributeFilter: ["style"],
        });
        function mutationCallback(_mutations, _observer) {
            // console.log(1)
            Boundary.checkIfCanDropObject();
        }
    }
    /**
     *
     * Checks whether polygonObject intersects other polygonObject
     */
    intersects(otherPolygonObject) {
        if (this === otherPolygonObject)
            return false;
        const polygonObjectRect = this.rect;
        const otherPolygonObjectRect = otherPolygonObject.rect;
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
    get position() {
        return new Vector2(this.rect.x, this.rect.y);
    }
    set position(vector) {
        // function getCurrentRotation(element: HTMLElement) {
        //   var style = window.getComputedStyle(element, null)
        //   var transform = style.getPropertyValue("-webkit-transform") ||
        //     style.getPropertyValue("-moz-transform") ||
        //     style.getPropertyValue("-ms-transform") ||
        //     style.getPropertyValue("-o-transform") ||
        //     style.getPropertyValue("transform") ||
        //     "none"
        //   if (transform != "none") {
        //     // console.log(transform)
        //     var values = transform.split('(')[1].split(')')[0].split(',')
        //     //return Math.round(Math.atan2(values[1],values[0]) * (180/Math.PI)) //this would return negative values the OP doesn't wants so it got commented and the next lines of code added
        //     var angle = Math.round(Math.atan2(+values[1], +values[0]) * (180 / Math.PI))
        //     return [(angle < 0 ? angle + 360 : angle), +values[1], +values[0]] //adding 360 degrees here when angle < 0 is equivalent to adding (2 * Math.PI) radians before
        //   }
        //   return [0, 0, 0]
        // }
        // const [angle, a, b] = getCurrentRotation(this.#boundElement)
        const oldPosition = this.position;
        const x = vector.x - Boundary.rect.left - Boundary.offset.x;
        const y = vector.y - Boundary.rect.top - Boundary.offset.y;
        // const velocity = new Vector2(
        //   oldPosition
        // )
        // // Math.clamp()
        this.#boundElement.style.left = x + "px";
        this.#boundElement.style.top = y + "px";
        // console.log(x, y)
        // console.log(x * b, y * b)
    }
    #rotated = false;
    rotate() {
        this.#rotated = !this.#rotated;
        this.#boundElement.style.transform = `rotateZ(${+this.#rotated * 90}deg)`;
    }
    #listeners = new Map;
    /**
     * Sets up a function that will be called whenever the specified event is delivered to the target.
     *
     * @param type A case-sensitive string representing the event type to listen for.
     * @param listener The object that receives a notification. Also provides polygonObject from the context it is called.
     * @param options An object that specifies characteristics about the event listener.
     *
     */
    on(type, listener, options) {
        const eventFunction = ((event) => listener(this, event));
        this.#listeners.set(listener, eventFunction);
        if (type === "pointerup") {
            document.addEventListener(type, eventFunction, options);
            return;
        }
        this.#boundElement.addEventListener(type, eventFunction, options);
    }
    /**
     * Removes a function that were passed to `on`.
     *
     * @param type A case-sensitive string representing the event type to listen for.
     * @param listener The object that receives a notification. Also provides polygonObject from the context it is called.
     *
     */
    off(type, listener) {
        const eventFunction = this.#listeners.get(listener);
        if (eventFunction == null)
            return;
        if (type === "pointerup") {
            document.removeEventListener(type, eventFunction);
            return;
        }
        this.#boundElement.removeEventListener(type, eventFunction);
    }
}
const result = document.getElementById("result");
const boundary = document.body.querySelector("[data-pc-boundary]");
const polygon = document.body.querySelector("[data-pc-polygon]");
const picker = document.body.querySelector("[data-pc-picker]");
const CLASS_SPLITTER = "--";
const componentNames = {
    1: "Элемент стены, цвет белый 100×250",
    2: "Элемент стены, цвет белый 50×250",
    3: "Дверь раздвижная 100×250",
    4: "Занавес 100×250",
    5: "Витрина с внутренней подсветкой 1×0.5h-2.5m",
    6: "Стеллаж сборный на профиле, металлический 4 полки 0.5×1×H-2m",
    7: "Полка настенная 1m",
    8: "Барная стойка H-1m    L-1m",
    9: "Радиусная барная стойка R-1m",
    10: "Витрина 0.5×1×h-1.8m",
    11: "Витрина 0.5×0.5×h-2.5m",
    12: "Витрина 0.5×1×h-1.1m",
    13: "Витрина 0.5×1×h-1.1m (монтажная)",
    14: "Витрина 0.5×0.5×h-1.1m",
    15: "Радиальная витрина R 1.0×R 0.5×H-1.1m",
    16: "Радиальная витрина R 1.0×R 0.5×H-2.5m",
    17: "Подиум 0.5×1×H-0.8m",
    18: "Подиум 1×1×H-0.8m",
    19: "Вешалка настенная",
};
if (picker instanceof HTMLElement) {
    Picker.bindElement(picker);
}
if (polygon instanceof HTMLElement) {
    Polygon.bindElement(polygon);
}
if (boundary instanceof HTMLElement) {
    Boundary.bindElement(boundary);
    boundary.addEventListener("pointermove", event => {
        event.preventDefault();
        if (event.pressure < 0.5)
            return;
        if (Boundary.draggingObject) {
            Boundary.draggingObject.position = new Vector2(event.x, event.y);
        }
    });
    window.addEventListener("keydown", event => {
        if (event.altKey)
            return;
        if (event.ctrlKey)
            return;
        if (event.key.toLowerCase() !== "r")
            return;
        event.preventDefault();
        if (Boundary.draggingObject) {
            Boundary.draggingObject.rotate();
        }
    });
}
function startDragging(polygonObject, event) {
    event.preventDefault();
    polygonObject.position = new Vector2(event.x, event.y);
    polygonObject.on("pointerup", stopDragging, { once: true });
    Boundary.draggingObject = polygonObject;
}
function stopDragging(polygonObject, event) {
    event.preventDefault();
    if (polygonObject.notAllowed) {
        Polygon.unsettle(polygonObject);
    }
    else {
        Boundary.selectedObject = polygonObject;
    }
    Boundary.draggingObject = null;
}
function onPointerDown(polygonObject, event) {
    const clonedPolygonObject = clonePolygonObject(polygonObject);
    Polygon.settle(clonedPolygonObject);
    Boundary.offset = new Vector2(event.x - polygonObject.rect.left, event.y - polygonObject.rect.top);
    startDragging(clonedPolygonObject, event);
}
function clonePolygonObject(polygonObject) {
    const clonedElement = polygonObject.getBoundElement().cloneNode(true);
    const clonedPolygonObject = new PolygonObject(clonedElement);
    clonedPolygonObject.id = polygonObject.id;
    clonedPolygonObject.draggable = true;
    clonedPolygonObject.on("pointerdown", (polygonObject, event) => {
        Boundary.offset = new Vector2(event.x - polygonObject.rect.left, event.y - polygonObject.rect.top);
        startDragging(clonedPolygonObject, event);
    });
    return clonedPolygonObject;
}
const DEFAULT_CLASS_NAME = "polygon-constructor__object";
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
Picker.createComponent({ className: DEFAULT_CLASS_NAME });
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
