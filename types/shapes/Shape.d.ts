export default class Shape {
    /**
     * @typedef {Object} ShapeDescriptor
     * @property {Renderer} renderer
     * @property {number} [segments]
     * @property {string} [label = "Shape"]
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = NUMBER.TAU]
     * @param {ShapeDescriptor} descriptor
     */
    constructor(descriptor: {
        renderer: Renderer;
        segments?: number | undefined;
        label?: string | undefined;
        radius?: number | undefined;
        innerRadius?: number | undefined;
        startAngle?: number | undefined;
        endAngle?: number | undefined;
    });
    /** @param {Vec2 | Vec2n} scale */
    set Scale(scale: number[] | Float32Array);
    get Scale(): number[] | Float32Array;
    /** @param {Vec2 | Vec2n} origin */
    set Origin(origin: number[] | Float32Array);
    get Origin(): number[] | Float32Array;
    /** @param {number} rotation */
    set Rotation(rotation: number);
    get Rotation(): number;
    /** @param {Vec2 | Vec2n} position */
    set Position(position: number[] | Float32Array);
    get Position(): number[] | Float32Array;
    Update(): this;
    /** @param {boolean} [submit = true] */
    Render(submit?: boolean | undefined): void;
    /** @param {import("../Color").default | Vec4 | Vec4n} color */
    set Color(color: import("../Color").default | number[] | Float32Array);
    get Color(): import("../Color").default | number[] | Float32Array;
    get Center(): Float32Array;
    get Vertices(): number;
    get Transform(): Float32Array;
    get BoundingBox(): any;
    #private;
}
//# sourceMappingURL=Shape.d.ts.map