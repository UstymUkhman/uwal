import Color from "@/Color";
import { Texture } from "@/textures";
import { USAGE, BasePipeline } from "@/pipelines";
import { ERROR, ThrowError, ThrowWarning } from "@/Errors";
import { GetDefaultVertexFormat, GetVertexFormatSize } from "@/utils";

export default class RenderPipeline extends BasePipeline
{
    /**
     * @typedef {Object} VertexBuffer
     * @property {GPUBuffer} buffer
     * @property {GPUSize64} [offset]
     * @property {GPUSize64} [size]
     */

    /**
     * @typedef {Object} IndexBufferParams
     * @property {GPUBuffer} buffer
     * @property {GPUIndexFormat} format
     * @property {GPUSize64} offset
     * @property {GPUSize64} size
     */

    /** @type {(
        count: GPUSize32,
        instanceCount?: GPUSize32,
        first?: GPUSize32,
        firstInstanceOrBaseVertex?: GPUSize32,
        firstInstance?: GPUSize32
    ) => void} */ #CurrentPassDraw;

    #UseCurrentTextureView = false;
    #Resolution = new Float32Array(2);
    #UseDepthStencilAttachment = false;

    /** @type {HTMLCanvasElement} */ #Canvas;
    /** @type {GPUCanvasContext} */ #Context;

    /** @type {GPUBuffer} */ #ResolutionBuffer;
    /** @type {Texture | undefined} */ #Texture;
    /** @type {GPUTexture | undefined} */ #DepthTexture;
    /** @type {GPUTexture | undefined} */ #MultisampleTexture;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /** @type {IndexBufferParams | undefined} */ #IndexBuffer;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPUColor} */ #BlendConstant = [0, 0, 0, 0];
    /** @type {VertexBuffer[]} */ #VertexBuffers = [];

    /** @type {VertexBuffer[]} */ #PrevVertexBuffers;
    /** @type {boolean} */ #PrevUseCurrentTextureView;
    /** @type {boolean} */ #PrevUseDepthStencilAttachment;
    /** @type {GPUColor} */ #PrevBlendConstant = [0, 0, 0, 0];
    /** @type {GPUTexture | undefined} */ #PrevMultisampleTexture;
    /** @type {IndexBufferParams | IndexBufferParamsValues} */ #PrevIndexBuffer;
    /** @typedef {[GPUBuffer, GPUIndexFormat, GPUSize64, GPUSize64]} IndexBufferParamsValues */

    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     * @param {HTMLCanvasElement} [canvas]
     * @param {import("../UWAL").ConfigurationOptions} [options = {}]
     */
    constructor(device, programName, canvas, options)
    {
        super(device, programName, "Render");
        !canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const context = canvas.getContext("webgpu");
        !context && ThrowError(ERROR.CONTEXT_NOT_FOUND);

        context.configure(/** @type {GPUCanvasConfiguration} */ ({ device, ...options }));

        this.#ResolutionBuffer = this.CreateBuffer(
        {
            size: this.#Resolution.length * Float32Array.BYTES_PER_ELEMENT,
            label: "Render Pipeline Resolution Buffer",
            usage: USAGE.UNIFORM
        });

        this.#Canvas = canvas;
        this.#Context = context;

