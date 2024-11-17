/**
 * @example Text Rendering
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by astiopin's "webgl_fonts"
 * {@link https://astiopin.github.io/webgl_fonts}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.9
 * @license MIT
 */

// import RegularTexture from "/assets/fonts/roboto-regular.png";
// import RegularData from "/assets/fonts/roboto-regular.json";
import BoldTexture from "/assets/fonts/roboto-bold.png";
import BoldData from "/assets/fonts/roboto-bold.json";
import TextRendering from "./TextRendering.wgsl";
import { UWAL, Text } from "@/index";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Text Rendering"));
    }
    catch (error)
    {
        alert(error);
    }

    const objects = 6e4; // This equals to webgl_fonts' vertex_array length
    // https://github.com/astiopin/webgl_fonts/blob/master/src/main.js#L113

    const module = Renderer.CreateShaderModule(TextRendering);

    const { buffer: vertexBuffer, layout } = Renderer.CreateVertexBuffer(
        ["position", "texture", "scale"], objects
    );

    const attributes = new Float32Array(vertexBuffer.size / Float32Array.BYTES_PER_ELEMENT);

    for (let o = 0, s = attributes.length / objects; o < objects; o++)
    {
        const offset = o * s;

        attributes.set([0, 0], offset + 0); // position
        attributes.set([0, 0], offset + 2); // texture
        attributes.set([1]   , offset + 4); // scale
    }

    Renderer.AddVertexBuffers(vertexBuffer);
    Renderer.WriteBuffer(vertexBuffer, attributes);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, void 0, layout)
    });

    const text = new Text({ renderer: Renderer });

    const boldTexture = new Image();
    boldTexture.src = BoldTexture;

    boldTexture.onload = async () =>
    {
        /* const Texture = new (await UWAL.Texture());
        const sampler = Texture.CreateSampler({ filter: "linear" });

        const texture = Texture.CopyImageToTexture(boldTexture, {
            create: { format: "r32float" },
            generateMipmaps: false
        }); */

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    { buffer: Renderer.ResolutionBuffer } /*,
                    { buffer: uniformBuffer },
                    texture.createView(),
                    sampler */
                ])
            )
        );

        raf = requestAnimationFrame(render);
    };

    function render()
    {
        raf = requestAnimationFrame(render);
        Renderer.Render(0);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }
    });

    observer.observe(canvas);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
