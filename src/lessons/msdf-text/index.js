import { Device, PerspectiveCamera, MSDFText, MathUtils, Color } from "#/index";
import FontURL from "/assets/fonts/ShareTechMono.json?url";
import Font from "/assets/fonts/ShareTechMono.json";

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

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    async function createCharGrid()
    {
        const font = await Characters.LoadFont(FontURL);
        const ids = Array.from({ length: Font.chars.length })
            .map((_, c) => Font.chars[c].id);

        for (let l = 0, lines = canvas.offsetHeight / 24; l < lines; ++l)
        {
            lineDelays.push([]);
            lineIndexes.push([]);

            for (let c = 0; c < 80; ++c)
            {
                lineDelays[l].push(MathUtils.RandomInt(1, 240));
                lineIndexes[l].push(MathUtils.RandomInt(0, 93));
            }

            lineBuffers.push(Characters.Write(lineIndexes[l].map(i => String.fromCharCode(ids[i])).join(""), font));
            Characters.SetTransform(MathUtils.Mat4.translation([-9.42, 4.5 - l * 0.4, -8]), lineBuffers[l]);
            Characters.SetColor(new Color(0x00cc00, void 0, void 0, 0x40), lineBuffers[l]);
        }

        return lineBuffers[0].size;
    }

    const Characters = new MSDFText();
    const Camera = new PerspectiveCamera();
    await Characters.CreateRenderPipeline(Renderer);

    let bufferSize = await createCharGrid();
    bufferSize /= Float32Array.BYTES_PER_ELEMENT;

    // 6 is: scale (1) + color (1) + transform (4):
    const bufferOffset = Float32Array.BYTES_PER_ELEMENT * 6;
    const lineDelays = [], lineIndexes = [], lineBuffers = [];

    const start = Float32Array.BYTES_PER_ELEMENT * bufferOffset;
    const lines = lineBuffers.map(() => new Float32Array(bufferSize));

    function render()
    {
        Renderer.Render();
        requestAnimationFrame(render);

        for (let l = 0, length = lines.length; l < length; ++l)
        {
            const line = lines[l], charDelays = lineDelays[l], charIndexes = lineIndexes[l];

            for (let c = 0, o = 0, l = charIndexes.length; c < l; ++c, o += 4)
            {
                if (!--charDelays[c])
                {
                    charIndexes[c] = MathUtils.RandomInt(0, 93);
                    charDelays[c] = MathUtils.RandomInt(120, 240);
                }

                line[o] = c * 24; line[o + 1] = 0;
                line[o + 2] = charIndexes[c];
            }

            Characters.Pipeline.WriteBuffer(lineBuffers[l], line, start, 0, bufferSize - bufferOffset);
        }
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Characters.UpdateFromCamera(Camera);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