        this.#UpdateCanvasResolution();
        this.#PreferredCanvasFormat = options.format;
        this.CreatePassDescriptor(this.CreateColorAttachment());
    }

    /** @param {import("../UWAL").ConfigurationOptions} options */
    ConfigureContext(options)
    {
        const format = options.format ?? this.#PreferredCanvasFormat;
        this.#Context.configure({ device: this.Device, format, ...options });
    }

    #UpdateCanvasResolution()
    {
        this.#Resolution.set([this.#Canvas.width, this.#Canvas.height]);
        this.WriteBuffer(this.#ResolutionBuffer, this.#Resolution);
    }

    /** @param {import("../Color").ColorParam} color */
    #GetGPUColorValue(color)
    {
        return color instanceof Color ? color.rgba : color;
    }

    /**
     * @todo Set `clearColor` as the first parameter in version `0.1.0`.
     *
     * @param {GPUTextureView} [view]
     * @param {GPULoadOp} [loadOp = "clear"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {import("../Color").ColorParam} [clearColor]
     * @param {GPUTextureView} [resolveTarget]
     * @param {GPUIntegerCoordinate} [depthSlice]
     */
    CreateColorAttachment(view, loadOp = "clear", storeOp = "store", clearColor, resolveTarget, depthSlice)
    {
        const clearValue = clearColor && this.#GetGPUColorValue(clearColor);
        return { view, loadOp, storeOp, clearValue, resolveTarget, depthSlice };
    }

    /**
     * @param {GPUTextureView} [view]
     * @param {number} [depthClearValue = 1]
     * @param {GPULoadOp} [depthLoadOp = "clear"]
     * @param {GPUStoreOp} [depthStoreOp = "store"]
     * @param {boolean} [depthReadOnly]
     */
    CreateDepthAttachment(view, depthClearValue = 1, depthLoadOp = "clear", depthStoreOp = "store", depthReadOnly)
    {
        this.#UseDepthStencilAttachment = true;
        this.#Texture = new Texture(this.Device);
        return { view, depthClearValue, depthLoadOp, depthStoreOp, depthReadOnly };
    }

    /**
     * @param {GPUStencilValue} [stencilClearValue]
     * @param {GPULoadOp} [stencilLoadOp = "clear"]
     * @param {GPUStoreOp} [stencilStoreOp = "store"]
     * @param {boolean} [stencilReadOnly]
     */
    CreateStencilAttachment(stencilClearValue, stencilLoadOp = "clear", stencilStoreOp = "store", stencilReadOnly)
    {
        return { stencilClearValue, stencilLoadOp, stencilStoreOp, stencilReadOnly };
    }

    /**
     * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
     * @param {string} [label]
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment]
     * @param {GPUQuerySet} [occlusionQuerySet]
     * @param {GPURenderPassTimestampWrites} [timestampWrites]
     * @param {GPUSize64} [maxDrawCount]
     */
    CreatePassDescriptor(
        colorAttachments, label, depthStencilAttachment, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        const attachments = (
            /** @type {GPURenderPassColorAttachment[]} */
            (Array.isArray(colorAttachments) && colorAttachments || [colorAttachments])
        );

        this.#UseCurrentTextureView = !attachments.some(({ view }) => !!view);

        label ??= this.CreatePipelineLabel("Render Pass");

        return this.Descriptor =
        {
            colorAttachments: attachments,
            depthStencilAttachment,
            occlusionQuerySet,
            timestampWrites,
            maxDrawCount,
            label
        };
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
     * @deprecated Use `Renderer.CreateVertexBufferLayout` instead.
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return this.#CreateVertexBufferAttribute(format, shaderLocation, offset);
    }

    /**
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    #CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return { format, shaderLocation, offset };
    }

    /**
     * @typedef {string | { name: string; format: GPUVertexFormat }} VertexAttribute
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    CreateVertexBufferLayout(attributes, stepMode, vertexEntry = "vertex")
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`Renderer.CreateVertexBufferLayout\`.
            Call \`Renderer.CreateShaderModule\` before creating a vertex layout or vertex buffer.`
        );

        const { entry: { vertex } } = this.Reflect;
        const entry = vertex.find(({ name }) => vertexEntry === name);

        !entry && ThrowError(ERROR.VERTEX_ENTRY_NOT_FOUND, `\`${vertexEntry}\` in vertex shader entries.`);
        attributes = /** @type {VertexAttribute[]} */ (Array.isArray(attributes) && attributes || [attributes]);

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
     * @param {Float32Array | VertexAttribute | VertexAttribute[]} dataOrAttributes
     * @param {number | import("./BasePipeline").BufferDescriptor & { count?: number }} [descriptor]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     *
     * @returns {GPUBuffer | { buffer: GPUBuffer, layout: GPUVertexBufferLayout }}
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
     * @param {GPUShaderModule} module
     * @param {string} [entry = "vertex"]
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateVertexState(module, entry = "vertex", buffers, constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (Array.isArray(buffers) && buffers || [buffers]);
        return { module, entryPoint: entry, buffers, constants };
    }

    /**
     * @param {GPUBlendOperation} [operation]
     * @param {GPUBlendFactor} [srcFactor]
     * @param {GPUBlendFactor} [dstFactor]
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
    CreateTargetState(format = this.#PreferredCanvasFormat, blend, writeMask)
    {
        return { format, blend, writeMask };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateFragmentState(module, entry = "fragment", targets, constants)
    {
        targets ??= this.CreateTargetState();
        targets = /** @type {GPUColorTargetState[]} */ (Array.isArray(targets) && targets || [targets]);
        return { module, entryPoint: entry, targets, constants };
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
     * @param {GPUSize32} [count = 4]
     * @param {GPUSampleMask} [mask]
     * @param {boolean} [alphaToCoverageEnabled]
     */
    CreateMultisampleState(count = 4, mask, alphaToCoverageEnabled)
    {
        return { count, mask, alphaToCoverageEnabled };
    }

    /**
     * @override
     * @param {GPUTextureFormat} [format]
     * @param {GPUStorageTextureAccess} [access]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateStorageTextureBindingLayout(format = this.#PreferredCanvasFormat, access, viewDimension, visibility, binding)
    {
        return { binding, visibility: GPUShaderStage.FRAGMENT, storageTexture: { access, format, viewDimension } };
    }

    /**
     * @todo Convert to a `Promise` in version `0.1.0`.
     *
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
    /* async */ CreatePipeline(moduleDescriptor = {}, useInCurrentPass)
    {
        let module = this.GetShaderModule(moduleDescriptor);
        let { vertex, fragment } = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor);

        !module && !vertex && (module = this.CreateShaderModule());

        if (module)
        {
            vertex ??= this.CreateVertexState(module);
            fragment ??= this.CreateFragmentState(module);
        }

        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Render Pipeline");
        const layout = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";

        this.SetPipeline(/* await */ this.Device.createRenderPipeline/*Async*/({
            label, layout, vertex, fragment, ...moduleDescriptor
        }));

        if (useInCurrentPass) this.#CurrentPass
            ? this.#CurrentPass.setPipeline(this.Pipeline)
            : ThrowWarning(ERROR.RENDER_PASS_NOT_FOUND);

        return this.Pipeline;
    }

    /** @override */
    SavePipelineState()
    {
        super.SavePipelineState();
        this.#PrevIndexBuffer = this.#IndexBuffer;
        this.#PrevVertexBuffers = this.#VertexBuffers;
        this.#PrevBlendConstant = this.#BlendConstant;
        this.#PrevMultisampleTexture = this.#MultisampleTexture;
        this.#PrevUseCurrentTextureView = this.#UseCurrentTextureView;
        this.#PrevUseDepthStencilAttachment = this.#UseDepthStencilAttachment;
        this.#PrevIndexBuffer &&= /** @type {IndexBufferParamsValues} */ (Object.values(this.#PrevIndexBuffer));
    }

    /** @override */
    ResetPipelineState()
    {
        super.ResetPipelineState();
        this.SetIndexBuffer(undefined);
        this.#PrevBlendConstant = [0, 0, 0, 0];
        this.#MultisampleTexture = this.#MultisampleTexture?.destroy();
        this.#UseCurrentTextureView = this.#UseDepthStencilAttachment = false;
    }

    /** @override */
    RestorePipelineState()
    {
        super.RestorePipelineState();
        this.#VertexBuffers = this.#PrevVertexBuffers;
        this.#BlendConstant = this.#PrevBlendConstant;
        this.#MultisampleTexture = this.#PrevMultisampleTexture;
        this.#UseCurrentTextureView = this.#PrevUseCurrentTextureView;
        this.#UseDepthStencilAttachment = this.#PrevUseDepthStencilAttachment; // @ts-ignore
        this.SetIndexBuffer(...(Array.isArray(this.#PrevIndexBuffer) && this.#PrevIndexBuffer || [undefined]));
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    SetVertexBuffers(vertexBuffers, offsets, sizes)
    {
        offsets = /** @type {GPUSize64[]} */ (Array.isArray(offsets) && offsets || [offsets]);
        sizes = /** @type {GPUSize64[]} */ (Array.isArray(sizes) && sizes || [sizes]);

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
        offsets = /** @type {GPUSize64[]} */ (Array.isArray(offsets) && offsets || [offsets]);
        sizes = /** @type {GPUSize64[]} */ (Array.isArray(sizes) && sizes || [sizes]);

        // @ts-ignore
        this.#VertexBuffers.push(...(Array.isArray(vertexBuffers)
            && vertexBuffers.map((buffer, b) => ({ buffer, offset: offsets[b], size: sizes[b] }))
            || [{ buffer: vertexBuffers, offset: offsets[0], size: sizes[0] }])
        );
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

    /**
     * @param {number} width
     * @param {number} height
     * @param {boolean} [style = true]
     */
    SetCanvasSize(width, height, style = true)
    {
        !this.Device && ThrowError(ERROR.DEVICE_NOT_FOUND);
        !this.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const { maxTextureDimension2D } = this.Device.limits;

        width = Math.max(1, Math.min(width, maxTextureDimension2D));
        height = Math.max(1, Math.min(height, maxTextureDimension2D));

        if (this.#Canvas.width !== width || this.#Canvas.height !== height)
        {
            this.#Canvas.width = width;
            this.#Canvas.height = height;
            this.#UpdateCanvasResolution();

            if (style)
            {
                this.#Canvas.style.width = `${width}px`;
                this.#Canvas.style.height = `${height}px`;
            }
        }
    }

    #UpdateDepthStencilAttachment()
    {
        const currentTexture = this.CurrentTexture;
        const { width, height } = currentTexture;

        // A new depth texture needs to be created if absent or if its size is different from current canvas texture:
        if (!this.#DepthTexture || this.#DepthTexture.width !== width || this.#DepthTexture.height !== height)
        {
            this.#DepthTexture?.destroy();

            this.#DepthTexture = this.#Texture.CreateTextureFromSource(currentTexture,
            {
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                label: "Depth Texture",
                format: "depth24plus",
                mipmaps: false
            });
        }

        /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
            .depthStencilAttachment.view = this.#DepthTexture.createView();
    }

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
    Render(params, submit = true)
    {
        this.#UseDepthStencilAttachment && this.#UpdateDepthStencilAttachment();

        if (!this.#CurrentPass)
        {
            if (this.#MultisampleTexture)
            {
                /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
                    .colorAttachments[0].view = this.#MultisampleTexture.createView();

                /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
                    .colorAttachments[0].resolveTarget = this.CurrentTextureView;
            }

            else this.#UseCurrentTextureView && (
                /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
                    .colorAttachments[0].view = this.CurrentTextureView
            );

            this.#CurrentPass = this.GetCommandEncoder().beginRenderPass(
                /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
            );

            this.#CurrentPass.setPipeline(/** @type {GPURenderPipeline} */ (this.Pipeline));

            this.#CurrentPassDraw = this.#IndexBuffer
                ? this.#CurrentPass.drawIndexed.bind(this.#CurrentPass)
                : this.#CurrentPass.draw.bind(this.#CurrentPass);
        }

        for (let v = 0, l = this.#VertexBuffers.length; v < l; ++v)
        {
            const { buffer, offset, size } = this.#VertexBuffers[v];
            this.#CurrentPass.setVertexBuffer(v, buffer, offset, size);
        }

        this.#IndexBuffer && this.#CurrentPass.setIndexBuffer(
            this.#IndexBuffer.buffer,
            this.#IndexBuffer.format,
            this.#IndexBuffer.offset,
            this.#IndexBuffer.size
        );

        for (let g = 0, a = 0, l = this.BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.BindGroups[g];
            active && this.#CurrentPass.setBindGroup(a++, bindGroup, dynamicOffsets);
        }

        this.#CurrentPass.setBlendConstant(this.#BlendConstant);

        // @ts-ignore
        this.#CurrentPassDraw(...(Array.isArray(params) && params || [params]));

        submit && this.Submit();
    }

    DestroyCurrentPass()
    {
        this.#CurrentPass?.end();
        this.#CurrentPass = undefined;
    }

    Submit()
    {
        this.DestroyCurrentPass();
        this.SubmitCommandBuffer();
        this.SetCommandEncoder(undefined);
    }

    Destroy()
    {
        this.DestroyCurrentPass();
        this.#Context?.unconfigure();
    }

    get Canvas()
    {
        return this.#Canvas;
    }

    get Context()
    {
        return this.#Context;
    }

    get CurrentPass()
    {
        return this.#CurrentPass;
    }

    get AspectRatio()
    {
        !this.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);
        return this.#Canvas.width / this.#Canvas.height;
    }

    get DepthTexture()
    {
        return this.#DepthTexture;
    }

    get CurrentTexture()
    {
        return this.#Context.getCurrentTexture();
    }

    get CurrentTextureView()
    {
        return this.CurrentTexture.createView();
    }

    /** @param {GPUTexture | undefined} texture */
    set MultisampleTexture(texture)
    {
        this.#MultisampleTexture = texture;
    }

    get MultisampleTexture()
    {
        return this.#MultisampleTexture;
    }

    /** @param {import("../Color").ColorParam} color */
    set BlendConstant(color)
    {
        this.#BlendConstant = this.#GetGPUColorValue(color);
    }

    get BlendConstant()
    {
        return this.#BlendConstant;
    }

    get ResolutionBuffer()
    {
        return this.#ResolutionBuffer;
    }

    get DevicePixelRatio()
    {
        return devicePixelRatio ?? 1;
    }

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.#CurrentPass = undefined;
        this.#ResolutionBuffer.destroy();
        this.#BlendConstant = [0, 0, 0, 0];

        this.#Texture = this.#Texture?.Destroy();
        this.#DepthTexture = this.#DepthTexture?.destroy();
        this.#PrevMultisampleTexture = this.#PrevMultisampleTexture?.destroy();
        this.#PrevUseCurrentTextureView = this.#PrevUseDepthStencilAttachment = false;

        this.#PrevVertexBuffers?.forEach(({ buffer }) => buffer.destroy());
        this.#VertexBuffers.forEach(({ buffer }) => buffer.destroy());

        this.#IndexBuffer?.buffer.destroy();
        this.#PrevIndexBuffer?.splice(0);
        this.#PrevIndexBuffer = void 0;

        this.#PrevVertexBuffers?.splice(0);
        this.#PrevVertexBuffers = void 0;
        this.#VertexBuffers.splice(0);

        this.ResetPipelineState();
        this.#Context.unconfigure();
    }
}
