/**
 * @example Text Rendering
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by astiopin's "webgl_fonts"
 * {@link https://astiopin.github.io/webgl_fonts}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.10
 * @license MIT
 */

import RegularTexture from "/assets/fonts/roboto-regular.png";
import RegularData from "/assets/fonts/roboto-regular.json";
import BoldTexture from "/assets/fonts/roboto-bold.png";
import BoldData from "/assets/fonts/roboto-bold.json";
import { UWAL, SDFText, Color } from "@/index";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    // https://caniuse.com/?search=dual-source-blending:
    // await UWAL.SetRequiredFeatures("dual-source-blending");

    /** @type {Renderer} */ let Renderer, texturesLoaded = false;

    /**
     * @param {SDFText} text
     * @param {string} src
     * @returns Promise<void>
     */
    const loadFontTexture = (text, src) => new Promise(resolve =>
    {
        const texture = new Image(); texture.src = src;
        texture.onload = () => text.SetFontTexture(texture).then(resolve);
    });

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Text Rendering"));
    }
    catch (error)
    {
        alert(error);
    }

    const { module, entry, target } = await SDFText.GetFragmentStateParams(Renderer);

    const layout = Renderer.CreateVertexBufferLayout(
        ["position", "texture", "size"], void 0, "textVertex"
    );

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, "textVertex", layout),
        fragment: Renderer.CreateFragmentState(module, entry, target)
    });

    const Title = new SDFText({
        color: new Color(0x005a9c),
        background: new Color(),
        renderer: Renderer,
        font: BoldData,
        size: 144
    });

    const Subtitle = new SDFText({
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
        texturesLoaded = true;
        Title.Render(false);
        Subtitle.Render();
    });

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);

            if (!texturesLoaded) return;
            Title.Resize(); Subtitle.Resize();
            Title.Render(false); Subtitle.Render();
        }
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
