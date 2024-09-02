export default class Cube {
    /**
     * @param {Renderer} renderer
     * @param {string} [label = "Cube"]
     */
    constructor(renderer: Renderer, label?: string | undefined);
    SetGeometryBuffers(): void;
    UpdateTransformBuffer(): void;
    get TransformBuffer(): GPUBuffer;
    get Transform(): Float32Array;
    get Vertices(): number;
    #private;
}
//# sourceMappingURL=Cube.d.ts.map