"use strict";
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
        return this;
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
        return this;
    }
    multiply(arg1, arg2) {
        if (arg1 instanceof Point) {
            this.x *= arg1.x;
            this.y *= arg1.y;
        }
        if (typeof arg1 === "number" && typeof arg2 === "undefined") {
            this.x *= arg1;
            this.y *= arg1;
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
    lessThan(point) {
        return this.x < point.x || this.y < point.y;
    }
    greaterThan(point) {
        return this.x > point.x || this.y > point.y;
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
class Vector2 extends Point {
}
class CSSTransform {
    /**
     * The `transform` functions.
     * Have side effects.
     * Use `observe` to listen for changes.
     */
    functions;
    origin = new Point(0, 0);
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
    stringifyOrigin(unitType = "px") {
        // console.log(this.origin)
        // console.log(this.origin)
        return `${this.origin.x}${unitType} ${this.origin.y}${unitType}`;
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
// TODO: Refactor generics
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
// code ViewPort 
// class ViewPort {
//   constructor(canvas) {
//     this.canvas = canvas
//     /**
//       * Point used to calculate the change of every point's position on
//       * canvas after view port is zoomed and panned
//       */
//     this.center = this.basicCenter
//     this.zoom = 1
//     this.shouldPan = false
//     this.prevZoomingPoint = null
//   }
//   get canvasWidth() {
//     return this.canvas.getBoundingClientRect().width
//   }
//   get canvasHeight() {
//     return this.canvas.getBoundingClientRect().height
//   }
//   get canvasLeft() {
//     return this.canvas.getBoundingClientRect().left
//   }
//   get canvasTop() {
//     return this.canvas.getBoundingClientRect().top
//   }
//   get context() {
//     return this.canvas.getContext('2d')
//   }
//   get basicCenter() {
//     const { canvasWidth, canvasHeight } = this
//     const point = {
//       x: canvasWidth / 2,
//       y: canvasHeight / 2
//     }
//     return point
//   }
//   get basicWidth() {
//     const width = this.canvasWidth
//     return width
//   }
//   get basicHeight() {
//     const height = this.canvasHeight
//     return height
//   }
//   get width() {
//     const { basicWidth, zoom } = this
//     const width = basicWidth * zoom
//     return width
//   }
//   get height() {
//     const { basicHeight, zoom } = this
//     const height = basicHeight * zoom
//     return height
//   }
//   get movement() {
//     const { width, height, basicWidth, basicHeight } = this
//     const { x: cx, y: cy } = this.center
//     const { x: basicCX, y: basicCY } = this.basicCenter
//     const deltaX = cx - basicCX - ((width - basicWidth) / 2)
//     const deltaY = cy - basicCY - ((height - basicHeight) / 2)
//     const res = {
//       x: deltaX,
//       y: deltaY
//     }
//     return res
//   }
//   get pan() {
//     const { center, zoom, basicCenter } = this
//     const res = {
//       x: center.x - basicCenter.x,
//       y: center.y - basicCenter.y
//     }
//     return res
//   }
//   zoomBy(center, deltaZoom) {
//     const prevZoom = this.zoom
//     this.zoom = this.zoom + deltaZoom
//     this.center = this.zoomPoint(this.zoom / prevZoom)
//   }
//   zoomIn(point) {
//     this.zoomBy(point, 0.1)
//   }
//   zoomOut(point) {
//     this.zoom > 0.25 && this.zoomBy(point, -0.1)
//   }
//   zoomPoint(rate, point) {
//     const { x, y } = point
//     const deltaX = x * rate
//     const deltaY = y * rate
//     const newPoint = {
//       x: deltaX,
//       y:deltaY
//     }
//     return newPoint
//   }
//   panBy(deltaX, deltaY) {
//     const { x: centerX, y: centerY } = this.center
//     this.center = {
//       x: centerX + deltaX,
//       y: centerY + deltaY
//     }
//   }
// }
class PolygonComponent {
    #boundElement;
    #transform;
    // #ratio = 1 / 1 // px:cm ratio
    // get ratio() {
    //   return this.#ratio
    // }
    // /**
    //  * Has immediate effect on the element.
    //  * Affects position and size.
    //  */
    // set ratio(value) {
    //   this.#ratio = value
    // }
    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("boundElement must be an instance of HTMLElement");
        }
        this.#boundElement = element;
        this.#transform = new CSSTransform(element);
    }
    /**
     * Returns the rects of the element. It is not affected by the ratio.
     */
    get rect() {
        return this.#boundElement.getBoundingClientRect();
    }
    get size() {
        const rect = this.rect;
        return new Vector2(rect.width, rect.height);
    }
    /**
     * Sets size in pixels.
     */
    set size(vector) {
        this.boundElement.style.width = vector.x + "px";
        this.boundElement.style.height = vector.y + "px";
    }
    // get width(): number {
    //   return this.size.x
    // }
    // set width(width: number) {
    //   this.boundElement.style.width = width + "px"
    // }
    // get height(): number {
    //   return this.size.x
    // }
    // set height(height: number) {
    //   this.boundElement.style.height = height + "px"
    // }
    get leftTop() {
        const rect = this.rect;
        return new Point(rect.left, rect.top);
    }
    get rightBottom() {
        const rect = this.rect;
        return new Point(rect.right, rect.bottom);
    }
    get borderLeftTop() {
        const computedStyle = getComputedStyle(this.boundElement);
        const borderX = parseFloat(computedStyle.borderLeftWidth);
        const borderY = parseFloat(computedStyle.borderTopWidth);
        return new Point(borderX, borderY);
    }
    get borderRightBottom() {
        const computedStyle = getComputedStyle(this.boundElement);
        const borderX = parseFloat(computedStyle.borderRightWidth);
        const borderY = parseFloat(computedStyle.borderBottomWidth);
        return new Point(borderX, borderY);
    }
    get boundElement() {
        return this.#boundElement;
    }
    get transform() {
        return this.#transform;
    }
}
const CLASS_SPLITTER = "--";
const DEFAULT_CLASS_NAME = "polygon-constructor__object";
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
            polygonObjectGrabOffset.divide(polygonObject.ratio).multiply(this.area.ratio);
            const position = new Point(event.x, event.y);
            position.subtract(polygonObjectGrabOffset);
            polygonObject.ratio = this.area.ratio;
            polygonObject.transform.origin = polygonObjectGrabOffset.clone();
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
            this.area.unsettleAllById(block.id);
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
                const origin = polygonObject.transform.origin.clone();
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
            polygonObject.ratio = this.area.ratio;
            polygonObject.position = new Point(outputBlock.x, outputBlock.y);
            // polygonObject.position.divide(polygonObject.ratio)
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
        polygonObject.settled();
        this.#events.emit("change", this.objects);
    }
    /**
     * Will remove it from Polygon, render it, then say to polygonObject that it is unsettled.
     *
     * @param polygonObject PolygonObject to remove from Polygon
     */
    unsettle(polygonObject) {
        this.#objects.delete(polygonObject);
        this.#render();
        polygonObject.unsettled();
        this.#events.emit("change", this.objects);
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
        return this.objects.filter(object => object.block.id === id);
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
     * @param width Width of Polygon in pixels
     * @param height Height of Polygon in pixels
     * @param color Color of Polygon in CSS format
     */
    #setBackgroundGrid(width = 100, height = 100, color = "#333") {
        this.boundElement.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='100%25' height='1000px' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='${width}px' height='${height}px' patternUnits='userSpaceOnUse'%3E%3Crect width='10000000000' height='10000000000' fill='none'/%3E%3Cpath d='M 10000000000 0 L 0 0 0 10000000000' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`;
    }
    #ratio = 1 / 1;
    set ratio(ratio) {
        for (const object of this.#objects) {
            object.ratio = ratio;
        }
        this.#setBackgroundGrid(100 * ratio, 100 * ratio);
        this.#ratio = ratio;
        this.#render();
    }
    get ratio() {
        return this.#ratio;
    }
    setOpenWalls(...sides) {
        this.boundElement.style.border = "20px solid";
        for (const side of sides) {
            if (side === "left") {
                this.boundElement.style.borderLeft = "none";
            }
            if (side === "right") {
                this.boundElement.style.borderRight = "none";
            }
            if (side === "top") {
                this.boundElement.style.borderTop = "none";
            }
            if (side === "bottom") {
                this.boundElement.style.borderBottom = "none";
            }
        }
    }
    /**
     *
     * Checks whether polygonObject is within Polygon borders
     */
    contains(polygonObject) {
        const leftTop = this.leftTop.clone();
        leftTop.add(this.borderLeftTop);
        const rightBottom = this.rightBottom.clone();
        rightBottom.subtract(this.borderRightBottom);
        if (leftTop.greaterThan(polygonObject.leftTop))
            return false;
        if (rightBottom.lessThan(polygonObject.rightBottom))
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
        // Remove borders
        relative.subtract(this.borderLeftTop);
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
    checkIfObjectsAllowed(polygonObjects) {
        return polygonObjects.every(this.checkIfObjectAllowed.bind(this));
    }
}
class PolygonBoundary extends PolygonComponent {
    #draggingEvents = new EventEmitter;
    #events = new EventEmitter;
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
        if (!this.entries.has(id)) {
            const element = this.createEntryElement();
            this.entries.set(id, element);
            this.boundElement.appendChild(element);
        }
        const element = this.entries.get(id);
        element.textContent = textContent;
        if (modification) {
            element.className = [...element.classList.values()][0];
            addElementClassModification(element, modification);
        }
        return element;
    }
    deleteEntry(id) {
        const element = this.entries.get(id);
        if (element == null)
            return;
        element.textContent = "";
        this.entries.delete(id);
    }
    createEntryElement() {
        const element = document.createElement("div");
        element.classList.add(this.boundElement.className + "__entry");
        return element;
    }
}
const DEFAULT_RATIO = 1 / 1;
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
    #ratio = DEFAULT_RATIO; // px:cm ratio
    set ratio(ratio) {
        this.size = this.baseSize.multiply(ratio);
        this.position = this.position.clone().divide(this.#ratio).multiply(ratio);
        this.#ratio = ratio;
    }
    get ratio() {
        return this.#ratio;
    }
    get baseSize() {
        return new Vector2(this.block.width, this.block.height);
    }
    constructor(element, block) {
        super(element);
        this.block = block;
        this.size = new Vector2(this.block.width, this.block.height);
        this.on("contextmenu", (_, event) => {
            event.preventDefault();
        });
        decorateClassModifierToggle(this, "state", this.boundElement);
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
    #position = new Point(0, 0);
    get position() {
        return this.#position;
    }
    set position(point) {
        this.#position = point;
        this.transform.functions.translateX = new CSSUnit(point.x, "px");
        this.transform.functions.translateY = new CSSUnit(point.y, "px");
    }
    toRational(point) {
        return point.multiply(this.ratio);
    }
    fromRational(point) {
        return point.divide(this.ratio);
    }
    rotate(origin) {
        this.rotated = !this.rotated;
        if (origin) {
            this.transform.origin = origin.clone();
        }
        this.transform.functions.rotateZ = new CSSUnit(this.rotated ? 90 : 0, "deg");
    }
    clone() {
        const clone = new PolygonObject(this.boundElement.cloneNode(true), this.block);
        clone.position = this.position;
        clone.state = { ...this.state };
        clone.ratio = this.ratio;
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
    addComponent(block) {
        const component = new PolygonPickerComponent(block);
        if (component.maxAmount === 0) {
            this.removeComponent(block); // Remove if there is already block
            this.#render();
            return component;
        }
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
const polygon = new Polygon;
// setTimeout(() => {
polygon.blocks.add({
    id: 1,
    amount: 3,
    width: 160,
    height: 20,
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 100×250",
    angle: 0,
});
polygon.blocks.add({
    id: 2,
    amount: 6,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Элемент стены, цвет белый 50×250",
    angle: 0,
});
polygon.blocks.add({
    id: 3,
    amount: 1,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Дверь раздвижная 100×250",
    angle: 0,
});
polygon.blocks.add({
    id: 4,
    amount: 1,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Занавес 100×250",
    angle: 0,
});
polygon.blocks.add({
    id: 7,
    amount: 1,
    width: 5,
    height: 5,
    image: "https://picsum.photos/200/300",
    name: "Полка настенная 1m",
    angle: 0,
});
// }, 1000)
function check() {
    if (polygon.picker.getUnderusedComponents().length > 0) {
        polygon.entries.setEntry("error", "Не все компоненты выбраны", "red");
        return false;
    }
    if (polygon.picker.getOverusedComponents().length > 0) {
        polygon.entries.setEntry("error", "Выбрано слишком много компонентов", "red");
        return false;
    }
    if (polygon.area.checkIfObjectsAllowed(polygon.area.objects) === false) {
        polygon.entries.setEntry("error", "Некоторые блоки расположены неправильно", "red");
        return false;
    }
    polygon.entries.deleteEntry("error");
    return true;
}
// polygon.area.onChange(check)
// polygon.blocks.on("add", check)
// polygon.blocks.on("remove", check)
polygon.area.ratio = 1 / 2;
function onSubmit() {
    if (!check())
        return;
    const exportData = polygon.export();
    polygon.area.clear();
    polygon.import(...exportData);
    alert("nice");
    console.log(exportData);
}
setTimeout(() => {
    onSubmit();
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
