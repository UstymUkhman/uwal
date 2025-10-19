import { Device, PerspectiveCamera, MSDFText, MathUtils, Color } from "#/index";
import FontURL from "/assets/fonts/Matrix-Code-NFI.json?url";
import Font from "/assets/fonts/Matrix-Code-NFI.json";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "MSDF Text"));
    }
    catch (error)
    {
        alert(error);
    }

    const color = new Color(0x2e3440);
    const Characters = new MSDFText();
    const charIndex = new Float32Array(1);
    const Camera = new PerspectiveCamera();

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(color),
        Renderer.CreateDepthStencilAttachment()
    );

    await Characters.CreateRenderPipeline(Renderer);

    // alpha & scale (4) + color (4) + transform (16) + x (1) + y (1):
    const bufferOffset = Float32Array.BYTES_PER_ELEMENT * 6 + 2;
    const start = Float32Array.BYTES_PER_ELEMENT * bufferOffset;
    const charDelays = [], charIndexes = [], charBuffers = [];

    async function createCharGrid()
    {
        const { offsetWidth, offsetHeight } = canvas;
        const font = await Characters.LoadFont(FontURL, true);
        const ids = Array.from({ length: Font.chars.length })
            .map((_, c) => Font.chars[c].id);

        // const charWidth = offsetWidth / 12, x = charWidth / 16;
        const charWidth = offsetWidth / 24, x = charWidth / 8;
        // const lines = Math.ceil(offsetHeight / 20);
        const lines = Math.ceil(offsetHeight / 40);
        const chars = Math.ceil(charWidth);
        const length = lines * chars;

        for (let i = 0; i < length; ++i)
        {
            const c = i % chars, r = i / chars | 0;

            charDelays.push(MathUtils.RandomInt(1, 240));
            charIndexes.push(MathUtils.RandomInt(0, 90));

            charBuffers.push(Characters.Write(String.fromCharCode(ids[charIndexes[i]]), font, color));
            // charBuffers.push(Characters.Write(String.fromCharCode(ids[charIndexes[i]]), font, color, 0.005));
            Characters.SetTransform(MathUtils.Mat4.translation([-x + c * 0.25, 4.65 - r * 0.4, -8]), charBuffers[i]);
            // Characters.SetTransform(MathUtils.Mat4.translation([-x + c * 0.125, 4.65 - r * 0.2, -8]), charBuffers[i]);
        }
    }

    color.Set(0x5e81ac);
    await createCharGrid();

    function render()
    {
        Renderer.Render();
        requestAnimationFrame(render);

        for (let d = 0, length = charDelays.length; d < length; ++d)
        {
            if (--charDelays[d]) continue;
            charIndex[0] = MathUtils.RandomInt(0, 90);
            charDelays[d] = MathUtils.RandomInt(120, 240);
            Characters.Pipeline.WriteBuffer(charBuffers[d], charIndex, start, 0, 1);
        }
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Characters.UpdateFromPerspectiveCamera(Camera);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
