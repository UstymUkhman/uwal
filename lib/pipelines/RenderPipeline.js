let ID = 0;

import { BasePipeline } from "#/pipelines";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { SetDrawParams, GetColorArray, GetParamArray, GetShaderModule, GetGPUColorValue } from "#/utils";

/**
 * @typedef {[number, number | undefined, number | undefined, number | undefined, number | undefined]} DrawParams
 * @typedef {Omit<import("./BasePipeline").default & RenderPipeline, "Init">} RenderPipelineInstance
 * @typedef {{ name: string; format?: GPUVertexFormat } | string} VertexAttribute
 *
 * @typedef {import("./BasePipeline").BasePipelineDescriptor & {
 *   vertex?: GPUVertexState;
 *   fragment?: GPUFragmentState;
 *   primitive?: GPUPrimitiveState;
 *   depthStencil?: GPUDepthStencilState;
 *   multisample?: GPUMultisampleState;
 * }} RenderPipelineDescriptor
 *
 * @typedef {Object} VertexBuffer
 * @property {GPUBuffer} buffer
 * @property {GPUSize64} [offset]
 * @property {GPUSize64} [size]
 *
 * @typedef {Object} IndexBufferParams
 * @property {GPUBuffer} buffer
 * @property {GPUIndexFormat} format
 * @property {GPUSize64} [offset]
 * @property {GPUSize64} [size]
 *
 * @exports DrawParams, RenderPipelineInstance, VertexAttribute
 * @exports RenderPipelineDescriptor, VertexBuffer, IndexBufferParams
 */

export default class RenderPipeline extends BasePipeline
{
    /** @type {number} */ ColorAttachment = 0;
    /** @type {boolean} */ #Transparent = false;
    /** @type {boolean} */ UseTextureView = true;

    /** @type {boolean} */ UseRenderBundles = false;
    /** @type {VertexBuffer[]} */ VertexBuffers = [];
    /** @type {boolean} */ DestroyPassEncoder = false;

    /** @type {GPURenderBundle[]} */ #RenderBundles = [];
    /** @type {GPUColor} */ #BlendConstant = [0, 0, 0, 0];
    /** @type {GPUTextureView | undefined} */ TextureView;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {IndexBufferParams | undefined} */ IndexBuffer;

    /**
     * @typedef {import("./BasePipeline").BindGroup} BindGroup
     * @typedef {import("../utils/Color").ColorParam} ColorParam
     * @typedef {import("./BasePipeline").BufferDescriptor} BufferDescriptor
     * @typedef {BufferDescriptor & { count?: number }} VertexBufferDescriptor
     * @typedef {{ buffer: GPUBuffer, layout: GPUVertexBufferLayout }} VertexBufferLayout
     */

    /** @type {DrawParams} */ DrawParams = [0, void 0, void 0, void 0, void 0];

    /**
     * @param {GPUDevice} device
     * @param {GPUTextureFormat} format
     * @param {string} [name = ""]
     */
    constructor(device, format, name = "")
    {
        super(ID++, device, "Render", name);
        this.#PreferredCanvasFormat = format;
    }

    /** @param {GPUVertexFormat} [format] */
    #GetVertexFormatSize(format)
    {
        switch (format)
        {
            case "uint8x2":
            case "sint8x2":
            case "unorm8x2":
            case "snorm8x2":
                return 2;

            case "uint32":
            case "sint32":
            case "float32":
            case "uint8x4":
            case "sint8x4":
            case "unorm8x4":
            case "snorm8x4":
            case "uint16x2":
            case "sint16x2":
            case "unorm16x2":
            case "snorm16x2":
            case "float16x2":
                return 4;

            case "uint16x4":
            case "sint16x4":
            case "uint32x2":
            case "sint32x2":
            case "unorm16x4":
            case "snorm16x4":
            case "float16x4":
            case "float32x2":
                return 8;

            case "uint32x3":
            case "sint32x3":
            case "float32x3":
                return 12;

            case "uint32x4":
            case "sint32x4":
            case "float32x4":
                return 16;
        }

        return 0;
    }

    /** @param {number} size */
    #GetDefaultVertexFormat(size)
    {
        switch (size)
        {
            case 2:
                return "unorm8x2";

            case 4:
                return "float32";

            case 8:
                return "float32x2";

            case 12:
                return "float32x3";

            case 16:
                return "float32x4";
        }

        return "";
    }

