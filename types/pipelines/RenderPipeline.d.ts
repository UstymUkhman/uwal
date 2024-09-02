export default class RenderPipeline {
    /** @typedef {[GPUBuffer, GPUIndexFormat, GPUSize64, GPUSize64]} IndexBufferParamsValues */
    /** @typedef {import("../Color").default | GPUColor} ColorParam */
    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     * @param {HTMLCanvasElement} [canvas]
     * @param {import("../UWAL").ConfigurationOptions} [options = {}]
     */
    constructor(device?: any, programName?: string | undefined, canvas?: HTMLCanvasElement | undefined, options?: import("../UWAL").ConfigurationOptions | undefined);
    /** @param {import("../UWAL").ConfigurationOptions} options */
    ConfigureContext(options: import("../UWAL").ConfigurationOptions): void;
    /**
     * @param {GPUTextureView} [view]
     * @param {GPULoadOp} [loadOp = "clear"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {ColorParam} [clearColor]
     * @param {GPUTextureView} [resolveTarget]
     * @param {GPUIntegerCoordinate} [depthSlice]
     */
    CreateColorAttachment(view?: any, loadOp?: any, storeOp?: any, clearColor?: any, resolveTarget?: any, depthSlice?: any): {
        view: any;
        loadOp: any;
        storeOp: any;
        clearValue: any;
        resolveTarget: any;
        depthSlice: any;
    };
    /**
     * @param {GPUTextureView} [view]
     * @param {number} [depthClearValue = 1]
     * @param {GPULoadOp} [depthLoadOp = "clear"]
     * @param {GPUStoreOp} [depthStoreOp = "store"]
     * @param {boolean} [depthReadOnly]
     */
    CreateDepthAttachment(view?: any, depthClearValue?: number | undefined, depthLoadOp?: any, depthStoreOp?: any, depthReadOnly?: boolean | undefined): {
        view: any;
        depthClearValue: number;
        depthLoadOp: any;
        depthStoreOp: any;
        depthReadOnly: boolean | undefined;
    };
    /**
     * @param {GPUStencilValue} [stencilClearValue]
     * @param {GPULoadOp} [stencilLoadOp = "clear"]
     * @param {GPUStoreOp} [stencilStoreOp = "store"]
     * @param {boolean} [stencilReadOnly]
     */
    CreateStencilAttachment(stencilClearValue?: any, stencilLoadOp?: any, stencilStoreOp?: any, stencilReadOnly?: boolean | undefined): {
        stencilClearValue: any;
        stencilLoadOp: any;
        stencilStoreOp: any;
        stencilReadOnly: boolean | undefined;
    };
    /**
     * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
     * @param {string} [label]
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment]
     * @param {GPUQuerySet} [occlusionQuerySet]
     * @param {GPURenderPassTimestampWrites} [timestampWrites]
     * @param {GPUSize64} [maxDrawCount]
     */
    CreatePassDescriptor(colorAttachments: GPURenderPassColorAttachment | GPURenderPassColorAttachment[], label?: string | undefined, depthStencilAttachment?: any, occlusionQuerySet?: any, timestampWrites?: any, maxDrawCount?: any): {
        colorAttachments: GPURenderPassColorAttachment[];
        depthStencilAttachment: any;
        occlusionQuerySet: any;
        timestampWrites: any;
        maxDrawCount: any;
        label: string | undefined;
    };
    Descriptor: {
        colorAttachments: GPURenderPassColorAttachment[];
        depthStencilAttachment: any;
        occlusionQuerySet: any;
        timestampWrites: any;
        maxDrawCount: any;
        label: string | undefined;
    } | undefined;
    /**
     * @deprecated Use `Renderer.CreateVertexBufferLayout` instead.
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    CreateVertexBufferAttribute(format: GPUVertexFormat, shaderLocation?: any, offset?: any): {
        format: GPUVertexFormat;
        shaderLocation: any;
        offset: any;
    };
    /**
     * @typedef {string | { name: string; format: GPUVertexFormat }} VertexAttribute
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntryName = "vertex"]
     */
    CreateVertexBufferLayout(attributes: (string | {
        name: string;
        format: GPUVertexFormat;
    }) | (string | {
        name: string;
        format: GPUVertexFormat;
    })[], stepMode?: any, vertexEntryName?: string | undefined): {
        arrayStride: number;
        stepMode: any;
        attributes: {
            format: GPUVertexFormat;
            shaderLocation: any;
            offset: any;
        }[];
    };
    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "vertex"]
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateVertexState(module: GPUShaderModule, entry?: string | undefined, buffers?: GPUVertexBufferLayout | GPUVertexBufferLayout[], constants?: Record<string, GPUPipelineConstantValue> | undefined): {
        module: GPUShaderModule;
        entryPoint: string;
        buffers: any;
        constants: Record<string, GPUPipelineConstantValue> | undefined;
    };
    /**
     * @param {GPUBlendOperation} [operation]
     * @param {GPUBlendFactor} [srcFactor]
     * @param {GPUBlendFactor} [dstFactor]
     */
    CreateBlendComponent(operation?: any, srcFactor?: any, dstFactor?: any): {
        operation: any;
        srcFactor: any;
        dstFactor: any;
    };
    /**
     * @param {GPUTextureFormat} [format]
     * @param {GPUBlendState} [blend]
     * @param {GPUColorWriteFlags} [writeMask]
     */
    CreateTargetState(format?: any, blend?: any, writeMask?: any): {
        format: any;
        blend: any;
        writeMask: any;
    };
    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateFragmentState(module: GPUShaderModule, entry?: string | undefined, targets?: GPUColorTargetState | GPUColorTargetState[], constants?: Record<string, GPUPipelineConstantValue> | undefined): {
        module: GPUShaderModule;
        entryPoint: string;
        targets: any;
        constants: Record<string, GPUPipelineConstantValue> | undefined;
    };
    /**
     * @param {GPUCompareFunction} [compare]
     * @param {GPUStencilOperation} [failOp]
     * @param {GPUStencilOperation} [depthFailOp]
     * @param {GPUStencilOperation} [passOp]
     */
    CreateStencilFaceState(compare?: any, failOp?: any, depthFailOp?: any, passOp?: any): {
        compare: any;
        failOp: any;
        depthFailOp: any;
        passOp: any;
    };
    /**
     * @param {GPUTextureFormat} [format = "depth24plus"]
     * @param {boolean} [depthWriteEnabled = true]
     * @param {GPUCompareFunction} [depthCompare = "less"]
     * @param {GPUStencilFaceState} [stencilFront]
     * @param {GPUStencilFaceState} [stencilBack]
     * @param {GPUStencilValue} [stencilReadMask]
     * @param {GPUStencilValue} [stencilWriteMask]
     * @param {GPUDepthBias} [depthBias]
     * @param {number} [depthBiasSlopeScale]
     * @param {number} [depthBiasClamp]
     */
    CreateDepthStencilState(format?: any, depthWriteEnabled?: boolean | undefined, depthCompare?: any, stencilFront?: any, stencilBack?: any, stencilReadMask?: any, stencilWriteMask?: any, depthBias?: any, depthBiasSlopeScale?: number | undefined, depthBiasClamp?: number | undefined): {
        format: any;
        depthWriteEnabled: boolean;
        depthCompare: any;
        stencilFront: any;
        stencilBack: any;
        stencilReadMask: any;
        stencilWriteMask: any;
        depthBias: any;
        depthBiasSlopeScale: number | undefined;
        depthBiasClamp: number | undefined;
    };
    /**
     * @param {GPUSize32} [count = 4]
     * @param {GPUSampleMask} [mask]
     * @param {boolean} [alphaToCoverageEnabled]
     */
    CreateMultisampleState(count?: any, mask?: any, alphaToCoverageEnabled?: boolean | undefined): {
        count: any;
        mask: any;
        alphaToCoverageEnabled: boolean | undefined;
    };
    /**
     * @typedef {Object} RenderPipelineDescriptor
     * @property {string} [label]
     * @property {GPUShaderModule} [module]
     * @property {GPUVertexState} [vertex]
     * @property {GPUFragmentState} [fragment]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {GPUPrimitiveState} [primitive]
     * @property {GPUDepthStencilState} [depthStencil]
     * @property {GPUMultisampleState} [multisample]
     *
     * @param {RenderPipelineDescriptor | GPUShaderModule} [moduleDescriptor]
     * @param {boolean} [useInCurrentPass]
     */
    CreatePipeline(moduleDescriptor?: {
        label?: string | undefined;
        module?: any;
        vertex?: any;
        fragment?: any;
        layout?: GPUPipelineLayout | GPUAutoLayoutMode;
        primitive?: any;
        depthStencil?: any;
        multisample?: any;
    } | GPUShaderModule, useInCurrentPass?: boolean | undefined): any;
    Pipeline: any;
    /** @override */
    override SavePipelineState(): void;
    /** @override */
    override ResetPipelineState(): void;
    /** @override */
    override RestorePipelineState(): void;
    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    SetVertexBuffers(vertexBuffers: GPUBuffer | GPUBuffer[], offsets?: GPUSize64 | GPUSize64[], sizes?: GPUSize64 | GPUSize64[]): void;
    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers: GPUBuffer | GPUBuffer[], offsets?: GPUSize64 | GPUSize64[], sizes?: GPUSize64 | GPUSize64[]): void;
    /**
     * @param {GPUBuffer} [buffer]
     * @param {GPUIndexFormat} [format = "uint32"]
     * @param {GPUSize64} [offset]
     * @param {GPUSize64} [size]
     */
    SetIndexBuffer(buffer?: any, format?: any, offset?: any, size?: any): void;
    /**
     * @param {number} width
     * @param {number} height
     */
    SetCanvasSize(width: number, height: number): void;
    /**
     * @typedef {GPUSize32[]} DrawParams
     * @memberof DrawParams vertexCount
     * @memberof DrawParams [instanceCount]
     * @memberof DrawParams [firstVertex]
     * @memberof DrawParams [firstInstance]
     *
     * @typedef {GPUSize32[]} IndexedParams
     * @memberof IndexedParams indexCount
     * @memberof IndexedParams [instanceCount]
     * @memberof IndexedParams [firstIndex]
     * @memberof IndexedParams [baseVertex]
     * @memberof IndexedParams [firstInstance]
     *
     * @param {DrawParams | IndexedParams | GPUSize32} params
     * @param {boolean} [submit = true]
     */
    Render(params: GPUSize32[] | GPUSize32[] | GPUSize32, submit?: boolean | undefined): void;
    DestroyCurrentPass(): void;
    Submit(): void;
    Destroy(): void;
    get Canvas(): HTMLCanvasElement;
    get Context(): GPUCanvasContext;
    get CurrentPass(): any;
    get AspectRatio(): number;
    get DepthTexture(): any;
    get CurrentTexture(): any;
    get CurrentTextureView(): any;
    /** @param {GPUTexture | undefined} texture */
    set MultisampleTexture(texture: any);
    get MultisampleTexture(): any;
    /** @param {ColorParam} color */
    set BlendConstant(color: any);
    get BlendConstant(): any;
    get ResolutionBuffer(): GPUBuffer;
    #private;
}
//# sourceMappingURL=RenderPipeline.d.ts.map