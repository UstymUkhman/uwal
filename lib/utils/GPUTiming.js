import Device from "#/Device";
import { USAGE } from "#/legacy";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

export default class GPUTiming
{
    /** @type {GPUBuffer | undefined} */ #ResolveBuffer;
    /** @type {GPUBuffer | undefined} */ #ResultBuffer;
    /** @type {GPUQuerySet | undefined} */ #QuerySet;

    /** @type {boolean} */ #TimestampQuery = false;
    /** @type {Computation | Renderer} */ #Stage;

    /** @param {Computation | Renderer} stage */
    constructor(stage)
    {
        this.#Stage = stage;

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

        const Pipelines = this.#Stage.ActivePipelines;

        if (!Pipelines.length) ThrowError(ERROR.ACTIVE_PIPELINE_NOT_FOUND);

        this.#QuerySet = await Device.CreateQuerySet("timestamp", 2);

        this.#ResolveBuffer = Pipelines[0].CreateBuffer(
        {
            usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            label: "GPUTiming Resolve Buffer",
            size: this.#QuerySet.count * 8
        });

        this.#ResultBuffer = Pipelines[0].CreateReadableBuffer(
        {
            label: "GPUTiming Result Buffer",
            size: this.#ResolveBuffer.size
        });

        return this.#QuerySet;
    }

    async ResolveAndSubmit()
    {
        if (!this.#TimestampQuery) { this.#Submit(); return NaN; }

        this.#Stage.ResolveQuerySet(this.#QuerySet, this.#ResolveBuffer);

        this.#ResultBuffer.mapState === "unmapped" &&
            this.#Stage.CopyBufferToBuffer(this.#ResolveBuffer, this.#ResultBuffer);

        this.#Submit();

        if (this.#ResultBuffer.mapState !== "unmapped") return 0;

        await this.#ResultBuffer.mapAsync(GPUMapMode.READ);

        const times = new BigInt64Array(this.#ResultBuffer.getMappedRange());
        const duration = Number(times[1] - times[0]);

        this.#ResultBuffer.unmap();
        return duration;
    }

    #Submit()
    {
        this.#Stage.SubmitCommandBuffer();
        this.#Stage.CommandEncoder = undefined;
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
        this.#ResultBuffer = this.#ResultBuffer?.destroy();
        this.#ResolveBuffer = this.#ResolveBuffer?.destroy();
    }
}
