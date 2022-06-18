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
    }
    divide(arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x /= arg1.x;
            this.y /= arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x /= arg1;
            this.y /= arg2;
        }
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
        const componentName = polygonObject.id ? componentNames[polygonObject.id] : "unknown";
        const objectsByGroups = Polygon.getObjectsByGroups();
        resultTitle.innerHTML = componentName;
        const rotateButton = document.createElement("button");
        rotateButton.type = "button";
        rotateButton.textContent = "Rotate";
        rotateButton.addEventListener("pointerdown", () => {
            const origin = new Vector2(polygonObject.rect.width / 2, polygonObject.rect.height / 2);
            polygonObject.rotate(origin);
        });
        resultTitle.append(rotateButton);
        resultText.innerHTML = `Использованные блоки => <br>${Object.keys(objectsByGroups).map(key => {
            const objectsGroup = objectsByGroups[key];
            return `"${componentNames[key]}": ${objectsGroup?.length || "Bug detected"}`;
        }).join(",<br>")}`;
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
            polygonObject.notAllowed = true;
            return false;
        }
        if (Polygon.intersectsOtherObjects(polygonObject)) {
            polygonObject.notAllowed = true;
            return false;
        }
        polygonObject.notAllowed = false;
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
            setTimeout(() => {
                for (const callback of callbacks)
                    callback();
            });
            return Reflect.set(target, key, value, receiver);
        },
    });
}
function observeProperty(target, property, callbacks) {
    const value = target[property];
    target[property] = new Proxy({ current: value }, {
        set(target, _key, value, receiver) {
            // Call immediately after setting the property
            setTimeout(() => {
                for (const callback of callbacks)
                    callback();
            });
            return Reflect.set(target, "current", value, receiver);
        },
    });
}
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
        observeProperty(this, "origin", this.#callbacks);
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
    static createComponent(options) {
        if (options.id == null)
            options.id = this.#components.size + 1;
        const component = new PickerComponent(options);
        component.polygonObject.boundElement.addEventListener("pointerdown", event => {
            if (component.usedAmount >= component.maxAmount)
                return;
            const clonedPolygonObject = clonePolygonObject(component.polygonObject);
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
        this.maxUnitsT[options.id] = options.maxAmount || Infinity;
        this.#render();
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
        if (value >= this.maxAmount) {
            addElementClassModification(this.#element, "disabled");
        }
        else {
            removeElementClassModification(this.#element, "disabled");
        }
    }
    get usedAmount() {
        return this.#usedAmount;
    }
    constructor(options) {
        this.maxAmount = options.maxAmount;
        this.#element = composePickerBlockElement();
        this.#polygonObject = composePolygonObject(options);
        this.#element.append(composePickerBlockTitleElement(options.title));
        this.#element.append(this.#polygonObject.boundElement);
        this.#amountElement = composePickerBlockAmountElement(options.maxAmount);
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
function composePolygonObject(options) {
    if (options.id == null)
        options.id = -1;
    const element = document.createElement("div");
    element.appendChild(composeImageElement("elements/" + options.id.toString() + ".png"));
    element.classList.add(options.className);
    element.classList.add(...(options.modifiers || []).map(modifier => options.className + CLASS_SPLITTER + modifier));
    const polygonObject = new PolygonObject(element);
    polygonObject.id = options.id;
    return polygonObject;
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
        polygonObject.settle();
        this.#objects.add(polygonObject);
        this.#render();
    }
    static unsettle(polygonObject) {
        polygonObject.unsettle();
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
    static getObjectsByGroups() {
        const result = {};
        for (const polygonObject of this.#objects) {
            if (polygonObject.id == null) {
                console.warn("Some of the objects has no id, it will be skipped.", polygonObject);
                continue;
            }
            // result[polygonObject.id]?.push(polygonObject) || (result[polygonObject.id] = [polygonObject])
            result[polygonObject.id] = [...result[polygonObject.id] || [], polygonObject];
        }
        return result;
    }
    static get objectsCount() {
        return this.#objects.size;
    }
}
const DRAGGABLE_MODIFIER = "draggable";
const DRAGGING_MODIFIER = "dragging";
const NOT_ALLOWED_MODIFIER = "not-allowed";
const SELECTED_MODIFIER = "selected";
class PolygonObject {
    id;
    #clumpedPositionStep = false;
    #boundElement;
    #state = {
        draggable: false,
        dragging: false,
        notAllowed: false,
        selected: false,
    };
    transform;
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
        if (!(boundElement instanceof HTMLElement)) {
            throw new Error("boundElement must be an instance of HTMLElement");
        }
        this.#boundElement = boundElement;
        this.transform = new CSSTransform(this.#boundElement);
        const mutationCallback = (_mutations, _observer) => {
            Boundary.checkIfObjectAllowed(this);
        };
        const mutationObserver = new MutationObserver(mutationCallback);
        mutationObserver.observe(boundElement, {
            attributes: true,
            attributeFilter: ["style"],
        });
        this.on("contextmenu", (_, event) => {
            event.preventDefault();
        });
        window.addEventListener("keydown", event => {
            if (event.altKey)
                return;
            if (event.ctrlKey)
                return;
            if (!event.shiftKey || event.key.toLowerCase() !== "shift")
                return;
            event.preventDefault();
            // console.log(event)
            if (polygon instanceof HTMLElement) {
                polygon.style.backgroundImage = `
          repeating-linear-gradient(90deg, transparent 0 23px, rgba(0, 0, 0, 0.25) 23px 30px),
          repeating-linear-gradient(transparent 0 23px, rgba(0, 0, 0, 0.25) 23px 30px)
        `;
            }
            this.#clumpedPositionStep = true;
        });
        window.addEventListener("keyup", event => {
            // if (event.altKey) return
            // if (event.ctrlKey) return
            // if (!event.shiftKey || event.key.toLowerCase() !== "shift") return
            event.preventDefault();
            if (polygon instanceof HTMLElement) {
                polygon.style.backgroundImage = "";
            }
            this.#clumpedPositionStep = false;
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
    get boundElement() {
        return this.#boundElement;
    }
    get position() {
        return new Vector2(this.rect.x, this.rect.y);
    }
    set position(vector) {
        // function normalize(value: number, by: number): number {
        //   return value - (value % by)
        // }
        let x = vector.x - Polygon.rect.left - Boundary.offset.x;
        let y = vector.y - Polygon.rect.top - Boundary.offset.y;
        const computedStyle = getComputedStyle(Polygon.boundElement);
        const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
        const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);
        x -= (paddingX / 2) + (borderX / 2);
        y -= (paddingY / 2) + (borderY / 2);
        // if (this.#clumpedPositionStep && !this.#state.notAllowed) {
        //   x = normalize(x, 30)
        //   y = normalize(y, 30)
        // }
        this.transform.functions.translateX = new CSSUnit(x, "px");
        this.transform.functions.translateY = new CSSUnit(y, "px");
    }
    rotated = false;
    rotate(origin) {
        this.rotated = !this.rotated;
        Polygon.contains;
        if (origin) {
            this.transform.origin = [new CSSUnit(origin.x, "px"), new CSSUnit(origin.y, "px")];
        }
        this.transform.functions.rotateZ = new CSSUnit(this.rotated ? 90 : 0, "deg");
        // setTimeout(() => {
        //   if (this.notAllowed) {
        //     this.rotate(origin)
        //   }
        // })
    }
    clone() {
        const clone = new PolygonObject(this.#boundElement.cloneNode(true));
        clone.position = this.position;
        clone.rotated = this.rotated;
        return clone;
    }
    #onSettledCallbacks = [];
    onSettled(callback) {
        this.#onSettledCallbacks.push(callback);
    }
    /**
     * Says to polygonObject that it is settled
     */
    settle() {
        this.#onSettledCallbacks.forEach(callback => callback());
    }
    #onUnsettledCallbacks = [];
    onUnsettled(callback) {
        this.#onUnsettledCallbacks.push(callback);
    }
    /**
     * Says to polygonObject that it is unsettled
     */
    unsettle() {
        this.#onUnsettledCallbacks.forEach(callback => callback());
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
    Boundary.updateOffset(event);
    Boundary.draggingObject = polygonObject;
    polygonObject.transform.origin = [
        new CSSUnit(event.offsetX, "px"),
        new CSSUnit(event.offsetY, "px")
    ];
    polygonObject.position = new Vector2(event.x, event.y);
    polygonObject.on("pointerup", stopDragging, { once: true });
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
function clonePolygonObject(polygonObject) {
    const clonedElement = polygonObject.boundElement.cloneNode(true);
    const clonedPolygonObject = new PolygonObject(clonedElement);
    clonedPolygonObject.id = polygonObject.id;
    clonedPolygonObject.draggable = true;
    clonedPolygonObject.on("pointerdown", startDragging);
    return clonedPolygonObject;
}
const DEFAULT_CLASS_NAME = "polygon-constructor__object";
Picker.createComponent({ title: "asd1", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd32", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd3", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd4", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd5", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd6", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd7", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd8", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd9", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd1123", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd123123", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd12312", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd3123213", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd12312", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd31231", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd312321", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd23123", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd12312", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
Picker.createComponent({ title: "asd3123", className: DEFAULT_CLASS_NAME, maxAmount: 2 });
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
// function modifyTransform(previousTransform: string, modifier: string, value: string): string {
//   const transform = previousTransform.split(' ')
//   const index = transform.findIndex(t => t.startsWith(modifier))
//   if (index === -1) {
//     transform.push(modifier + value)
//   } else {
//     transform[index] = modifier + value
//   }
//   return transform.join(' ')
// }