    /**
     * @throws Invalid method call warning
     * @param {GPUShaderModule | RenderPipelineDescriptor} [moduleDescriptor]
     */
    async Init(moduleDescriptor = {})
    {
        if ((new Error).stack?.split("\n")[2]?.trim().split(" ")[1].split(".")[1] !== "AddPipeline")
            ThrowWarning(ERROR.INVALID_CALL, "method: `RenderPipeline.Init`." );

        let module = GetShaderModule(moduleDescriptor);
        let { vertex, fragment } = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor);

        !module && !vertex && (module = this.CreateShaderModule());

        if (module)
        {
            vertex ??= this.CreateVertexState(module);
            fragment ??= this.CreateFragmentState(module);
        }

        const label = moduleDescriptor.label ?? /*@__INLINE__*/ this.CreatePipelineLabel("Render Pipeline");
        const layout = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";
        vertex = /** @type {GPUVertexState} */ (vertex);

        return this.GPUPipeline = await this.Device.createRenderPipelineAsync({
            label, layout, vertex, fragment, ...moduleDescriptor
        });
    }

    /**
     * @param {GPUPrimitiveTopology} [topology = "triangle-list"]
     * @param {GPUCullMode} [cullMode = "back"]
     * @param {GPUIndexFormat} [stripIndex]
     * @param {GPUFrontFace} [frontFace]
     * @param {boolean} [unclippedDepth]
     * @returns {GPUPrimitiveState}
     */
    CreatePrimitiveState(topology = "triangle-list", cullMode = "back", stripIndex, frontFace, unclippedDepth)
    {
        return { topology, stripIndexFormat: stripIndex, frontFace, cullMode, unclippedDepth };
    }

    /**
     * @param {GPUBlendFactor} [srcFactor = "one"]
     * @param {GPUBlendFactor} [dstFactor = "zero"]
     * @param {GPUBlendOperation} [operation = "add"]
     * @returns {GPUBlendComponent}
     */
    CreateBlendComponent(srcFactor = "one", dstFactor = "zero", operation = "add")
    {
        return { operation, srcFactor, dstFactor };
    }

    /**
     * @param {GPUBlendState} [blend]
     * @param {GPUColorWriteFlags} [writeMask]
     * @param {GPUTextureFormat} [format]
     * @returns {GPUColorTargetState}
     */
    CreateColorTargetState(blend, writeMask, format = this.#PreferredCanvasFormat)
    {
        blend &&= { color: blend.color ?? {}, alpha: blend.alpha ?? {} };
        return { format, blend, writeMask };
    }

    /**
     * @param {GPUSize32} [count = 4]
     * @param {GPUSampleMask} [mask]
     * @param {boolean} [alphaToCoverageEnabled]
     * @returns {GPUMultisampleState}
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
     * @returns {GPUStencilFaceState}
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
     * @returns {GPUDepthStencilState}
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
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {string} [entryPoint = "vertex"]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     * @returns {GPUVertexState}
     */
    CreateVertexState(module, buffers, entryPoint = "vertex", constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (GetParamArray(buffers));
        return { module, entryPoint, constants, buffers };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {string} [entryPoint = "fragment"]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     * @returns {GPUFragmentState}
     */
    CreateFragmentState(module, targets, entryPoint = "fragment", constants)
    {
        targets ??= this.CreateColorTargetState();
        targets = /** @type {GPUColorTargetState[]} */ (GetParamArray(targets));
        this.#Transparent = targets.findIndex(({ blend }) => blend && Object.keys(blend).length) > -1;
        return { module, entryPoint, constants, targets };
    }

    /**
     * @typedef {(GPUVertexAttribute & { size: number })[]} VertexAttributes
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {string} [vertexEntry = "vertex"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @returns {GPUVertexBufferLayout & { attributes: VertexAttributes }}
     */
    CreateVertexBufferLayout(attributes, vertexEntry = "vertex", stepMode = "vertex")
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`RenderPipeline.CreateVertexBufferLayout\`.
            Call \`RenderPipeline.CreateShaderModule\` before creating a vertex layout or vertex buffer.`
        );

        const { entry: { vertex } } = /** @type {import("wgsl_reflect").WgslReflect} */ (this.Reflect);
        const entry = vertex.find(({ name }) => vertexEntry === name);

        !entry && ThrowError(ERROR.VERTEX_ENTRY_NOT_FOUND, `\`${vertexEntry}\` in vertex shader entries.`);
        attributes = /** @type {VertexAttribute[]} */ (GetParamArray(attributes));

        let vertexAttributes = [], arrayStride = 0;

        for (let a = 0, l = attributes.length; a < l; ++a)
        {
            const attribute = attributes[a];
            const string = typeof attribute === "string";
            const attributeName = string ? attribute : attribute.name;

            const input = /** @type {import("wgsl_reflect").FunctionInfo} */
                (entry).inputs.find(({ name }) => attributeName === name);

            if (input)
            {
                const format = /** @type {GPUVertexFormat} */ (
                    string && this.#GetDefaultVertexFormat(input.type?.size || 0) ||
                    /** @type {{ name: string; format?: GPUVertexFormat }} */ (attribute).format
                );

                const size = format.at(-2) === "x" && +(format.at(-1) ?? 0) || 4;

                vertexAttributes.push({ format, size, shaderLocation: +input.location, offset: arrayStride });

                arrayStride += this.#GetVertexFormatSize(format);

                continue;
            }

            ThrowWarning(ERROR.VERTEX_ATTRIBUTE_NOT_FOUND, `\`${attributeName}\` in vertex shader inputs.`);
        }

        return { arrayStride, stepMode, attributes: vertexAttributes };
    }

    /**
     * @template {Float32Array | VertexAttribute | VertexAttribute[]} DataOrAttributes
     * @param {DataOrAttributes} dataOrAttributes
     * @param {VertexBufferDescriptor | number} [descriptor = 1]
     * @param {string} [vertexEntry = "vertex"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @returns {DataOrAttributes extends Float32Array ? GPUBuffer : VertexBufferLayout}
     */
    CreateVertexBuffer(dataOrAttributes, descriptor = 1, vertexEntry = "vertex", stepMode = "vertex")
    {
        const countDescriptor = typeof descriptor === "number";
        const label = !countDescriptor && descriptor.label || "Vertex Buffer";
        const usage = USAGE.VERTEX | (!countDescriptor && descriptor.usage || 0);
        const bufferDescriptor = /** @type {VertexBufferDescriptor} */ (descriptor);

        if (dataOrAttributes instanceof Float32Array) return /** @type {any} */ (this.CreateBuffer({
            label, size: dataOrAttributes.byteLength, ...bufferDescriptor, usage
        }));

        const layout = this.CreateVertexBufferLayout(dataOrAttributes, vertexEntry, stepMode);
        const size = ((countDescriptor && descriptor) || (bufferDescriptor.count ?? 1)) * layout.arrayStride;

        return /** @type {any} */ ({ buffer: this.CreateBuffer({ label, size, ...bufferDescriptor, usage }), layout });
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

        return this.VertexBuffers = /** @type {VertexBuffer[]} */ (Array.isArray(vertexBuffers)
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

        this.VertexBuffers.push(...(Array.isArray(vertexBuffers)
            && vertexBuffers.map((buffer, b) => ({ buffer, offset: offsets[b], size: sizes[b] }))
            || [{ buffer: /** @type {GPUBuffer} */ (vertexBuffers), offset: offsets[0], size: sizes[0] }])
        );

        return this.VertexBuffers;
    }

    /**
     * @typedef {Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array} UintArray
     * @param {UintArray | number[]} indices
     * @param {BufferDescriptor} [descriptor]
     */
    CreateIndexBuffer(indices, descriptor)
    {
        const label = descriptor?.label ?? "Index Buffer";
        const usage = USAGE.INDEX | (descriptor?.usage || 0);
        indices = (Array.isArray(indices) && new Uint32Array(indices)) || indices;
        return this.CreateBuffer({ label, size: /** @type {UintArray} */ (indices).byteLength, ...descriptor, usage });
    }

    /**
     * @param {GPUBuffer | undefined} buffer
     * @param {GPUIndexFormat} [format = "uint32"]
     * @param {GPUSize64} [offset]
     * @param {GPUSize64} [size]
     */
    SetIndexBuffer(buffer, format = "uint32", offset, size)
    {
        return this.IndexBuffer = buffer && /** @type {IndexBufferParams} */ ({ buffer, format, offset, size });
    }

    /** @param {GPURenderPassEncoder} renderPass */
    UseRenderBuffers(renderPass)
    {
        for (let v = 0, l = this.VertexBuffers.length; v < l; ++v)
        {
            const { buffer, offset, size } = this.VertexBuffers[v];
            renderPass.setVertexBuffer(v, buffer, offset, size);
        }

        this.IndexBuffer && renderPass.setIndexBuffer(
            this.IndexBuffer.buffer,
            this.IndexBuffer.format,
            this.IndexBuffer.offset,
            this.IndexBuffer.size
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
        return /*@__INLINE__*/ SetDrawParams(this.DrawParams, count, instanceCount, first, firstInstance, baseVertex);
    }

    /**
     * @param {GPURenderBundleEncoder} encoder
     * @description Adds a new render bundle from the current pipeline state.
     */
    EncodeRenderBundle(encoder)
    {
        encoder.setPipeline(/** @type {GPURenderPipeline} */ (this.GPUPipeline));

        for (let v = 0, l = this.VertexBuffers.length; v < l; ++v)
        {
            const { buffer, offset, size } = this.VertexBuffers[v];
            encoder.setVertexBuffer(v, buffer, offset, size);
        }

        this.IndexBuffer && encoder.setIndexBuffer(
            this.IndexBuffer.buffer,
            this.IndexBuffer.format,
            this.IndexBuffer.offset,
            this.IndexBuffer.size
        );

        for (let g = 0, a = 0, l = this.BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.BindGroups[g];
            active && encoder.setBindGroup(a++, bindGroup, dynamicOffsets);
        }

        encoder[this.DrawMethod](...this.DrawParams);

        this.#RenderBundles.push(encoder.finish());
        this.UseRenderBundles = true;
    }

    /**
     * @param {GPURenderBundleEncoder} encoder
     * @param {"draw" | "drawIndexed"} drawMethod
     * @param {number | DrawParams} drawParams
     * @param {VertexBuffer | VertexBuffer[]} [vertexBuffers]
     * @param {IndexBufferParams} [indexBuffer]
     * @param {BindGroup | BindGroup[]} [bindGroups]
     */
    SetRenderBundle(encoder, drawMethod, drawParams, vertexBuffers, indexBuffer, bindGroups)
    {
        this.#RenderBundles.splice(0);
        this.AddRenderBundle(encoder, drawMethod, drawParams, vertexBuffers, indexBuffer, bindGroups);
    }

    /**
     * @param {GPURenderBundleEncoder} encoder
     * @param {"draw" | "drawIndexed"} drawMethod
     * @param {number | DrawParams} drawParams
     * @param {VertexBuffer | VertexBuffer[]} [vertexBuffers]
     * @param {IndexBufferParams} [indexBuffer]
     * @param {BindGroup | BindGroup[]} [bindGroups]
     */
    AddRenderBundle(encoder, drawMethod, drawParams, vertexBuffers, indexBuffer, bindGroups)
    {
        encoder.setPipeline(/** @type {GPURenderPipeline} */ (this.GPUPipeline));

        if (vertexBuffers)
        {
            vertexBuffers = /** @type {VertexBuffer[]} */ (GetParamArray(vertexBuffers));

            for (let v = 0, l = vertexBuffers.length; v < l; ++v)
            {
                const { buffer, offset, size } = vertexBuffers[v];
                encoder.setVertexBuffer(v, buffer, offset, size);
            }
        }

        indexBuffer && encoder.setIndexBuffer(
            indexBuffer.buffer,
            indexBuffer.format,
            indexBuffer.offset,
            indexBuffer.size
        );

        if (bindGroups)
        {
            bindGroups = /** @type {BindGroup[]} */ (GetParamArray(bindGroups));

            for (let g = 0, a = 0, l = bindGroups.length; g < l; ++g)
            {
                const { bindGroup, dynamicOffsets, active } = bindGroups[g];
                active && encoder.setBindGroup(a++, bindGroup, dynamicOffsets);
            }
        }

        encoder[drawMethod](.../** @type {DrawParams} */ (GetParamArray(drawParams)));

        this.#RenderBundles.push(encoder.finish());
        this.UseRenderBundles = true;
    }

    /** @param {GPURenderPassEncoder} renderPass */
    ExecuteRenderBundles(renderPass)
    {
        renderPass.executeBundles(this.#RenderBundles);
    }

    ClearRenderBundles()
    {
        this.UseRenderBundles = false;
        this.#RenderBundles.splice(0);
    }

    /** @param {ColorParam | number} color */
    set BlendConstant(color)
    {
        this.#BlendConstant = typeof color === "number" && GetColorArray(color) ||
            GetGPUColorValue(/** @type {ColorParam} */ (color));
    }

    /** @returns {GPUColor} */
    get BlendConstant()
    {
        return this.#BlendConstant;
    }

    get Transparent()
    {
        return this.#Transparent;
    }

    get DrawMethod()
    {
        return this.IndexBuffer && "drawIndexed" || "draw";
    }

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.ColorAttachment = 0;
        this.TextureView = undefined;
        this.DestroyPassEncoder = false;
        this.#BlendConstant = [0, 0, 0, 0];

        this.VertexBuffers.forEach(({ buffer }) => buffer.destroy());
        this.IndexBuffer?.buffer.destroy();
        this.VertexBuffers.splice(0);
        this.ClearRenderBundles();
    }
}
