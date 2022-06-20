"use strict";
class PolygonComponent {
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
        return this.#boundElement.getBoundingClientRect();
    }
    get size() {
        const rect = this.rect;
        return new Point(rect.width, rect.height);
    }
    get offset() {
        const rect = this.rect;
        return new Point(rect.left, rect.top);
    }
    get boundElement() {
        return this.#boundElement;
    }
    get transform() {
        return this.#transform;
    }
}
class Point {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(arg1, arg2) {
        if (arg1 instanceof Point) {
            this.x += arg1.x;
            this.y += arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x += arg1;
            this.y += arg2;
        }
    }
    subtract(arg1, arg2) {
        if (arg1 instanceof Point) {
            this.x -= arg1.x;
            this.y -= arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            this.x -= arg1;
            this.y -= arg2;
        }
    }
    power(arg1, arg2) {
        if (arg1 instanceof Point) {
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
        if (arg1 instanceof Point) {
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
    equals(point) {
        return this.x === point.x && this.y === point.y;
    }
    clone() {
        return new Point(this.x, this.y);
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    reverse() {
        this.y = this.x;
        this.x = this.y;
        return this;
    }
    normalize(normalizer) {
        this.x = normalizer(this.x);
        this.y = normalizer(this.y);
        return this;
    }
}
class CSSTransform {
    /**
     * The `transform` functions.
     * Have side effects.
     * Use `observe` to listen for changes.
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
    }
    /**
     * Triggers the callback when the `transform` functions are changed
     *
     * @param callback The callback to be called when the `transform` is changed
     */
    observe(callback) {
        this.#callbacks.push(callback);
    }
    /**
     * Connects the `transform` to the given element.
     * This will update the `transform` on the `element` when a function is changed.
     * In addition, this will update the `origin` when the `origin` is changed.
     *
     * @param element The element to connect to
     */
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
class EventEmitter {
    #listeners = new Map;
    on(event, listener) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, new Set());
        }
        this.#listeners.get(event).add(listener);
    }
    off(event, listener) {
        if (!this.#listeners.has(event)) {
            return;
        }
        this.#listeners.get(event).delete(listener);
    }
    emit(event, ...listenerParams) {
        if (!this.#listeners.has(event)) {
            return;
        }
        for (const listener of this.#listeners.get(event)) {
            listener(...listenerParams);
        }
    }
}
// interface IEventsController<Type extends string, Listener extends (...args: never[]) => void> {
//   on(event: Type, listener: Listener): void
//   off(event: Type, listener: Listener): void
// }
class Polygon {
    boundary;
    area;
    picker;
    entries;
    blocks;
    constructor() {
        const boundaryElement = document.body.querySelector("[pc-boundary]");
        const areaElement = document.body.querySelector("[pc-area]");
        const pickerElement = document.body.querySelector("[pc-picker]");
        const entriesElement = document.body.querySelector("[pc-entries]");
        if (!(boundaryElement instanceof HTMLElement)) {
            throw new Error("Polygon constructor: no boundary element found");
        }
        if (!(pickerElement instanceof HTMLElement)) {
            throw new Error("Polygon constructor: no picker element found");
        }
        if (!(areaElement instanceof HTMLElement)) {
            throw new Error("Polygon constructor: no polygon element found");
        }
        if (!(entriesElement instanceof HTMLElement)) {
            throw new Error("Polygon constructor: no entries element found");
        }
        this.boundary = new PolygonBoundary(boundaryElement);
        this.area = new PolygonArea(areaElement);
        this.picker = new PolygonPicker(pickerElement);
        this.entries = new PolygonEntries(entriesElement);
        this.blocks = new PolygonBlocks;
        this.#startLogic();
    }
    #startLogic() {
        /**
         * A relative point where a polygonObject is grabbed.
         */
        let polygonObjectGrabOffset = new Point(0, 0);
        this.boundary.onDragStart((polygonObject, event) => {
            event.preventDefault();
            polygonObjectGrabOffset = new Point(event.offsetX, event.offsetY);
            const position = new Point(event.x, event.y);
            position.subtract(polygonObjectGrabOffset);
            polygonObject.transform.origin = [
                new CSSUnit(event.offsetX, "px"),
                new CSSUnit(event.offsetY, "px")
            ];
            polygonObject.position = this.area.fromAbsoluteToRelative(position);
            this.area.checkIfObjectAllowed(polygonObject);
        });
        this.boundary.onDrag((polygonObject, event) => {
            event.preventDefault();
            const position = new Point(event.x, event.y);
            position.subtract(polygonObjectGrabOffset);
            polygonObject.position = this.area.fromAbsoluteToRelative(position);
            this.area.checkIfObjectAllowed(polygonObject);
        });
        this.boundary.onDragEnd((polygonObject, event) => {
            event.preventDefault();
            this.boundary.selectedObject = polygonObject;
            if (polygonObject.state.notAllowed) {
                this.area.unsettle(polygonObject);
            }
        });
        this.boundary.onKeyDown("r", event => {
            if (event.altKey)
                return;
            if (event.ctrlKey)
                return;
            event.preventDefault();
            if (this.boundary.draggingObject) {
                this.boundary.draggingObject.rotate();
            }
        });
        this.boundary.onSelectedObjectChange((polygonObject) => {
            const entryElement = this.entries.setEntry("selected-block", polygonObject.block.name);
            const rotateButton = document.createElement("button");
            rotateButton.type = "button";
            rotateButton.textContent = "Rotate";
            rotateButton.addEventListener("pointerdown", () => {
                const origin = new Point(polygonObject.rect.width / 2, polygonObject.rect.height / 2);
                polygonObject.rotate(origin);
            });
            entryElement.append(rotateButton);
            addElementClassModification(entryElement, "blue");
        });
        this.blocks.on("add", block => {
            const component = this.picker.addComponent(block);
            this.area.getObjectsById(block.id).forEach(polygonObject => {
                component.usedAmount++;
                polygonObject.onUnsettled(() => {
                    component.usedAmount--;
                });
            });
            component.polygonObject.on("pointerdown", (_, event) => {
                event.preventDefault();
                if (component.usedAmount >= component.maxAmount)
                    return;
                const clonedPolygonObject = component.polygonObject.clone();
                this.boundary.makePolygonObjectDraggable(clonedPolygonObject);
                component.usedAmount++;
                clonedPolygonObject.onUnsettled(() => {
                    component.usedAmount--;
                });
                this.boundary.startDragging(clonedPolygonObject, event);
                this.area.settle(clonedPolygonObject);
            });
        });
        this.blocks.on("remove", block => {
            // this.area.unsettleAllById(block.id)
            this.picker.removeComponent(block);
        });
    }
    /**
     * Resets the `polygon` to its initial state. Removes all polygonObjects from `area` and clears `blocks`.
     */
    reset() {
        this.area.clear();
        this.blocks.clear();
    }
    export(normalizer) {
        const output = [];
        for (const polygonObject of this.area.objects) {
            const position = polygonObject.position.clone();
            if (polygonObject.rotated) {
                const origin = new Point(polygonObject.transform.origin[0].value, polygonObject.transform.origin[1].value);
                position.x += origin.x + origin.y;
                position.y += origin.y - origin.x;
            }
            if (normalizer) {
                position.normalize(normalizer);
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
    import(...outputBlocks) {
        if (this.area.objectsCount > 0) {
            throw new Error("Polygon import: cannot import when there are already objects in the area.");
        }
        this.picker.clearUsedAmount();
        for (const outputBlock of outputBlocks) {
            const component = this.picker.getComponentById(outputBlock.id);
            if (component == null) {
                throw new Error(`Polygon import: block with id ${outputBlock.id} not found`);
            }
            const polygonObject = component.polygonObject.clone();
            if (outputBlock.angle === 90) {
                polygonObject.rotate();
            }
            polygonObject.position = new Point(outputBlock.x, outputBlock.y);
            this.boundary.makePolygonObjectDraggable(polygonObject);
            component.usedAmount++;
            polygonObject.onUnsettled(() => {
                component.usedAmount--;
            });
            this.area.settle(polygonObject);
        }
    }
}
class PolygonBlocks extends EventEmitter {
    #blocks = new Map(); // id => block
    add(block) {
        this.#blocks.set(block.id, block);
        this.emit("add", block);
    }
    remove(block) {
        this.#blocks.delete(block.id);
        this.emit("remove", block);
    }
    removeById(id) {
        const block = this.getById(id);
        if (block == null)
            return;
        this.remove(block);
    }
    getById(id) {
        return this.#blocks.get(id) || null;
    }
    clear() {
        for (const block of this.#blocks.values()) {
            this.remove(block);
        }
    }
    get size() {
        return this.#blocks.size;
    }
    get list() {
        return [...this.#blocks.values()];
    }
}
class PolygonArea extends PolygonComponent {
    #objects = new Set;
    #events = new EventEmitter;
    /**
     * Will add it to Polygon, render it, then say to polygonObject that it is settled.
     *
     * @param polygonObject PolygonObject to add to Polygon
     */
    settle(polygonObject) {
        observeStyleChange(polygonObject.boundElement, () => {
            this.checkIfObjectAllowed(polygonObject);
        });
        this.#objects.add(polygonObject);
        this.#render();
        this.#events.emit("change", this.objects);
        polygonObject.settled();
    }
    /**
     * Will remove it from Polygon, render it, then say to polygonObject that it is unsettled.
     *
     * @param polygonObject PolygonObject to remove from Polygon
     */
    unsettle(polygonObject) {
        this.#objects.delete(polygonObject);
        this.#render();
        this.#events.emit("change", this.objects);
        polygonObject.unsettled();
    }
    unsettleAllById(id) {
        for (const object of this.#objects) {
            if (object.block.id === id) {
                this.unsettle(object);
            }
        }
    }
    unsettleLastById(id) {
        for (const object of this.#objects) {
            if (object.block.id === id) {
                this.unsettle(object);
                return;
            }
        }
    }
    #render() {
        // Remove all children
        this.boundElement.replaceChildren();
        // Add all polygon objects
        for (const polygonObject of this.#objects) {
            this.boundElement.append(polygonObject.boundElement);
        }
    }
    get objects() {
        return [...this.#objects];
    }
    get objectsCount() {
        return this.#objects.size;
    }
    getObjectsById(id) {
        return [...this.#objects].filter(object => object.block.id === id);
    }
    clear() {
        this.#objects.clear();
        this.#render();
    }
    onChange(callback) {
        this.#events.on("change", callback);
    }
    /**
     *
     * Checks whether polygonObject is within Polygon borders
     */
    contains(polygonObject) {
        const polygonRect = this.rect;
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
    intersectsAny(polygonObject) {
        for (const otherPolygonObject of this.#objects) {
            if (polygonObject.intersects(otherPolygonObject))
                return true;
        }
        return false;
    }
    /**
     *
     * @param absolute `Point` in absolute coordinates (not relative to Polygon, but to document)
     * @returns `Point` in relative coordinates to Polygon
     */
    fromAbsoluteToRelative(absolute) {
        const relative = absolute.clone();
        // Removing top, left of `Polygon`
        relative.subtract(this.rect.left, this.rect.top);
        const computedStyle = getComputedStyle(this.boundElement);
        const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
        const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);
        // Remove borders
        relative.subtract(borderX, borderY);
        return relative;
    }
    /**
     *
     * Checks if polygonObject can be placed
     *
     * Also sets notAllowed state on draggingObject accordingly
     */
    checkIfObjectAllowed(polygonObject) {
        if (!this.contains(polygonObject)) {
            polygonObject.state.notAllowed = true;
            return false;
        }
        if (this.intersectsAny(polygonObject)) {
            polygonObject.state.notAllowed = true;
            return false;
        }
        polygonObject.state.notAllowed = false;
        return true;
    }
}
class PolygonBoundary extends PolygonComponent {
    #draggingEvents = new EventEmitter;
    #events = new EventEmitter;
    constructor(element) {
        super(element);
        // this.
    }
    #draggingObject = null;
    /**
     * The current polygonObject which is being dragged
     */
    get draggingObject() {
        return this.#draggingObject;
    }
    set draggingObject(polygonObject) {
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
    #selectedObject = null;
    /**
     * The current polygonObject which is selected
     */
    get selectedObject() {
        return this.#selectedObject;
    }
    set selectedObject(polygonObject) {
        if (polygonObject === null)
            return;
        if (this.#selectedObject === polygonObject)
            return;
        if (this.#selectedObject) {
            this.#selectedObject.state.selected = false;
        }
        polygonObject.state.selected = true;
        this.#selectedObject = polygonObject;
        this.#events.emit("selectedObjectChange", polygonObject);
    }
    startDragging(polygonObject, pointerDownEvent) {
        if (this.draggingObject)
            return;
        if (polygonObject.state.dragging)
            return;
        if (!polygonObject.state.draggable)
            return;
        if (pointerDownEvent.pressure < 0.5) {
            throw new Error("Pointer down event pressure is too low, probably not a real pointer down event.");
        }
        pointerDownEvent.preventDefault();
        this.draggingObject = polygonObject;
        this.#draggingEvents.emit("dragstart", polygonObject, pointerDownEvent);
        const pointermoveEvent = (pointermoveEvent) => {
            this.#draggingEvents.emit("drag", polygonObject, pointermoveEvent);
        };
        this.boundElement.addEventListener("pointermove", pointermoveEvent);
        window.addEventListener("pointerup", pointerupEvent => {
            this.draggingObject = null;
            this.boundElement.removeEventListener("pointermove", pointermoveEvent);
            this.#draggingEvents.emit("dragend", polygonObject, pointerupEvent);
        }, { once: true });
    }
    makePolygonObjectDraggable(polygonObject) {
        if (polygonObject.state.dragging)
            return;
        if (polygonObject.state.draggable)
            return;
        polygonObject.state.draggable = true;
        polygonObject.on("pointerdown", this.startDragging.bind(this));
    }
    onSelectedObjectChange(callback) {
        this.#events.on("selectedObjectChange", callback);
    }
    onDrag(callback) {
        this.#draggingEvents.on("drag", callback);
    }
    onDragStart(callback) {
        this.#draggingEvents.on("dragstart", callback);
    }
    onDragEnd(callback) {
        this.#draggingEvents.on("dragend", callback);
    }
    onKeyDown(key, callback) {
        window.addEventListener("keydown", event => {
            if (event.code === ("Key" + key.toUpperCase())) {
                callback(event);
            }
        });
    }
}
class PolygonEntries extends PolygonComponent {
    entries = new Map; // id => element
    setEntry(id, textContent, modification) {
        this.deleteEntry(id);
        // if (!this.entries.has(id)) {
        const element = this.createEntryElement();
        this.entries.set(id, element);
        this.boundElement.appendChild(element);
        // }
        // const element = this.entries.get(id)!
        element.textContent = textContent;
        if (modification) {
            addElementClassModification(element, modification);
        }
        return element;
    }
    deleteEntry(id) {
        this.entries.get(id)?.remove();
        this.entries.delete(id);
    }
    createEntryElement() {
        const element = document.createElement("div");
        element.classList.add(this.boundElement.className + "__entry");
        return element;
    }
}
class PolygonObject extends PolygonComponent {
    #listeners = new Map;
    #onSettledCallbacks = [];
    #onUnsettledCallbacks = [];
    rotated = false;
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
        return new Point(translateX?.value ?? 0, translateY?.value ?? 0);
    }
    set position(vector) {
        this.transform.functions.translateX = new CSSUnit(vector.x, "px");
        this.transform.functions.translateY = new CSSUnit(vector.y, "px");
    }
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
    onSettled(callback) {
        this.#onSettledCallbacks.push(callback);
    }
    /**
     * Says to polygonObject that it is settled
     */
    settled() {
        for (const callback of this.#onSettledCallbacks)
            callback();
    }
    onUnsettled(callback) {
        this.#onUnsettledCallbacks.push(callback);
    }
    /**
     * Says to polygonObject that it is unsettled
     */
    unsettled() {
        for (const callback of this.#onUnsettledCallbacks)
            callback();
    }
    destroy() {
        this.boundElement.remove();
        this.#listeners.clear();
    }
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
}
const PICKET_BLOCK_CLASS = "polygon-constructor-sidebar-block";
class PolygonPicker extends PolygonComponent {
    #components = new Map; // id => component
    #events = new EventEmitter;
    addComponent(block) {
        const component = new PolygonPickerComponent(block);
        this.#events.emit("add", component);
        this.#components.set(block.id, component);
        this.#render();
        return component;
    }
    removeComponent(block) {
        const component = this.getComponentById(block.id);
        if (component == null)
            return;
        this.removeComponentById(block.id);
    }
    removeComponentById(id) {
        this.#events.emit("remove", this.getComponentById(id));
        this.#components.delete(id);
        this.#render();
    }
    getComponentById(id) {
        return [...this.#components.values()].find(component => component.polygonObject.block.id === id);
    }
    clearUsedAmount() {
        for (const component of this.#components.values()) {
            component.usedAmount = 0;
        }
    }
    get components() {
        return [...this.#components.values()];
    }
    getUnrealizedComponents() {
        return [...this.#components.values()].filter(component => component.usedAmount !== component.maxAmount);
    }
    getUnderusedComponents() {
        return [...this.#components.values()].filter(component => component.usedAmount < component.maxAmount);
    }
    getOverusedComponents() {
        return [...this.#components.values()].filter(component => component.usedAmount > component.maxAmount);
    }
    onComponentAdded(callback) {
        this.#events.on("add", callback);
    }
    onComponentRemoved(callback) {
        this.#events.on("remove", callback);
    }
    #render() {
        // Remove all children
        this.boundElement.replaceChildren();
        // Add all components
        for (const component of this.#components.values()) {
            this.boundElement.append(component.element);
        }
    }
}
class PolygonPickerComponent {
    #element; // Picket wrapper element
    #polygonObject;
    #amountElement;
    maxAmount = 0;
    #usedAmount = 0;
    set usedAmount(value) {
        // if (value < 0) return
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
/// <reference path="global.d.ts" />
Math.clamp = function (x, min, max) {
    return Math.min(Math.max(x, min), max);
};
const CLASS_SPLITTER = "--";
const DEFAULT_CLASS_NAME = "polygon-constructor__object";
const polygon = new Polygon;
// setTimeout(() => {
polygon.blocks.add({
    id: 1,
    amount: 3,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 100×250",
    angle: 0,
});
setTimeout(() => {
    polygon.blocks.add({
        id: 1,
        amount: 1,
        width: 5,
        height: 5,
        image: "https://picsum.photos/200/300",
        name: "Элемент стены, цвет белый 100×250",
        angle: 0,
    });
}, 1000);
setTimeout(() => {
    polygon.blocks.add({
        id: 2,
        amount: 6,
        width: 5,
        height: 5,
        image: "https://picsum.photos/200/300",
        name: "Элемент стены, цвет белый 50×250",
        angle: 0,
    });
}, 2000);
setTimeout(() => {
    polygon.blocks.add({
        id: 3,
        amount: 1,
        width: 5,
        height: 5,
        image: "https://picsum.photos/200/300",
        name: "Дверь раздвижная 100×250",
        angle: 0,
    });
}, 3000);
setTimeout(() => {
    polygon.blocks.add({
        id: 4,
        amount: 1,
        width: 5,
        height: 5,
        image: "https://picsum.photos/200/300",
        name: "Занавес 100×250",
        angle: 0,
    });
}, 4000);
setTimeout(() => {
    polygon.blocks.add({
        id: 7,
        amount: 1,
        width: 5,
        height: 5,
        image: "https://picsum.photos/200/300",
        name: "Полка настенная 1m",
        angle: 0,
    });
}, 5000);
// }, 1000)
// setTimeout(() => {
//   polygon.blocks.removeById(1)
// }, 7000)
function check() {
    if (polygon.picker.getUnderusedComponents().length > 0) {
        polygon.entries.setEntry("error", "Не все компоненты выбраны", "red");
        return;
    }
    if (polygon.picker.getOverusedComponents().length > 0) {
        polygon.entries.setEntry("error", "Выбрано слишком много компонентов", "red");
        return;
    }
    polygon.entries.deleteEntry("error");
}
polygon.area.onChange(check);
polygon.picker.onComponentAdded(check);
polygon.picker.onComponentRemoved(check);
function asd() {
    if (polygon.picker.getUnderusedComponents().length > 0)
        return;
    if (polygon.picker.getOverusedComponents().length > 0)
        return;
    const asd = polygon.export();
    polygon.area.clear();
    polygon.import(...asd);
}
setTimeout(() => {
    asd();
}, 500);
function observeObject(target, property, callbacks) {
    const value = target[property];
    if (!isDictionary(value)) {
        throw new Error(`${property.toString()} is not a dictionary`);
    }
    const valueProxy = new Proxy(value, {
        set(target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver);
            if (!result)
                return false;
            // Call back immediately after setting the property
            for (const callback of callbacks)
                callback();
            return true;
        },
    });
    Reflect.set(target, property, valueProxy);
}
function observeStyleChange(target, mutationCallback) {
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(target, {
        attributes: true,
        attributeFilter: ["style"],
    });
}
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
