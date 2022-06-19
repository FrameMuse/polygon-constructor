"use strict";
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plus(arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x += arg1.x;
            this.y += arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x += arg1;
            this.y += arg2;
        }
    }
    minus(arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x -= arg1.x;
            this.y -= arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x -= arg1;
            this.y -= arg2;
        }
    }
    times(arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x *= arg1.x;
            this.y *= arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x *= arg1;
            this.y *= arg2;
        }
        return this;
    }
    divide(arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x /= arg1.x;
            this.y /= arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "undefined") {
            this.x /= arg1;
            this.y /= arg1;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x /= arg1;
            this.y /= arg2;
        }
        return this;
    }
    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    reverse() {
        this.y = this.x;
        this.x = this.y;
        return this;
    }
    rotate(angle) {
        const radians = angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const x = this.x;
        const y = this.y;
        this.x = x * cos + y * sin;
        this.y = x * sin - y * cos;
    }
}
class PolygonScene {
    static export() {
        const output = [];
        for (const polygonObject of Polygon.objects) {
            const position = polygonObject.position.clone();
            if (polygonObject.rotated) {
                const origin = new Vector2(polygonObject.transform.origin[0].value, polygonObject.transform.origin[1].value);
                position.x += origin.x + origin.y;
                position.y += origin.y - origin.x;
            }
            output.push({
                id: polygonObject.block.id,
                x: position.x,
                y: position.y,
                angle: polygonObject.rotated ? 90 : 0,
            });
        }
        return output;
    }
    static import(outputBlocks) {
        Polygon.clear();
        for (const outputBlock of outputBlocks) {
            const component = Picker.getComponentById(outputBlock.id);
            if (component == null)
                continue;
            const polygonObject = component.polygonObject.clone();
            if (outputBlock.angle === 90) {
                polygonObject.rotate();
            }
            polygonObject.position = new Vector2(outputBlock.x, outputBlock.y);
            polygonObject.state.draggable = true;
            polygonObject.on("pointerdown", startDragging);
            Polygon.settle(polygonObject);
        }
    }
}
// Math.clamp = function (x: number, min: number, max: number) {
//   return Math.min(Math.max(x, min), max);
// }
class BoundElement {
    #boundElement;
    #transform;
    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("boundElement must be an instance of HTMLElement");
        }
        this.#boundElement = element;
        this.#transform = new CSSTransform(element);
    }
    get rect() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        return this.#boundElement.getBoundingClientRect();
    }
    get size() {
        const rect = this.rect;
        return new Vector2(rect.width, rect.height);
    }
    get offset() {
        const rect = this.rect;
        return new Vector2(rect.left, rect.top);
    }
    get boundElement() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        return this.#boundElement;
    }
    get transform() {
        return this.#transform;
    }
}
class BoundElementStatic {
    static #boundElement = null;
    static bindElement(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("boundElement must be an instance of HTMLElement");
        }
        if (this.#boundElement != null) {
            throw new Error(this.name + " boundElement has already been set");
        }
        this.#boundElement = element;
    }
    static get rect() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        return this.#boundElement.getBoundingClientRect();
    }
    static get boundElement() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        return this.#boundElement;
    }
}
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
            this.#draggingObject.state.dragging = false;
            this.#draggingObject = null;
            return;
        }
        if (polygonObject != null) {
            this.#draggingObject = polygonObject;
            this.#draggingObject.state.dragging = true;
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
            this.#selectedObject.state.selected = false;
        }
        polygonObject.state.selected = true;
        this.#selectedObject = polygonObject;
        resultTitle.innerHTML = polygonObject.block.name;
        const rotateButton = document.createElement("button");
        rotateButton.type = "button";
        rotateButton.textContent = "Rotate";
        rotateButton.addEventListener("pointerdown", () => {
            const origin = new Vector2(polygonObject.rect.width / 2, polygonObject.rect.height / 2);
            polygonObject.rotate(origin);
        });
        resultTitle.append(rotateButton);
    }
    static dropNotAllowed = false;
    /**
     *
     * Checks if polygonObject can be placed
     *
     * Also sets notAllowed state on draggingObject accordingly
     */
    static checkIfObjectAllowed(polygonObject) {
        if (!Polygon.contains(polygonObject)) {
            polygonObject.state.notAllowed = true;
            return false;
        }
        if (Polygon.intersectsOtherObjects(polygonObject)) {
            polygonObject.state.notAllowed = true;
            return false;
        }
        polygonObject.state.notAllowed = false;
        return true;
    }
    static checkIfObjectsAllowed(polygonObjects) {
        return polygonObjects.every(this.checkIfObjectAllowed);
    }
    static checkIfObjectsAllowedAndSetDropNotAllowed(polygonObjects) {
        const result = this.checkIfObjectsAllowed(polygonObjects);
        if (!result) {
            this.dropNotAllowed = true;
        }
        else {
            this.dropNotAllowed = false;
        }
        return result;
    }
    static currentPointerEvent = new PointerEvent("");
    static get absolutePointerPosition() {
        return new Vector2(this.currentPointerEvent.x, this.currentPointerEvent.y);
    }
    static updateOffset(pointerEvent) {
        const event = pointerEvent ?? this.currentPointerEvent;
        Boundary.offset = new Vector2(event.offsetX, event.offsetY);
        return Boundary.offset;
    }
}
function observeObject(target, property, callbacks) {
    const value = target[property];
    target[property] = new Proxy(value, {
        set(target, key, value, receiver) {
            // Call immediately after setting the property
            const result = Reflect.set(target, key, value, receiver);
            if (!result)
                return false;
            for (const callback of callbacks)
                callback();
            return true;
        },
    });
}
// function observeProperty<T extends object>(target: T, property: keyof T, callbacks: Function[]) {
//   const value = ((target as never)[property] as unknown);
//   ((target as never)[property] as unknown) = new Proxy({ current: value }, {
//     get(target) {
//       return target.current
//     },
//     set(target, _key, value, receiver) {
//       console.log(target)
//       // Call immediately after setting the property
//       const result = Reflect.set(target, "current", value, receiver)
//       if (!result) return false
//       for (const callback of callbacks) callback()
//       return true
//     },
//   })
// }
class CSSTransform {
    /**
     * The `transform` functions
     */
    functions;
    origin = [new CSSUnit(0), new CSSUnit(0)];
    #callbacks = [];
    constructor(arg1) {
        this.functions = {};
        if (typeof arg1 === "string") {
            this.functions = CSSTransform.parse(arg1);
        }
        if (arg1 instanceof CSSTransform) {
            this.functions = arg1.functions;
        }
        if (arg1 instanceof HTMLElement) {
            const transform = arg1.style.transform;
            this.functions = CSSTransform.parse(transform);
            this.connect(arg1);
        }
        observeObject(this, "functions", this.#callbacks);
        // observeProperty(this, "origin", this.#callbacks)
    }
    /**
     * Triggers the callback when the `transform` functions are changed
     *
     * @param callback The callback to be called when the `transform` is changed
     */
    observe(callback) {
        this.#callbacks.push(callback);
    }
    connect(element) {
        this.observe(() => {
            element.style.transform = this.stringifyFunctions();
            element.style.transformOrigin = this.stringifyOrigin();
        });
    }
    stringifyFunctions() {
        const result = [];
        for (const [transformFunction, domUnit] of Object.entries(this.functions)) {
            result.push(transformFunction + "(" + domUnit.toString() + ")");
        }
        return result.join(" ");
    }
    stringifyOrigin() {
        // console.log(this.origin)
        // console.log(this.origin)
        return this.origin[0].toString() + " " + this.origin[1].toString();
    }
    static parse(transform) {
        if (transform.length === 0)
            return {};
        const result = {};
        for (const transformFunction of transform.split(" ")) {
            const [key, value] = transformFunction.split("(");
            result[key] = new CSSUnit(value.slice(0, -1));
        }
        return result;
    }
}
class CSSUnit {
    value;
    type;
    static Types = ["px", "cm", "mm", "in", "pt", "pc", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "%", "deg", "rad", "turn", "s", "ms", "Hz", "kHz", "dpi", "dpcm", "dppx", "fr"];
    constructor(arg1, arg2) {
        this.value = 0;
        this.type = undefined;
        if (typeof arg1 === "string" && arg2 === undefined) {
            const valueSplitted = /([0-9.]+)(.*)?/.exec(arg1);
            if (valueSplitted === null)
                throw new Error("Invalid unit");
            const probableValue = valueSplitted[1];
            const probableType = valueSplitted[2];
            if (!CSSUnit.checkType(probableType)) {
                throw new Error("Invalid unit type");
            }
            this.value = parseFloat(probableValue);
            this.type = probableType;
        }
        if (typeof arg1 === "number") {
            this.value = arg1;
            this.type = arg2;
        }
    }
    toString() {
        return this.value + (this.type ?? "");
    }
    static checkType(type) {
        // We don't need to care about the type of `type` here.
        return CSSUnit.Types.includes(type);
    }
}
const PICKER_BLOCK_TEMPLATE = document.body.querySelector("[pc-picker-block-example]");
const PICKET_BLOCK_CLASS = "polygon-constructor-sidebar-block";
class Picker {
    static #boundElement = null;
    static #components = new Set;
    /**
     * @deprecated
     */
    static maxUnitsT = {};
    static bindElement(element) {
        if (this.#boundElement != null) {
            throw new Error(this.name + " boundElement has already been set");
        }
        this.#boundElement = element;
    }
    static addComponent(block) {
        const component = new PickerComponent(block);
        component.polygonObject.on("pointerdown", (_, event) => {
            if (component.usedAmount >= component.maxAmount)
                return;
            const clonedPolygonObject = component.polygonObject.clone();
            clonedPolygonObject.state.draggable = true;
            clonedPolygonObject.on("pointerdown", startDragging);
            clonedPolygonObject.onSettled(() => {
                component.usedAmount++;
            });
            clonedPolygonObject.onUnsettled(() => {
                component.usedAmount--;
            });
            startDragging(clonedPolygonObject, event);
            Polygon.settle(clonedPolygonObject);
        });
        this.#components.add(component);
        this.#render();
    }
    static getComponentById(id) {
        return [...this.#components.values()].find(component => component.polygonObject.block.id === id);
    }
    static #render() {
        if (this.#boundElement === null) {
            throw new Error(this.name + " boundElement is not set");
        }
        // Remove all children
        this.#boundElement.replaceChildren();
        for (const component of this.#components) {
            this.#boundElement.append(component.element);
        }
    }
}
class PickerComponent {
    #element; // Picket wrapper element
    #polygonObject;
    #amountElement;
    maxAmount = 0;
    #usedAmount = 0;
    set usedAmount(value) {
        if (value < 0)
            return;
        this.#usedAmount = value;
        this.#amountElement.textContent = "x" + String(this.maxAmount - value);
        toggleElementClassModification(this.#element, "disabled", value >= this.maxAmount);
    }
    get usedAmount() {
        return this.#usedAmount;
    }
    constructor(block) {
        this.maxAmount = block.amount;
        this.#element = composePickerBlockElement();
        this.#polygonObject = composePolygonObject(block);
        this.#element.append(composePickerBlockTitleElement(block.name));
        this.#element.append(this.#polygonObject.boundElement);
        this.#amountElement = composePickerBlockAmountElement(block.amount);
        this.#element.append(this.#amountElement);
    }
    get element() {
        return this.#element;
    }
    get polygonObject() {
        return this.#polygonObject;
    }
}
function composePickerBlockElement() {
    const pickerElement = document.createElement("div");
    pickerElement.className = PICKET_BLOCK_CLASS;
    return pickerElement;
}
function composePolygonObject(block) {
    if (block.id == null)
        block.id = -1;
    const element = document.createElement("div");
    element.appendChild(composeImageElement("elements/" + block.id.toString() + ".png"));
    element.classList.add(DEFAULT_CLASS_NAME);
    return new PolygonObject(element, block);
}
function composeImageElement(src) {
    const element = document.createElement("img");
    element.src = src;
    return element;
}
function composePickerBlockTitleElement(title) {
    const element = document.createElement("div");
    element.className = PICKET_BLOCK_CLASS + "__title";
    element.textContent = title;
    return element;
}
function composePickerBlockAmountElement(amount) {
    const element = document.createElement("div");
    element.className = PICKET_BLOCK_CLASS + "__amount";
    element.textContent = "x" + String(amount);
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
    static get rect() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        return this.#boundElement.getBoundingClientRect();
    }
    static get boundElement() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        return this.#boundElement;
    }
    static settle(polygonObject) {
        polygonObject.settled();
        this.#objects.add(polygonObject);
        this.#render();
    }
    static unsettle(polygonObject) {
        polygonObject.unsettled();
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
        for (const otherPolygonObject of this.#objects) {
            if (polygonObject.intersects(otherPolygonObject))
                return true;
        }
        return false;
    }
    static #render() {
        if (this.#boundElement === null) {
            throw new Error("boundElement is not set");
        }
        this.#boundElement.replaceChildren();
        for (const polygonObject of this.#objects) {
            const polygonElement = polygonObject.boundElement;
            this.#boundElement.append(polygonElement);
        }
    }
    static get objects() {
        return [...this.#objects];
    }
    static get objectsCount() {
        return this.#objects.size;
    }
    static clear() {
        this.#objects.clear();
        this.#render();
    }
    /**
     *
     * @param absoluteVector Vector2 in absolute coordinates (not relative to Polygon, but to document)
     * @returns Vector2 in relative coordinates to Polygon
     */
    static fromAbsoluteToRelative(absoluteVector) {
        // console.log(absoluteVector)
        const relativeVector = absoluteVector.clone();
        // Removing top, left of `Polygon` and `Boundary.offset`
        relativeVector.minus(Polygon.rect.left, Polygon.rect.top);
        relativeVector.minus(Boundary.offset);
        const computedStyle = getComputedStyle(Polygon.boundElement);
        const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
        const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);
        // Remove borders
        relativeVector.minus(borderX, borderY);
        return relativeVector;
    }
}
function createClassModifierToggleProxy(value, onElement) {
    if (!isDictionary(value)) {
        throw new Error("value is not a dictionary");
    }
    if (!Object.values(value).every(value => typeof value === "boolean")) {
        throw new Error("value must be a dictionary of booleans");
    }
    const stateModifiers = Object.keys(value).reduce((result, nextKey) => ({ ...result, [nextKey]: camelToDash(nextKey) }), {});
    const proxy = new Proxy(value, {
        set(target, key, value) {
            // console.log(target, key, value)
            const stateValue = target[key];
            if (stateValue === value)
                return true;
            target[key] = value;
            toggleElementClassModification(onElement, stateModifiers[key], value);
            return true;
        }
    });
    return proxy;
}
function decorateClassModifierToggle(target, propertyNameOfState, onElement) {
    let proxy = createClassModifierToggleProxy(target[propertyNameOfState], onElement);
    Object.defineProperty(target, propertyNameOfState, {
        get() {
            return proxy;
        },
        set(value) {
            proxy = createClassModifierToggleProxy(value, onElement);
        },
    });
}
function observeStyleChange(target, mutationCallback) {
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(target, {
        attributes: true,
        attributeFilter: ["style"],
    });
}
class PolygonObject extends BoundElement {
    block;
    state = {
        /**
          * Whether the polygonObject can be dragged
          */
        draggable: false,
        /**
          * Whether the polygonObject is being dragged
          */
        dragging: false,
        /**
         * Whether the polygonObject is not allowed to be dragged
         */
        notAllowed: false,
        /**
         * Whether the polygonObject is selected by pointer
         */
        selected: false,
    };
    constructor(element, block) {
        super(element);
        this.block = block;
        decorateClassModifierToggle(this, "state", this.boundElement);
        observeStyleChange(this.boundElement, () => {
            Boundary.checkIfObjectAllowed(this);
        });
        this.on("contextmenu", (_, event) => {
            event.preventDefault();
        });
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
    get position() {
        const translateX = this.transform.functions.translateX;
        const translateY = this.transform.functions.translateY;
        if (translateX == null || translateY == null) {
            return new Vector2(0, 0);
        }
        return new Vector2(translateX.value, translateY.value);
    }
    set position(vector) {
        // console.log(this, vector)
        // this.transform.origin = [new CSSUnit(0, "px"), new CSSUnit(0, "px")]
        // if (this.rotated) {
        // console.log(Boundary.offset)
        // vector.rotate(this.size.divide(2), 0)
        // console.log(vector.clone().rotate(this.size.divide(2), 0))
        // console.log(vector.clone().rotate(90))
        // console.log(vector)
        // vector.minus(Boundary.offset.clone().reverse())
        // vector.minus(this.size.clone().reverse().divide(2))
        // console.log(vector)
        // }
        this.transform.functions.translateX = new CSSUnit(vector.x, "px");
        this.transform.functions.translateY = new CSSUnit(vector.y, "px");
    }
    rotated = false;
    rotate(origin) {
        this.rotated = !this.rotated;
        // this.transform.origin = [new CSSUnit(0, "px"), new CSSUnit(0, "px")]
        if (origin) {
            this.transform.origin = [new CSSUnit(origin.x, "px"), new CSSUnit(origin.y, "px")];
        }
        this.transform.functions.rotateZ = new CSSUnit(this.rotated ? 90 : 0, "deg");
    }
    clone() {
        const clone = new PolygonObject(this.boundElement.cloneNode(true), this.block);
        clone.position = this.position;
        clone.state = { ...this.state };
        return clone;
    }
    #onSettledCallbacks = [];
    onSettled(callback) {
        this.#onSettledCallbacks.push(callback);
    }
    /**
     * Says to polygonObject that it is settled
     */
    settled() {
        this.#onSettledCallbacks.forEach(callback => callback());
    }
    settle() {
        Polygon.settle(this);
    }
    #onUnsettledCallbacks = [];
    onUnsettled(callback) {
        this.#onUnsettledCallbacks.push(callback);
    }
    /**
     * Says to polygonObject that it is unsettled
     */
    unsettled() {
        this.#onUnsettledCallbacks.forEach(callback => callback());
    }
    unsettle() {
        Polygon.unsettle(this);
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
        this.boundElement.addEventListener(type, eventFunction, options);
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
        this.boundElement.removeEventListener(type, eventFunction);
    }
}
const resultTitle = document.getElementById("result-title");
const resultText = document.getElementById("result-text");
const boundary = document.body.querySelector("[pc-boundary]");
const polygon = document.body.querySelector("[pc-polygon]");
const picker = document.body.querySelector("[pc-picker]");
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
        Boundary.currentPointerEvent = event;
        event.preventDefault();
        if (event.pressure < 0.5)
            return;
        if (Boundary.draggingObject) {
            // console.log(event)
            Boundary.draggingObject.position = Polygon.fromAbsoluteToRelative(new Vector2(event.x, event.y));
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
    Boundary.updateOffset(event);
    Boundary.draggingObject = polygonObject;
    polygonObject.transform.origin = [
        new CSSUnit(event.offsetX, "px"),
        new CSSUnit(event.offsetY, "px")
    ];
    polygonObject.position = Polygon.fromAbsoluteToRelative(new Vector2(event.x, event.y));
    polygonObject.on("pointerup", stopDragging, { once: true });
}
function stopDragging(polygonObject, event) {
    event.preventDefault();
    if (polygonObject.state.notAllowed) {
        Polygon.unsettle(polygonObject);
    }
    else {
        Boundary.selectedObject = polygonObject;
    }
    Boundary.draggingObject = null;
}
const DEFAULT_CLASS_NAME = "polygon-constructor__object";
Picker.addComponent({
    id: 1,
    amount: 3,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 100×250",
    angle: 0,
});
Picker.addComponent({
    id: 2,
    amount: 6,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 50×250",
    angle: 0,
});
Picker.addComponent({
    id: 3,
    amount: 1,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Дверь раздвижная 100×250",
    angle: 0,
});
Picker.addComponent({
    id: 4,
    amount: 1,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Занавес 100×250",
    angle: 0,
});
Picker.addComponent({
    id: 7,
    amount: 1,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Полка настенная 1m",
    angle: 0,
});
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
function toggleElementClassModification(element, modifier, force) {
    const baseClass = element.classList[0];
    if (force === true) {
        element.classList.add(baseClass + CLASS_SPLITTER + modifier);
    }
    else {
        element.classList.remove(baseClass + CLASS_SPLITTER + modifier);
    }
}
function isDictionary(object) {
    return object instanceof Object && object.constructor === Object;
}
function camelToDash(string) {
    string = string.toString();
    if (string != string.toLowerCase()) {
        string = string.replace(/[A-Z]/g, match => "-" + match.toLowerCase());
    }
    return string;
}
