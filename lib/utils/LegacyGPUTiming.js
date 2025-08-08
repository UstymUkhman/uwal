import Device from "#/Device";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowWarning } from "#/Errors";

export default class LegacyGPUTiming
{
    /** @type {LegacyComputation | LegacyRenderer} */ #Pipeline;
    /** @type {GPUBuffer | undefined} */ #ResolveBuffer;
    /** @type {GPUQuerySet | undefined} */ #QuerySet;
    /** @type {boolean} */ #TimestampQuery = false;
    /** @type {GPUBuffer[]} */ #ResultBuffers = [];

    /** @param {LegacyComputation | LegacyRenderer} pipeline */
    constructor(pipeline)
    {
        this.#Pipeline = pipeline;

        Device.GPUDevice.then(({ features }) =>
        {
            if (features.has("timestamp-query"))
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

        this.#ResultBuffers.push(this.#Pipeline.CreateBuffer(
        {
            label: "LegacyGPUTiming Result Buffer",
            size: this.#QuerySet.count * 8,
            usage: USAGE.READABLE
        }));

        this.#ResolveBuffer = this.#Pipeline.CreateBuffer(
        {
            label: "LegacyGPUTiming Resolve Buffer",
            size: this.#QuerySet.count * 8,
            usage: USAGE.QUERY
        });

        return this.#QuerySet;
    }

    async ResolveAndSubmit()
    {
        if (!this.#TimestampQuery) { this.#Submit(); return NaN; }

        const resultBuffer = this.#ResultBuffers.pop() || this.#Pipeline.CreateBuffer({
            size: this.#ResolveBuffer.size,
            usage: USAGE.READABLE
        });

        this.#Pipeline.ResolveQuerySet(this.#QuerySet, this.#ResolveBuffer);
        this.#Pipeline.CopyBufferToBuffer(this.#ResolveBuffer, resultBuffer);

        this.#Submit();

        await resultBuffer.mapAsync(GPUMapMode.READ);

        const times = new BigInt64Array(resultBuffer.getMappedRange());
        const duration = Number(times[1] - times[0]);

        resultBuffer.unmap();
        this.#ResultBuffers.push(resultBuffer);

        return duration;
    }

    #Submit()
    {
        this.#Pipeline.SubmitCommandBuffer();
        this.#Pipeline.SetCommandEncoder(undefined);
    }

    /** @returns {GPUQuerySet} */
    get QuerySet()
    {
        return this.#QuerySet ?? (async () =>
        {
            if (!(await Device.GPUDevice).features.has("timestamp-query"))
                ThrowWarning(ERROR.TIMESTAMP_QUERY_NOT_FOUND);
            else
            {
                await this.#CreateQueryBuffers();
                return this.#QuerySet;
            }
        })();
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
