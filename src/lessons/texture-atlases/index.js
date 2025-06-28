/**
 * @module Texture Atlases
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html#texture-atlases}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import { Device, PerspectiveCamera } from "#/index";
import { mat4 } from "wgpu-matrix";
import createVertices from "./F";
import Atlas from "./Atlas.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.RenderPipeline(
            canvas, "Texture Atlases", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const radToDegOptions =
    {
        min: -360,
        max: 360,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const UP = [0, 1, 0];
    const rows = 5, columns = 5;
    const Fs = 5 * 5 + 1, radius = 200;

    const Camera = new PerspectiveCamera(60, 1, 2000);
    const settings = { target: [0, 200, 300], targetAngle: 0 };
    const objectUniforms = [], gui = new GUI().onChange(render);

    gui.add(settings.target, "1", -100, 300).name("Target Height");
    gui.add(settings, "targetAngle", radToDegOptions).name("Target Angle");

    const { vertexData, vertices } = createVertices();
    const module = Renderer.CreateShaderModule(Atlas);

    const { layout, buffer: vertexBuffer } = Renderer.CreateVertexBuffer([
        { name: "position", format: "float32x3" },
        { name: "color", format: "unorm8x4" }
        // "textureCoord"
    ], vertices);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, void 0, layout),
        depthStencil: Renderer.CreateDepthStencilState(),
        fragment: Renderer.CreateFragmentState(module),
        primitive: { cullMode: "back" }
    });

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        void 0,
        Renderer.CreateDepthAttachment()
    );

    Renderer.WriteBuffer(vertexBuffer, vertexData);
    Renderer.SetVertexBuffers(vertexBuffer);

    for (let f = 0; f < Fs; ++f)
    {
        const Uniforms = Renderer.CreateUniformBuffer("projection");

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries(
                    { buffer: Uniforms.buffer }
                )
            )
        );

        objectUniforms.push(Uniforms);
    }

    function render()
    {
        // Update target's X and Z position based on the angle:
        settings.target[0] = Math.cos(settings.targetAngle) * radius;
        settings.target[2] = Math.sin(settings.targetAngle) * radius;

        // Compute a camera matrix based on its position:
        Camera.Position = [-500, 300, -500];

        // Update camera's view matrix by looking at the target "F":
        Camera.LookAt([0, -100, 0]);

        // Combine the view and projection matrices (without updating the first one):
        const viewProjectionMatrix = Camera.UpdateViewProjection(false);

        objectUniforms.forEach(({ projection, buffer }, f) =>
        {
            if (f === 25)
                mat4.translate(viewProjectionMatrix, settings.target, projection);

            else
            {
                // Compute grid and UV positions:
                const u = (f % rows) / (rows - 1);
                const v = (f / rows | 0) / (columns - 1);

                // Center and spread out the "F"s:
                const x = (u - 0.5) * rows * 150;
                const z = (v - 0.5) * columns * 150;

                // Aim current F toward the target "F":
                const aim = mat4.aim([x, 0, z], settings.target, UP);
                mat4.multiply(viewProjectionMatrix, aim, projection);
            }

            Renderer.WriteBuffer(buffer, projection);
            Renderer.SetActiveBindGroups(f);
            Renderer.Render(vertices, false);
        });

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = inlineSize / blockSize;
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
