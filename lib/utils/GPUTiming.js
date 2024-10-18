import UWAL from "@/UWAL";
import { USAGE } from "@/pipelines";

export default class GPUTiming
{
    /** @type {boolean} */ #TimestampQuery = UWAL.DeviceDescriptor.requiredFeatures.includes("timestamp-query");

    /** @type {GPUBuffer | undefined} */ #ResolveBuffer;
    /** @type {GPUBuffer | undefined} */ #ResultBuffer;
    /** @type {GPUQuerySet | undefined} */ #QuerySet;
    /** @type {Computation | Renderer} */ #Pipeline;

    /** @param {Computation | Renderer} pipeline */
    constructor(pipeline)
    {
        this.#Pipeline = pipeline;
        this.#TimestampQuery && this.#CreateQueryBuffers();
    }

    async #CreateQueryBuffers()
    {
        this.#QuerySet = await UWAL.CreateQuerySet("timestamp", 2);

        this.#ResolveBuffer = this.#Pipeline.CreateBuffer(
        {
            usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            label: 'GPUTiming Resolve Buffer',
            size: this.#QuerySet.count * 8
        });

        this.#ResultBuffer = this.#Pipeline.CreateBuffer(
        {
            label: 'GPUTiming Result Buffer',
            size: this.#ResolveBuffer.size,
            usage: USAGE.READABLE
        });
    }

    #Submit()
    {
        this.#Pipeline.SubmitCommandBuffer();
        this.#Pipeline.SetCommandEncoder(undefined);
    }

    async ResolveAndSubmit()
    {
        if (!this.#TimestampQuery) return this.#Submit();

        this.#Pipeline.ResolveQuerySet(this.#QuerySet, this.#ResolveBuffer);

        this.#ResultBuffer.mapState === "unmapped" &&
            this.#Pipeline.CopyBufferToBuffer(this.#ResolveBuffer, this.#ResultBuffer);

        this.#Submit();

        if (this.#ResultBuffer.mapState !== "unmapped") return 0;
        await this.#ResultBuffer.mapAsync(GPUMapMode.READ);

        const times = new BigInt64Array(this.#ResultBuffer.getMappedRange());
        const duration = Number(times[1] - times[0]);

        this.#ResultBuffer.unmap();
        return duration;
    }

    /** @returns {GPUQuerySet} */
    get QuerySet()
    {
        return this.#QuerySet ?? (async () =>
        {
            await this.#CreateQueryBuffers();
            return this.#QuerySet;
        })();
    }
}
