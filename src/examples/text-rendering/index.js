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
import { UWAL, Shaders, Color, Text } from "@/index";
import { mat3 } from "wgpu-matrix";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {Renderer} */ let Renderer;

    canvas.style.position = "absolute";
    canvas.style.height = `${400}px`;
    canvas.style.width = `${700}px`;
    canvas.style.top = "115.875px";
    canvas.style.left = "241.5px";

    // const availableFeatures = await UWAL.SetRequiredFeatures("dual-source-blending");

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Text Rendering"));
    }
    catch (error)
    {
        alert(error);
    }

    const module = Renderer.CreateShaderModule(Shaders.Text);

    // const color = Renderer.CreateBlendComponent("add", "one", "one-minus-src1");
    // const target = Renderer.CreateTargetState(void 0, { color, alpha: {} });

    const layout = Renderer.CreateVertexBufferLayout(
        ["position", "texture", "size"], void 0, "textVertex"
    );

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0xffffff).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module, "textFragment" /*, target */),
        vertex: Renderer.CreateVertexState(module, "textVertex", layout)
    });

    let text, textUniform;

    const boldTexture = new Image();
    boldTexture.src = BoldTexture;

    boldTexture.onload = async () =>
    {
        const fontColor = new Color();

        text = new Text({
            renderer: Renderer,
            color: fontColor,
            font: BoldData,
            lineGap: 0.2,
            size: 144
        });

        await text.SetFontTexture(boldTexture);
        textUniform = text.Write("UWAL", [-150, 0]);

        render();
    };

    function render()
    {
        const pr = Renderer.DevicePixelRatio;
        const cw = Math.round(pr * canvas.width * 0.5) * 2;
        const ch = Math.round(pr * canvas.height * 0.5) * 2;

        let dx = Math.round(-0.5 * textUniform.rectangle[2]);
        let dy = Math.round( 0.5 * textUniform.rectangle[3]);

        let ws = 2.0 / cw;
        let hs = 2.0 / ch;

        textUniform.transform = mat3.create(
            ws,       0,         0,
            0,        hs,        0,
            dx * ws,  dy * hs,   1
        );

        Renderer.WriteBuffer(textUniform.buffer, textUniform.transform.buffer);

        text.Render();
    }

    observer = new ResizeObserver(entries =>
    {
        /* for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        } */

        Renderer.SetCanvasSize(700, 400);
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
