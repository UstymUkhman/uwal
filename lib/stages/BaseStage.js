import { ERROR, ThrowWarning } from "#/Errors";

/** @abstract */ export default class BaseStage
{
    /** @typedef {import("../pipelines/BasePipeline").BindGroupLayoutEntry} BindGroupLayoutEntry */
    /** @type {(ComputePipeline | RenderPipeline)[]} */ Pipelines = [];
    /** @type {GPUCommandEncoder | undefined} */ #CommandEncoder;

    /** @protected @type {GPUDevice} */ Device;
    /** @type {string} */ #CommandEncoderLabel;
    /** @type {"Compute" | "Render"} */ #Type;

    /** @type {string} */ #Name;

    /**
     * @param {GPUDevice} device
     * @param {"Compute" | "Render"} type
     * @param {string} [name = ""]
     */
    constructor(device, type, name = "")
    {
        this.#Name = name;
        this.#Type = type;
        this.Device = device;
        this.#CommandEncoderLabel = /*@__INLINE__*/ this.CreateStageLabel("Command Encoder");
    }

    /** @param {string} [label = ""] */
    CreateStageLabel(label)
    {
        return this.#Name && label && `${this.#Name} ${label}` || "";
    }

    #GetBindingLayoutVisibility()
    {
        return (this.#Type === "Render" && GPUShaderStage.FRAGMENT) || GPUShaderStage.COMPUTE;
    }

    /**
     * @param {GPUQuerySet} querySet
     * @param {GPUSize32} [beginningOfPassWriteIndex = 0]
     * @param {GPUSize32} [endOfPassWriteIndex = 1]
     * @returns {GPURenderPassTimestampWrites}
     */
    CreateTimestampWrites(querySet, beginningOfPassWriteIndex = 0, endOfPassWriteIndex = 1)
    {
        return { querySet, beginningOfPassWriteIndex, endOfPassWriteIndex };
    }

    /**
     * @param {GPUQuerySet} querySet
     * @param {GPUBuffer} destination
     * @param {GPUSize32} [firstQuery = 0]
     * @param {GPUSize32} [queryCount = querySet.count]
     * @param {GPUSize64} [destinationOffset = 0]
     */
    ResolveQuerySet(querySet, destination, firstQuery = 0, queryCount = querySet.count, destinationOffset = 0)
    {
        this.GetCommandEncoder(true).resolveQuerySet(querySet, firstQuery, queryCount, destination, destinationOffset);
    }

    /**
     * @param {GPUBufferBindingType} [type]
     * @param {boolean} [hasDynamicOffset]
     * @param {GPUSize64} [minBindingSize]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     * @returns {BindGroupLayoutEntry}
     */
    CreateBufferBindingLayout(type, hasDynamicOffset, minBindingSize, visibility, binding)
    {
        visibility ??= /*@__INLINE__*/ this.#GetBindingLayoutVisibility();
        return { binding, visibility, buffer: { type, hasDynamicOffset, minBindingSize } };
    }

    /**
     * @param {GPUSamplerBindingType} [type]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     * @returns {BindGroupLayoutEntry}
     */
    CreateSamplerBindingLayout(type, visibility, binding)
    {
        visibility ??= /*@__INLINE__*/ this.#GetBindingLayoutVisibility();
        return { binding, visibility, sampler: { type } };
    }

    /**
     * @param {GPUTextureSampleType} [sampleType]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {boolean} [multisampled]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     * @returns {BindGroupLayoutEntry}
     */
    CreateTextureBindingLayout(sampleType, viewDimension, multisampled, visibility, binding)
    {
        visibility ??= /*@__INLINE__*/ this.#GetBindingLayoutVisibility();
        return { binding, visibility, texture: { sampleType, viewDimension, multisampled } };
    }

    /**
     * @param {GPUTextureFormat} format
     * @param {GPUStorageTextureAccess} [access]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     * @returns {BindGroupLayoutEntry}
     */
    CreateStorageTextureBindingLayout(format, access, viewDimension, visibility, binding)
    {
        visibility ??= /*@__INLINE__*/ this.#GetBindingLayoutVisibility();
        return { binding, visibility, storageTexture: { access, format, viewDimension } };
    }

    /**
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     * @returns {BindGroupLayoutEntry}
     */
    CreateExternalTextureBindingLayout(visibility, binding)
    {
        visibility ??= /*@__INLINE__*/ this.#GetBindingLayoutVisibility();
        return { binding, visibility, externalTexture: {} };
    }

    CreateCommandEncoder()
    {
        return this.#CommandEncoder = this.Device.createCommandEncoder({ label: this.#CommandEncoderLabel });
    }

    /** @param {boolean} [required = false] */
    GetCommandEncoder(required = false)
    {
        if (!this.#CommandEncoder)
        {
            required && ThrowWarning(ERROR.COMMAND_ENCODER_NOT_FOUND,
                `${this.#CommandEncoderLabel && ` Label: "${this.#CommandEncoderLabel}".`} Creating a new one.`
            );

            return this.CreateCommandEncoder();
        }

        return this.#CommandEncoder;
    }

    SubmitCommandBuffer()
    {
        this.Device.queue.submit([/** @type {GPUCommandEncoder} */ (this.#CommandEncoder).finish()]);
    }

    /**
     * @param {GPUBuffer} source
     * @param {GPUBuffer} destination
     * @param {GPUSize64} [size = destination.size]
     * @param {GPUSize64} [sourceOffset = 0]
     * @param {GPUSize64} [destinationOffset = 0]
     */
    CopyBufferToBuffer(source, destination, size = destination.size, sourceOffset = 0, destinationOffset = 0)
    {
        this.GetCommandEncoder(true).copyBufferToBuffer(source, sourceOffset, destination, destinationOffset, size);
    }

    /** @param {ComputePipeline | RenderPipeline} pipeline */
    RemovePipeline(pipeline)
    {
        const p = this.Pipelines.indexOf(pipeline);

        if (p < 0)
        {
            ThrowWarning(ERROR.PIPELINE_NOT_FOUND, `${this.#Type}Pipeline. The following pipeline was not found when
                calling \`${this.#Type === "Render" && `${this.#Type}er` || "Computation"}.RemovePipeline\` method.`
            );

            console.warn(pipeline);
        }
        else
        {
            this.Pipelines[p].Destroy();
            this.Pipelines.splice(p, 1);
        }
    }

    /** @param {GPUCommandEncoder | undefined} commandEncoder */
    set CommandEncoder(commandEncoder)
    {
        this.#CommandEncoder = commandEncoder;
    }

    /** @param {string} label */
    set CommandEncoderLabel(label)
    {
        this.#CommandEncoderLabel = label;
    }

    /** @protected */
    get Name()
    {
        return this.#Name;
    }

    Destroy()
    {
        this.Pipelines.forEach(Pipeline => Pipeline.Destroy());
        this.CommandEncoder = undefined;
        this.Pipelines.splice(0);
    }
}
