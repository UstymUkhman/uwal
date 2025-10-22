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

    // alpha & scale (4) + color (4) + transform (16) + x & y (2):
    const bufferOffset = Float32Array.BYTES_PER_ELEMENT * 6 + 2;
    const start = Float32Array.BYTES_PER_ELEMENT * bufferOffset;
    const charDelays = [], charIndexes = [], charBuffers = [];

    const { offsetWidth, offsetHeight } = canvas;
    const lines = Math.ceil(offsetHeight / 20) /* + 3 */;
    const charWidth = offsetWidth / 12.0;
    const chars = Math.ceil(charWidth) /* + 1 */;

    async function createCharGrid()
    {
        const font = await Characters.LoadFont(FontURL, true);
        const ids = Array.from({ length: Font.chars.length })
            .map((_, c) => Font.chars[c].id);

        const length = lines * chars;
        const x = charWidth / 15.35;

        for (let i = 0; i < length; ++i)
        {
            const c = i % chars, r = i / chars | 0;

            charDelays.push(MathUtils.RandomInt(1, 240));
            charIndexes.push(MathUtils.RandomInt(0, 90));

            charBuffers.push(Characters.Write(String.fromCharCode(ids[charIndexes[i]]), font, color, 0.005));
            Characters.SetTransform(MathUtils.Mat4.translation([-x + c * 0.125, 4.65 - r * 0.2, -8]), charBuffers[i]);
        }
    }

    color.Set(0x5e81ac, 0x40);
    await createCharGrid();
    color.Set(0x88c0d0);

    const m = { x: 0.5, y: 0.5 };
    const { Pipeline } = Characters;
    const col = new Float32Array(color.rgba);

    function render()
    {
        Renderer.Render();
        requestAnimationFrame(render);
        const { AspectRatio } = Renderer;

        for (let d = 0, length = charDelays.length; d < length; ++d)
        {
            let minDelay = 120, maxDelay = 240;
            const y = (d / chars | 0) / lines;
            const x = (d % chars) / chars;

            let dx = m.x - x;
            dx *= AspectRatio;
            const dy = m.y - y;
            let dist = dx * dx + dy * dy;

            if (dist < 0.02)
            {
                dist = (0.02 - dist) * 50;

                minDelay -= dist * (minDelay * 0.5) | 0;
                maxDelay -= dist * (maxDelay * 0.5) | 0;

                col[3] = MathUtils.SmoothStep(dist) + 0.1;
                charDelays[d] -= dist * charDelays[d] - 1 | 0;

                // Update the color directly in the buffer:
                Pipeline.WriteBuffer(charBuffers[d], col, 16, 1, 4);
            }

            if (!--charDelays[d])
            {
                charIndex[0] = MathUtils.RandomInt(0, 90);
                charDelays[d] = MathUtils.RandomInt(minDelay, maxDelay);

                // Update the character index directly in the buffer:
                Pipeline.WriteBuffer(charBuffers[d], charIndex, start, 0, 1);
            }
        }
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Characters.UpdatePerspective(Camera);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
