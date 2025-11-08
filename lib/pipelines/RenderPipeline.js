// @ts-nocheck

import {
    SetDrawParams,
    GetColorArray,
    GetParamArray,
    GetShaderModule,
    GetGPUColorValue,
    GetVertexFormatSize,
    GetDefaultVertexFormat
} from "#/utils";

import { BasePipeline } from "#/pipelines";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

/**
 * @typedef {[number, number | undefined, number | undefined, number | undefined, GPUSignedOffset32 | undefined]} DrawParams
 * @typedef {Omit<import("./BasePipeline").default & RenderPipeline, "Init">} RenderPipelineInstance
 * @typedef {string | { name: string; format?: GPUVertexFormat }} VertexAttribute
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
 * @exports RenderPipelineInstance, RenderPipelineDescriptor, VertexAttribute, VertexBuffer, DrawParams, IndexBufferParams
 */

export default class RenderPipeline extends BasePipeline
{
    /** @type {number} */ ColorAttachment = 0;
    /** @type {boolean} */ UseTextureView = true;
    /** @type {boolean} */ UseRenderBundles = false;
    /** @type {boolean} */ DestroyPassEncoder = false;

    /** @type {GPURenderBundle[]} */ #RenderBundles = [];
    /** @type {GPUColor} */ #BlendConstant = [0, 0, 0, 0];
    /** @type {GPUTextureView | undefined} */ TextureView;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;

    /** @type {VertexBuffer[]} */ VertexBuffers = [];
    /** @type {IndexBufferParams | undefined} */ IndexBuffer;
    /** @typedef {import("../pipelines/BasePipeline").BufferDescriptor} BufferDescriptor */
    /** @type {DrawParams} */ DrawParams = [0, void 0, void 0, void 0, void 0];

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

    /**
     * @throws Invalid method call warning
     * @param {GPUShaderModule | RenderPipelineDescriptor} [moduleDescriptor]
     * @param {number} [index = 0]
     */
    async Init(moduleDescriptor = {}, index = 0)
    {
        if ((new Error).stack?.split("\n")[2]?.trim().split(" ")[1].split(".")[1] !== "AddPipeline")
            ThrowWarning(ERROR.INVALID_CALL, "method: `RenderPipeline.Init`." );

        this.Index = index;
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
     */
    CreatePrimitiveState(topology = "triangle-list", cullMode = "back", stripIndex, frontFace, unclippedDepth)
    {
        return { topology, stripIndexFormat: stripIndex, frontFace, cullMode, unclippedDepth };
    }

    /**
     * @param {GPUBlendFactor} [srcFactor = "one"]
     * @param {GPUBlendFactor} [dstFactor = "zero"]
     * @param {GPUBlendOperation} [operation = "add"]
     */
    CreateBlendComponent(srcFactor = "one", dstFactor = "zero", operation = "add")
    {
        return { operation, srcFactor, dstFactor };
    }

    /**
     * @param {GPUBlendState} [blend]
     * @param {GPUColorWriteFlags} [writeMask]
     * @param {GPUTextureFormat} [format]
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
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     * @param {string} [entryPoint = "vertex"]
     */
    CreateVertexState(module, buffers, constants, entryPoint = "vertex")
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (GetParamArray(buffers));
        return { module, entryPoint, buffers, constants };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     * @param {string} [entryPoint = "fragment"]
     */
    CreateFragmentState(module, targets, constants, entryPoint = "fragment")
    {
        targets ??= this.CreateColorTargetState();
        targets = /** @type {GPUColorTargetState[]} */ (GetParamArray(targets));
        return { module, entryPoint, targets, constants };
    }

    /**
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    CreateVertexBufferLayout(attributes, stepMode = "vertex", vertexEntry = "vertex")
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
                vertexAttributes.push({ format, shaderLocation: +input.location, offset: arrayStride });

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
    CreateVertexBuffer(dataOrAttributes, descriptor = 1, stepMode = "vertex", vertexEntry = "vertex")
    {
        const countDescriptor = typeof descriptor === "number";
        const label = !countDescriptor && descriptor.label || "Vertex Buffer";
        const usage = USAGE.VERTEX | (!countDescriptor && descriptor.usage || 0);

        if (dataOrAttributes instanceof Float32Array)
            return this.CreateBuffer({ label, size: dataOrAttributes.byteLength, ...descriptor, usage });

        const layout = this.CreateVertexBufferLayout(dataOrAttributes, stepMode, vertexEntry);
        const size = ((countDescriptor && descriptor) || (descriptor.count ?? 1)) * layout.arrayStride;

        return { buffer: this.CreateBuffer({ label, size, ...descriptor, usage }), layout };
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
            || [{ buffer: vertexBuffers, offset: offsets[0], size: sizes[0] }])
        );

        return this.VertexBuffers;
    }

    /**
     * @param {Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | number[]} indices
     * @param {BufferDescriptor} [descriptor]
     */
    CreateIndexBuffer(indices, descriptor)
    {
        const usage = USAGE.INDEX | descriptor?.usage;
        const label = descriptor?.label ?? "Index Buffer";
        indices = (Array.isArray(indices) && new Uint32Array(indices)) || indices;
        return this.CreateBuffer({ label, size: indices.byteLength, ...descriptor, usage });
    }

    /**
     * @param {GPUBuffer | undefined} buffer
     * @param {GPUIndexFormat} [format = "uint32"]
     * @param {GPUSize64} [offset]
     * @param {GPUSize64} [size]
     */
    SetIndexBuffer(buffer, format = "uint32", offset, size)
    {
        return this.IndexBuffer = buffer && { buffer, format, offset, size };
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
        return SetDrawParams(this.DrawParams, ...arguments);
    }

    /**
     * @param {GPURenderBundleEncoder} encoder
     * @description Adds a new render bundle from the current pipeline state.
     */
    EncodeRenderBundle(encoder)
    {
        encoder.setPipeline(this.GPUPipeline);

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
     * @typedef {import("./BasePipeline").BindGroup} BindGroup
     * @param {GPURenderBundleEncoder} encoder
     * @param {string} drawMethod
     * @param {number | (number | undefined)[]} drawParams
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
     * @typedef {import("./BasePipeline").BindGroup} BindGroup
     * @param {GPURenderBundleEncoder} encoder
     * @param {string} drawMethod
     * @param {number | (number | undefined)[]} drawParams
     * @param {VertexBuffer | VertexBuffer[]} [vertexBuffers]
     * @param {IndexBufferParams} [indexBuffer]
     * @param {BindGroup | BindGroup[]} [bindGroups]
     */
    AddRenderBundle(encoder, drawMethod, drawParams, vertexBuffers, indexBuffer, bindGroups)
    {
        encoder.setPipeline(this.GPUPipeline);

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

        encoder[drawMethod](...drawParams);

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

    /** @param {import("../utils/Color").ColorParam | number} color */
    set BlendConstant(color)
    {
        this.#BlendConstant = typeof color === "number" && GetColorArray(color) || GetGPUColorValue(color);
    }

    get BlendConstant()
    {
        return this.#BlendConstant;
    }

    /** @returns {"draw" | "drawIndexed"} */
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
