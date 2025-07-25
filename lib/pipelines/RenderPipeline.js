import { ERROR, ThrowError } from "#/Errors";
import { USAGE, BasePipeline } from "#/pipelines";
import { GetShaderModule, GetParamArray, GetDefaultVertexFormat, GetVertexFormatSize, GetGPUColorValue } from "#/utils";

/**
 * @typedef {Omit<import("./BasePipeline").default & RenderPipeline, "Init">} RenderPipeline
 *
 * @typedef {import("./BasePipeline").BasePipelineDescriptor & {
 *   vertex?: GPUVertexState;
 *   fragment?: GPUFragmentState;
 *   primitive?: GPUPrimitiveState;
 *   depthStencil?: GPUDepthStencilState;
 *   multisample?: GPUMultisampleState;
 * }} RenderPipelineDescriptor
 *
 * @exports RenderPipeline, RenderPipelineDescriptor
 */

export default class RenderPipeline extends BasePipeline
{
    /** @type {boolean} */ DestroyPassEncoder = false;
    /** @type {VertexBuffer[]} */ #VertexBuffers = [];
    /** @type {IndexBufferParams | undefined} */ #IndexBuffer;

    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPUTextureView | undefined} */ TextureView;
    /** @type {GPUColor} */ #BlendConstant = [0, 0, 0, 0];

    /** @typedef {import("../pipelines/BasePipeline").BufferDescriptor} BufferDescriptor */
    /** @type {(number | undefined)[]} */ #DrawParams = [0, void 0, void 0, void 0, void 0];

    /**
     * @param {GPUDevice} device
     * @param {GPUTextureFormat} format
     * @param {string} [name = ""]
     */
    constructor(device, format, name)
    {
        super(device, "Render", name);
        this.#PreferredCanvasFormat = format;
    }

    /** @param {GPUShaderModule | RenderPipelineDescriptor} [moduleDescriptor] */
    async Init(moduleDescriptor = {})
    {
        let module = GetShaderModule(moduleDescriptor);
        let { vertex, fragment } = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor);

        !module && !vertex && (module = this.CreateShaderModule());

        if (module)
        {
            vertex ??= this.CreateVertexState(module);
            fragment ??= this.CreateFragmentState(module);
        }

        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Render Pipeline");
        const layout = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";

        return this.GPUPipeline = await this.Device.createRenderPipelineAsync({
            label, layout, vertex, fragment, ...moduleDescriptor
        });
    }

    /**
     * @param {GPUBlendOperation} [operation = "add"]
     * @param {GPUBlendFactor} [srcFactor = "one"]
     * @param {GPUBlendFactor} [dstFactor = "zero"]
     */
    CreateBlendComponent(operation = "add", srcFactor = "one", dstFactor = "zero")
    {
        return { operation, srcFactor, dstFactor };
    }

    /**
     * @param {GPUTextureFormat} [format]
     * @param {GPUBlendState} [blend]
     * @param {GPUColorWriteFlags} [writeMask]
     */
    CreateColorTargetState(format = this.#PreferredCanvasFormat, blend, writeMask)
    {
        blend &&= { color: blend.color ?? {}, alpha: blend.alpha ?? {} };
        return { format, blend, writeMask };
    }

    /**
     * @param {GPUSize32} [count = 4]
     * @param {GPUSampleMask} [mask]
     * @param {boolean} [alphaToCoverageEnabled]
     */
    CreateMultisampleState(count = 4, mask, alphaToCoverageEnabled)
    {
        return { count, mask, alphaToCoverageEnabled };
    }

    /**
     * @param {GPUCompareFunction} [compare]
     * @param {GPUStencilOperation} [failOp]
     * @param {GPUStencilOperation} [depthFailOp]
     * @param {GPUStencilOperation} [passOp]
     */
    CreateStencilFaceState(compare, failOp, depthFailOp, passOp)
    {
        return { compare, failOp, depthFailOp, passOp };
    }

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
    CreateDepthStencilState(
        format = "depth24plus",
        depthWriteEnabled = true,
        depthCompare = "less",
        stencilFront,
        stencilBack,
        stencilReadMask,
        stencilWriteMask,
        depthBias,
        depthBiasSlopeScale,
        depthBiasClamp
    ) {
        return {
            format,
            depthWriteEnabled,
            depthCompare,
            stencilFront,
            stencilBack,
            stencilReadMask,
            stencilWriteMask,
            depthBias,
            depthBiasSlopeScale,
            depthBiasClamp
        };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entryPoint = "vertex"]
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateVertexState(module, entryPoint = "vertex", buffers, constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (GetParamArray(buffers));
        return { module, entryPoint, buffers, constants };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entryPoint = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateFragmentState(module, entryPoint = "fragment", targets, constants)
    {
        targets ??= this.CreateColorTargetState();
        targets = /** @type {GPUColorTargetState[]} */ (GetParamArray(targets));
        return { module, entryPoint, targets, constants };
    }

    /**
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    /*#__INLINE__*/ #CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return { format, shaderLocation, offset };
    }

    /**
     * @typedef {string | { name: string; format?: GPUVertexFormat }} VertexAttribute
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    CreateVertexBufferLayout(attributes, stepMode, vertexEntry = "vertex")
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`RenderPipeline.CreateVertexBufferLayout\`.
            Call \`RenderPipeline.CreateShaderModule\` before creating a vertex layout or vertex buffer.`
        );

        const { entry: { vertex } } = this.Reflect;
        const entry = vertex.find(({ name }) => vertexEntry === name);

        !entry && ThrowError(ERROR.VERTEX_ENTRY_NOT_FOUND, `\`${vertexEntry}\` in vertex shader entries.`);
        attributes = /** @type {VertexAttribute[]} */ (GetParamArray(attributes));

        let vertexAttributes = [], arrayStride = 0;

        for (let a = 0, l = attributes.length; a < l; ++a)
        {
            const attribute = attributes[a];
            const string = typeof attribute === "string";
            const attributeName = string ? attribute : attribute.name;
            const input = entry.inputs.find(({ name }) => attributeName === name);

            if (input)
            {
                const format = string ? GetDefaultVertexFormat(input.type.size) : attribute.format;
                vertexAttributes.push(this.#CreateVertexBufferAttribute(format, +input.location, arrayStride));

                arrayStride += GetVertexFormatSize(format);
                continue;
            }

            ThrowWarning(ERROR.VERTEX_ATTRIBUTE_NOT_FOUND, `\`${attributeName}\` in vertex shader inputs.`);
        }

        return { arrayStride, stepMode, attributes: vertexAttributes };
    }

    /**
     * @template {Float32Array | VertexAttribute | VertexAttribute[]} DataOrAttributes
     * @param {DataOrAttributes} dataOrAttributes
     * @param {(BufferDescriptor & { count?: number }) | number} [descriptor]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     * @returns {DataOrAttributes extends Float32Array ? GPUBuffer : { buffer: GPUBuffer, layout: GPUVertexBufferLayout }}
    */
    CreateVertexBuffer(dataOrAttributes, descriptor = 1, stepMode, vertexEntry = "vertex")
    {
        const label = descriptor.label ?? "Vertex Buffer";

        if (dataOrAttributes instanceof Float32Array)
            return this.CreateBuffer({ label, size: dataOrAttributes.byteLength, usage: USAGE.VERTEX, ...descriptor });

        const layout = this.CreateVertexBufferLayout(dataOrAttributes, stepMode, vertexEntry);
        const size = ((typeof descriptor === "number" && descriptor) || (descriptor.count ?? 1)) * layout.arrayStride;

        return { buffer: this.CreateBuffer({ label, size, usage: USAGE.VERTEX, ...descriptor }), layout };
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    SetVertexBuffers(vertexBuffers, offsets, sizes)
    {
        sizes = /** @type {GPUSize64[]} */ (GetParamArray(sizes));
        offsets = /** @type {GPUSize64[]} */ (GetParamArray(offsets));

        this.#VertexBuffers = /** @type {VertexBuffer[]} */ (Array.isArray(vertexBuffers)
            && vertexBuffers.map((buffer, b) => ({ buffer, offset: offsets[b], size: sizes[b] }))
            || [{ buffer: vertexBuffers, offset: offsets[0], size: sizes[0] }]
        );
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers, offsets, sizes)
    {
        sizes = /** @type {GPUSize64[]} */ (GetParamArray(sizes));
        offsets = /** @type {GPUSize64[]} */ (GetParamArray(offsets));

        return this.#VertexBuffers.push(...(Array.isArray(vertexBuffers)
            && vertexBuffers.map((buffer, b) => ({ buffer, offset: offsets[b], size: sizes[b] }))
            || [{ buffer: vertexBuffers, offset: offsets[0], size: sizes[0] }])
        );
    }

    /**
     * @param {Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | number[]} indices
     * @param {BufferDescriptor} [descriptor]
     */
    CreateIndexBuffer(indices, descriptor)
    {
        const label = descriptor?.label ?? "Index Buffer";
        indices = (Array.isArray(indices) && new Uint32Array(indices)) || indices;
        return this.CreateBuffer({ label, size: indices.byteLength, usage: USAGE.INDEX, ...descriptor });
    }

    /**
     * @param {GPUBuffer} [buffer]
     * @param {GPUIndexFormat} [format = "uint32"]
     * @param {GPUSize64} [offset]
     * @param {GPUSize64} [size]
     */
    SetIndexBuffer(buffer, format = "uint32", offset, size)
    {
        this.#IndexBuffer = buffer && { buffer, format, offset, size };
    }

    /** @param {GPURenderPassEncoder} renderPass */
    UseRenderBuffers(renderPass)
    {
        for (let v = 0, l = this.#VertexBuffers.length; v < l; ++v)
        {
            const { buffer, offset, size } = this.#VertexBuffers[v];
            renderPass.setVertexBuffer(v, buffer, offset, size);
        }

        this.#IndexBuffer && renderPass.setIndexBuffer(
            this.#IndexBuffer.buffer,
            this.#IndexBuffer.format,
            this.#IndexBuffer.offset,
            this.#IndexBuffer.size
        );
    }

    /**
     * @param {GPUSize32} count
     * @param {GPUSize32} [instanceCount]
     * @param {GPUSize32} [first]
     * @param {GPUSize32} [firstInstance]
     * @param {GPUSignedOffset32} [baseVertex]
     */
    SetDrawParams(count, instanceCount, first, firstInstance, baseVertex)
    {
        this.#DrawParams[0] = count;
        this.#DrawParams[1] = instanceCount;
        this.#DrawParams[2] = first;
        this.#DrawParams[3] = firstInstance;
        this.#DrawParams[4] = baseVertex;

        if (baseVertex !== undefined)
        {
            this.#DrawParams[3] = baseVertex;
            this.#DrawParams[4] = firstInstance;
        }
    }

    /**
     * @readonly
     * @const {number}
     * @description Pipeline's `TextureView` color attachment index.
     * @returns {0}
     * @default 0
     */
    get ColorAttachment() { return 0; }

    /** @param {import("../Color").ColorParam} color */
    set BlendConstant(color)
    {
        this.#BlendConstant = GetGPUColorValue(color);
    }

    get BlendConstant()
    {
        return this.#BlendConstant;
    }

    get DrawMethod()
    {
        return this.#IndexBuffer && 'drawIndexed' || 'draw';
    }

    get DrawParams()
    {
        return this.#DrawParams;
    }

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.DestroyPassEncoder = false;
        this.#BlendConstant = [0, 0, 0, 0];

        this.#VertexBuffers.forEach(({ buffer }) => buffer.destroy());
        this.#IndexBuffer?.buffer.destroy();
        this.#VertexBuffers.splice(0);
    }
}
