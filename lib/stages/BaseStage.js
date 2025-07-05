import { ERROR, ThrowWarning } from "#/Errors";

/** @abstract */ export default class BaseStage
{
    /** @type {string} */ #ProgramName;
    /** @type {string} */ #CommandEncoderLabel;
    /** @type {GPUCommandEncoder | undefined} */ #CommandEncoder;

    /** @protected @type {GPUDevice} */ Device;
    /** @protected @type {RenderPipeline[] | ComputePipeline[]} */ Pipelines = [];

    /**
     * @param {GPUDevice} device
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        this.Device = device;
        this.#ProgramName = programName;
        this.#CommandEncoderLabel = this.#CreateStageLabel("Command Encoder");
    }

    /**
     * @protected
     * @param {string} [label = ""]
     */
    /*#__INLINE__*/ CreateStageLabel(label)
    {
        return this.#ProgramName && label && `${this.#ProgramName} ${label}` || "";
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
    /*#__INLINE__*/ get ProgramName()
    {
        return this.#ProgramName;
    }

    Destroy()
    {
        this.Pipelines.forEach(Pipeline => Pipeline.Destroy());
        this.CommandEncoder = undefined;
        this.Pipelines.splice(0);
    }
}
