import UWAL from "@/UWAL";
import RedTriangle from "./RedTriangle.wgsl";
import Double from "./Double.wgsl";

(async function(canvas)
{
    // Drawing triangles to textures:
    {
        /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

        try
        {
            Renderer = new (await UWAL.RenderPipeline(canvas, "Red Triangle Encoder"));
        }
        catch (error)
        {
            alert(error);
        }

        const colorAttachment = Renderer.CreateColorAttachment(
            undefined,
            "clear",
            "store",
            [0.3, 0.3, 0.3, 1]
        );

        const descriptor = Renderer.CreateRenderPassDescriptor(
            [colorAttachment],
            "Red Triangle Render Pass"
        );

        const module = Renderer.CreateShaderModule(RedTriangle, "Red Triangle Shader");
        const vertex = Renderer.CreateVertexState(module);
        const fragment = Renderer.CreateFragmentState(module);

        const pipeline = Renderer.CreateRenderPipeline({
            label: "Red Triangle Pipeline", vertex, fragment
        });

        function render()
        {
            UWAL.SetCanvasSize(canvas.width, canvas.height);

            descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;
            Renderer.Render(descriptor, pipeline, 3);
        }

        const observer = new ResizeObserver(entries =>
        {
            for (const entry of entries)
            {
                const { inlineSize, blockSize } = entry.contentBoxSize[0];
                UWAL.SetCanvasSize(inlineSize, blockSize);
            }

            render();
        });

        observer.observe(canvas);
    }

    // Run computations on the GPU:
    {
        const input = new Float32Array([1, 3, 5]);

        const Computation = new (await UWAL.ComputePipeline("Double Compute Encoder"));

        const computeBuffer = Computation.CreateBuffer({
            label: "Double Compute Buffer",
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        });

        Computation.WriteBuffer(computeBuffer, input);

        const module = Computation.CreateShaderModule(Double, "Double Compute Shader");

        const pipeline = Computation.CreateComputePipeline({
            label: "Double Compute Pipeline", module
        });

        const entries = Computation.CreateBindGroupEntries({
            buffer: computeBuffer
        });

        const bindGroup = Computation.CreateBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            label: "Compute Buffer Bind Group",
            entries
        });

        Computation.AddBindGroups(bindGroup);
        Computation.CreateCommandEncoder();

        const descriptor = Computation.CreateComputePassDescriptor("Double Compute Pass");

        Computation.Workgroups = input.length;
        Computation.Compute(pipeline, descriptor);

        const resultBuffer = Computation.CreateBuffer({
            label: "Double Result Buffer",
            size: input.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        Computation.CopyBufferToBuffer(computeBuffer, resultBuffer, resultBuffer.size);
        Computation.SubmitCommandBuffer();

        await resultBuffer.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(resultBuffer.getMappedRange());

        console.info("Input:", ...input);
        console.info("Result:", ...result);

        resultBuffer.unmap();
    }
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
