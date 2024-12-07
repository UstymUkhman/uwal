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

import RegularTexture from "/assets/fonts/roboto-regular.png";
import RegularData from "/assets/fonts/roboto-regular.json";
import BoldTexture from "/assets/fonts/roboto-bold.png";
import BoldData from "/assets/fonts/roboto-bold.json";
import { UWAL, Shaders, Color, Text } from "@/index";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {Renderer} */ let Renderer;

    // Enable "Dual Source Blending" https://caniuse.com/?search=dual-source-blending:
    // const { size: dsb } = (await UWAL.SetRequiredFeatures("dual-source-blending"));

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Text Rendering"));
    }
    catch (error)
    {
        alert(error);
    }

    const loadFontTexture = (text, src) => new Promise(resolve =>
    {
        const texture = new Image(); texture.src = src;
        texture.onload = () => text.SetFontTexture(texture).then(resolve);
    });

    const module = Renderer.CreateShaderModule(Shaders.Text);
    // const color = Renderer.CreateBlendComponent("add", "one", "one-minus-src1");
    const target = Renderer.CreateTargetState(void 0, /* (dsb && { color, alpha: {} }) || */ void 0);

    const layout = Renderer.CreateVertexBufferLayout(
        ["position", "texture", "size"], void 0, "textVertex"
    );

    // const colorAttachment = Renderer.CreateColorAttachment();
    // colorAttachment.clearValue = new Color(0xffffff).rgba;
    // Renderer.CreatePassDescriptor(colorAttachment);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module, "textFragment", target),
        vertex: Renderer.CreateVertexState(module, "textVertex", layout)
    });

    const Title = new Text({
        color: new Color(0x005a9c),
        background: new Color(),
        renderer: Renderer,
        font: BoldData,
        size: 144
    });

    const Subtitle = new Text({
        color: new Color(0xffffff),
        background: new Color(),
        renderer: Renderer,
        font: RegularData,
        size: 24
    });

    loadFontTexture(Title, BoldTexture).then(async () =>
    {
        await loadFontTexture(Subtitle, RegularTexture);
        Subtitle.Write("Unopinionated WebGPU Abstraction Library", [-215, 0]);
        Title.Write("UWAL", [-185, 100]);
        Title.Render(false);
        Subtitle.Render();
    });

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
