import Device from "#/Device";
import { CreateBuffer } from "#/utils";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

export default class GPUTiming
{
    /** @type {GPUBuffer | undefined} */ #ResolveBuffer;
    /** @type {GPUQuerySet | undefined} */ #QuerySet;
    /** @type {GPUBuffer[]} */ #ResultBuffers = [];
    /** @type {boolean} */ #TimestampQuery = false;
    /** @type {Computation | Renderer} */ #Stage;

    /** @param {Computation | Renderer} stage */
    constructor(stage)
    {
        this.#Stage = stage;

        Device.GPUDevice.then(Device =>
        {
            if (Device && !Device.features.has("timestamp-query"))
                ThrowWarning(ERROR.TIMESTAMP_QUERY_NOT_FOUND);

            else if (Device)
            {
                this.#TimestampQuery = true;
                this.#CreateQueryBuffers();
            }
        });
    }

    async #CreateQueryBuffers()
    {
        if (this.#QuerySet) return this.#QuerySet;
        this.#QuerySet = await Device.CreateQuerySet("timestamp", 2);

        const device = await Device.GPUDevice;
        if (!this.#QuerySet || !device) return;

        this.#ResultBuffers.push(CreateBuffer(device,
        {
            label: "GPUTiming Result Buffer",
            size: this.#QuerySet.count * 8,
            usage: USAGE.READABLE
        }));

        this.#ResolveBuffer = CreateBuffer(device,
        {
            label: "GPUTiming Resolve Buffer",
            size: this.#QuerySet.count * 8,
            usage: USAGE.QUERY
        });

        return this.#QuerySet;
    }

    async ResolveAndSubmit()
    {
        !this.#Stage.GetCommandEncoder() && ThrowError(ERROR.COMMAND_BUFFER_SUBMITTED);

        if (!this.Enabled) { this.#Stage.Submit(); return NaN; }
        /** @type {Renderer} */ (this.#Stage).DestroyRenderPass?.();

        const device = await Device.GPUDevice;
        if (!this.#ResolveBuffer || !this.#QuerySet || !device) return NaN;

        const resultBuffer = this.#ResultBuffers.pop() ?? CreateBuffer(device,
        {
            label: /*@__INLINE__*/ this.#Stage.CreateStageLabel("Buffer"),
            size: this.#ResolveBuffer.size,
            usage: USAGE.READABLE
        });

        this.#Stage.ResolveQuerySet(this.#QuerySet, this.#ResolveBuffer);
        this.#Stage.CopyBufferToBuffer(this.#ResolveBuffer, resultBuffer);

        this.#Stage.SubmitCommandBuffer();
        this.#Stage.CommandEncoder = undefined;
        await resultBuffer.mapAsync(GPUMapMode.READ);

        const times = new BigInt64Array(resultBuffer.getMappedRange());
        const duration = parseInt(`${times[1] - times[0]}`);

        resultBuffer.unmap();
        this.#ResultBuffers.push(resultBuffer);

        return duration;
    }

    get QuerySet()
    {
        return /** @type {Promise<GPUQuerySet>} */ (this.#QuerySet ?? (async () =>
        {
            if (!(await Device.GPUDevice)?.features.has("timestamp-query"))
                return ThrowWarning(ERROR.TIMESTAMP_QUERY_NOT_FOUND);

            else
            {
                await this.#CreateQueryBuffers();
                return this.#QuerySet;
            }
        })());
    }

    get Enabled()
    {
        return this.#TimestampQuery;
    }

    Destroy()
    {
        this.#TimestampQuery = false;
        this.#QuerySet = this.#QuerySet?.destroy();
        this.#ResolveBuffer = this.#ResolveBuffer?.destroy();
    }
}
