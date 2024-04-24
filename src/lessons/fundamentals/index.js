import UWAL from "@/UWAL";
import RedTriangle from "./RedTriangle.wgsl";
import Double from "./Double.wgsl";

(async function(canvas)
{
    // Drawing triangles to textures
    {
        const Renderer = new (await UWAL.RenderPipeline(canvas, "Red Triangle Encoder"));

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

        const size = new WeakMap();
        const { maxTextureDimension2D } = (await UWAL.Device).limits;

        function resize()
        {
            let { width, height } = size.get(canvas) ?? canvas;

            width = Math.max(1, Math.min(width, maxTextureDimension2D));
            height = Math.max(1, Math.min(height, maxTextureDimension2D));

            if (canvas.width !== width || canvas.height !== height)
            {
                canvas.height = height;
                canvas.width = width;
            }
        }

        function render()
        {
            resize();

            descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;
            Renderer.Render(descriptor, pipeline, 3);
        }

        const observer = new ResizeObserver(entries =>
        {
            for (const entry of entries)
            {
                const { inlineSize, blockSize } = entry.contentBoxSize[0];
                size.set(entry.target, { width: inlineSize, height: blockSize });
            }

            render();
        });

        observer.observe(canvas);
    }

    // Run computations on the GPU
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

        const encoder = Computation.CreateCommandEncoder();
        const descriptor = Computation.CreateComputePassDescriptor("Double Compute Pass");

        Computation.Compute(encoder, pipeline, input.length, bindGroup, descriptor);

        const resultBuffer = Computation.CreateBuffer({
            label: "Double Result Buffer",
            size: input.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        Computation.CopyBufferToBuffer(encoder, computeBuffer, resultBuffer, resultBuffer.size);
        Computation.SubmitCommandBuffer(encoder);

        await resultBuffer.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(resultBuffer.getMappedRange());

        console.info('Input:', ...input);
        console.info('Result:', ...result);

        resultBuffer.unmap();
    }
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
