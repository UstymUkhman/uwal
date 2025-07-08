import { ERROR, ThrowWarning } from "#/Errors";

/** @abstract */ export default class BaseStage
{
    /** @type {string} */ #Name;
    /** @type {"Compute" | "Render"} */ #Type;
    /** @type {string} */ #CommandEncoderLabel;
    /** @protected @type {GPUDevice} */ Device;

    /** @type {GPUCommandEncoder | undefined} */ #CommandEncoder;
    /** @protected @type {ComputePipeline[] | RenderPipeline[]} */ Pipelines = [];
    /** @typedef {import("../pipelines/RenderPipeline").default} RenderPipeline */
    /** @typedef {import("../pipelines/ComputePipeline").default} ComputePipeline */

    /**
     * @param {GPUDevice} device
     * @param {"Compute" | "Render"} type
     * @param {string} [name = ""]
     */
    constructor(device, type, name)
    {
        this.#Name = name;
        this.#Type = type;
        this.Device = device;
        this.#CommandEncoderLabel = this.#CreateStageLabel("Command Encoder");
    }

    /**
     * @protected
     * @param {string} [label = ""]
     */
    /*#__INLINE__*/ #CreateStageLabel(label)
    {
        return this.#Name && label && `${this.#Name} ${label}` || "";
    }

    /*#__INLINE__*/ #GetBindingLayoutVisibility()
    {
        return (this.#Type === "Render" && GPUShaderStage.FRAGMENT) || GPUShaderStage.COMPUTE;
    }

    /**
     * @param {GPUQuerySet} querySet
     * @param {GPUSize32} [beginningOfPassWriteIndex]
     * @param {GPUSize32} [endOfPassWriteIndex]
     */
    CreateTimestampWrites(querySet, beginningOfPassWriteIndex, endOfPassWriteIndex)
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
     */
    CreateBufferBindingLayout(type, hasDynamicOffset, minBindingSize, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, buffer: { type, hasDynamicOffset, minBindingSize } };
    }

    /**
     * @param {GPUSamplerBindingType} [type]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateSamplerBindingLayout(type, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, sampler: { type } };
    }

    /**
     * @param {GPUTextureSampleType} [sampleType]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {boolean} [multisampled]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateTextureBindingLayout(sampleType, viewDimension, multisampled, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, texture: { sampleType, viewDimension, multisampled } };
    }

    /**
     * @param {GPUTextureFormat} format
     * @param {GPUStorageTextureAccess} [access]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateStorageTextureBindingLayout(format, access, viewDimension, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, storageTexture: { access, format, viewDimension } };
    }

    /**
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateExternalTextureBindingLayout(visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, externalTexture: {} };
    }

    CreateCommandEncoder()
    {
        return this.#CommandEncoder = this.Device.createCommandEncoder({ label: this.#CommandEncoderLabel });
    }

    /**
     * @protected
     * @param {boolean} [required = false]
     */
    GetCommandEncoder(required = false)
    {
        if (!this.#CommandEncoder)
        {
            if (required)
            {
                const message = `${this.#CommandEncoderLabel && `Label: "${this.#CommandEncoderLabel}".`}`;
                ThrowWarning(ERROR.COMMAND_ENCODER_NOT_FOUND, ` ${message} ` + "Creating a new one.");
            }

            return this.CreateCommandEncoder();
        }

        return this.#CommandEncoder;
    }

    SubmitCommandBuffer()
    {
        this.Device.queue.submit([this.#CommandEncoder.finish()]);
    }

    /**
     * @param {GPUBuffer} buffer
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {GPUSize64} [bufferOffset = 0]
     * @param {GPUSize64} [dataOffset]
     * @param {GPUSize64} [size]
     */
    WriteBuffer(buffer, data, bufferOffset = 0, dataOffset, size)
    {
        this.Device.queue.writeBuffer(buffer, bufferOffset, data, dataOffset, size);
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

    /** @param {GPUCommandEncoder} [commandEncoder] */
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
    /*#__INLINE__*/ get Name()
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
