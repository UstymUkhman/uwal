import Color from "#/Color";
import { Texture } from "#/textures";
import { BaseStage } from "#/stages";
import { GetParamArray } from "#/utils";
import { USAGE, RenderPipeline } from "#/pipelines";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

export default class RenderStage extends BaseStage
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
    #Resolution = new Float32Array(3);
    #UseDepthStencilAttachment = false;

    /** @type {HTMLCanvasElement} */ #Canvas;
    /** @type {GPUCanvasContext} */ #Context;
    /** @type {GPUBuffer} */ #ResolutionBuffer;
    /** @type {Texture | undefined} */ #Texture;

    /** @type {GPURenderPassDescriptor} */ #Descriptor;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /** @typedef {[GPUBuffer, GPUIndexFormat, GPUSize64, GPUSize64]} IndexBufferParamsValues */
    /** @typedef {import("../pipelines/RenderPipeline").RenderPipelineDescriptor} RenderPipelineDescriptor */

    /**
     * @param {GPUDevice} device
     * @param {string} [name = ""]
     * @param {HTMLCanvasElement} [canvas]
     * @param {ConfigurationOptions} [options = {}]
     */
    constructor(device, name, canvas, options)
    {
        super(device, "Render", name);
        !canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const context = canvas.getContext("webgpu");
        !context && ThrowError(ERROR.CONTEXT_NOT_FOUND);

        context.configure(/** @type {GPUCanvasConfiguration} */ ({ device, ...options }));

        this.#Canvas = canvas;
        this.#Context = context;

        this.#PreferredCanvasFormat = options.format;
        this.CreatePassDescriptor(this.CreateColorAttachment());
    }

    /** @param {import("../Color").ColorParam} color */
    /*#__INLINE__*/ #GetGPUColorValue(color)
    {
        return color instanceof Color ? color.rgba : color;
    }

    /**
     * @param {import("../Color").ColorParam} [clearColor]
     * @param {GPUTextureView} [view]
     * @param {GPULoadOp} [loadOp = "clear"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {GPUTextureView} [resolveTarget]
     * @param {GPUIntegerCoordinate} [depthSlice]
     */
    CreateColorAttachment(clearColor, view, loadOp = "clear", storeOp = "store", resolveTarget, depthSlice)
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
     * @param {GPUStencilValue} [stencilClearValue]
     * @param {GPULoadOp} [stencilLoadOp = "clear"]
     * @param {GPUStoreOp} [stencilStoreOp = "store"]
     * @param {boolean} [stencilReadOnly]
     */
    CreateDepthStencilAttachment(
        view,
        depthClearValue = 1,
        depthLoadOp = "clear",
        depthStoreOp = "store",
        depthReadOnly,
        stencilClearValue,
        stencilLoadOp = "clear",
        stencilStoreOp = "store",
        stencilReadOnly
    ) {
        this.#UseDepthStencilAttachment = true;
        this.#Texture = new Texture(this.Device);

        return {
            view,
            depthClearValue,
            depthLoadOp,
            depthStoreOp,
            depthReadOnly,
            stencilClearValue,
            stencilLoadOp,
            stencilStoreOp,
            stencilReadOnly
        };
    }

    /**
     * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment]
     * @param {string} [label]
     * @param {GPUQuerySet} [occlusionQuerySet]
     * @param {GPURenderPassTimestampWrites} [timestampWrites]
     * @param {GPUSize64} [maxDrawCount]
     */
    CreatePassDescriptor(
        colorAttachments, depthStencilAttachment, label, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        const attachments = /** @type {GPURenderPassColorAttachment[]} */ (GetParamArray(colorAttachments));
        this.#UseCurrentTextureView = !attachments.some(({ view }) => !!view);
        label ??= this.CreateStageLabel("Render Pass");

        return this.#Descriptor =
        {
            colorAttachments: attachments,
            depthStencilAttachment,
            occlusionQuerySet,
            timestampWrites,
            maxDrawCount,
            label
        };
    }

    /** @param {ConfigurationOptions} options */
    ConfigureContext(options)
    {
        const format = options.format ?? this.#PreferredCanvasFormat;
        this.#Context.configure({ device: this.Device, format, ...options });
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
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    /*#__INLINE__*/ #CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return { format, shaderLocation, offset };
    }

    /*#__INLINE__*/ #UpdateCanvasResolution()
    {
        this.#Resolution.set([this.#Canvas.width, this.#Canvas.height, this.DevicePixelRatio]);
        this.WriteBuffer(this.#ResolutionBuffer, this.#Resolution);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param @param {RenderPipelineDescriptor | GPUShaderModule} [moduleDescriptor]
     * @param {boolean} [useInCurrentPass]
     */
    async AddPipeline(Pipeline, moduleDescriptor, useInCurrentPass)
    {
        const pipeline = await Pipeline.Init(moduleDescriptor);

        if (!this.#ResolutionBuffer)
        {
            this.#ResolutionBuffer = Pipeline.CreateBuffer(
            {
                size: this.#Resolution.length * Float32Array.BYTES_PER_ELEMENT,
                label: "Render Pipeline Resolution Buffer",
                usage: USAGE.UNIFORM
            });

            this.#UpdateCanvasResolution();
        }

        if (useInCurrentPass) this.#CurrentPass
            ? this.#CurrentPass.setPipeline(pipeline)
            : ThrowWarning(ERROR.RENDER_PASS_NOT_FOUND);

        // Prevent resetting an already stored pipeline:
        Reflect.deleteProperty(Pipeline, "Init");

        this.Pipelines.push(Pipeline);
    }

    get Pipeline()
    {
        const { Name, Device } = this;
        const format = this.#PreferredCanvasFormat;

        return class extends RenderPipeline
        {
            constructor(name = Name)
            {
                super(Device, format, name);
            }
        };
    }
}
