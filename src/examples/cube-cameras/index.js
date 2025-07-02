/**
 * @example Cube / Cameras
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import Dice from "/assets/images/dice.jpg";
import { vec3, mat4 } from "wgpu-matrix";
import Cube from "./Cube.wgsl";

import {
    Color,
    Utils,
    Device,
    TEXTURE,
    CubeGeometry,
    PerspectiveCamera,
    OrthographicCamera
} from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUTexture} */ let texture;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.RenderPipeline(
            canvas, "Cube / Cameras"
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const perspectiveCamera = new PerspectiveCamera();
    const perspectiveCube = new CubeGeometry(Renderer);

    const orthographicCamera = new OrthographicCamera();
    const orthographicCube = new CubeGeometry(Renderer);

    const Texture = new (await Device.Texture(Renderer));
    const source = await Texture.CreateBitmapImage(
        await (await fetch(Dice)).blob(),
        { colorSpaceConversion: "none" }
    );

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x194c33).rgba;

    texture = Texture.CreateTextureFromSource(source);
    const module = Renderer.CreateShaderModule(Cube);
    Texture.CopyImageToTexture(source, { texture });

    Renderer.CreatePassDescriptor(
        colorAttachment,
        void 0,
        Renderer.CreateDepthAttachment()
    );

    Renderer.CreatePipeline({
        primitive: { cullMode: "back" },
        fragment: Renderer.CreateFragmentState(module),
        multisample: Renderer.CreateMultisampleState(),
        depthStencil: Renderer.CreateDepthStencilState(),
        vertex: Renderer.CreateVertexState(module, void 0, [
            Renderer.CreateVertexBufferLayout(perspectiveCube.PositionAttribute),
            Renderer.CreateVertexBufferLayout("textureCoord")
        ])
    });

    Renderer.AddBindGroups([
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR }),
                texture.createView(),
                { buffer: perspectiveCube.TransformBuffer }
            ])
        ),

        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR }),
                texture.createView(),
                { buffer: orthographicCube.TransformBuffer }
            ])
        )]
    );

    perspectiveCamera.Position = [0, -2, 8]; perspectiveCamera.LookAt([0, 0, 0]);
    const viewProjection = perspectiveCamera.UpdateViewProjection(false);
    const uvBuffer = Renderer.CreateVertexBuffer(perspectiveCube.UV);

    Renderer.WriteBuffer(uvBuffer, perspectiveCube.UV);
    orthographicCube.AddVertexBuffers(uvBuffer);
    perspectiveCube.AddVertexBuffers(uvBuffer);

    const orthographicPosition = vec3.create();
    const orthographicRotation = vec3.create();
    const orthographicScale = vec3.create();

    const perspectivePosition = vec3.create();
    const perspectiveRotation = vec3.create();
    const perspectiveScale = vec3.create();

    function render()
    {
        raf = requestAnimationFrame(render);

        // Perspective View:
        {
            const transform = perspectiveCube.Transform;
            mat4.copy(viewProjection, transform);
            mat4.translate(transform, perspectivePosition, transform);

            mat4.rotateX(transform, perspectiveRotation[0], transform);
            mat4.rotateY(transform, perspectiveRotation[1], transform);
            mat4.rotateZ(transform, perspectiveRotation[2], transform);

            mat4.scale(transform, perspectiveScale, transform);
            Renderer.SetActiveBindGroups(0);
            perspectiveCube.Render(false);
        }

        // Orthographic View:
        {
            const transform = orthographicCube.Transform;
            mat4.copy(orthographicCamera.Projection, transform);
            mat4.translate(transform, orthographicPosition, transform);

            mat4.rotateX(transform, orthographicRotation[0], transform);
            mat4.rotateY(transform, orthographicRotation[1], transform);
            mat4.rotateZ(transform, orthographicRotation[2], transform);

            mat4.scale(transform, orthographicScale, transform);
            Renderer.SetActiveBindGroups(1);
            orthographicCube.Render();
        }
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);

            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            perspectiveCamera.AspectRatio = Renderer.AspectRatio;
            perspectiveCamera.UpdateViewProjection(false);

            orthographicCamera.Bottom = blockSize;
            orthographicCamera.Right = width;
            orthographicCamera.Near = -100;

            const p = (width - 360) / 1272;
            const ox = p * 245 + 110;
            const ps = p * 0.5 + 0.5;
            const os = p * 80 + 30;
            const px = p * -3 - 1;
            const py = p * -1 - 1;
            const r = p * -0.05;

            vec3.set(ps, ps, ps, perspectiveScale);
            vec3.set(px, py, 0, perspectivePosition);
            vec3.set(0.35, 0, r, perspectiveRotation);

            vec3.set(os, os, os, orthographicScale);
            vec3.set(3.49, -0.35, 0, orthographicRotation);
            const oy = (1 - (p * 0.13 + 0.61)) * blockSize;
            vec3.set(width - ox, blockSize - oy, 0, orthographicPosition);
        }

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy(
        undefined,
        texture
    );
}
