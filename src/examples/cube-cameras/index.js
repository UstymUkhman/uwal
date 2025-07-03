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

    const tempPosition = vec3.create();
    const tempRotation = vec3.create();

    let dropTimeout, dropTime = Infinity;
    let nextPerspectiveY, nextOrthographicY;

    const nextPerspectiveRotation = vec3.create();
    const nextOrthographicRotation = vec3.create();

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

    const basePerspectivePosition = vec3.create();
    const basePerspectiveRotation = vec3.create();
    const perspectivePosition = vec3.create();
    const perspectiveRotation = vec3.create();
    const perspectiveScale = vec3.create();

    const baseOrthographicPosition = vec3.create();
    const orthographicPosition = vec3.create();
    const orthographicRotation = vec3.create();
    const orthographicScale = vec3.create();

    function randomInt(min = -2, max = 2)
    {
        return ((Math.random() * (max - min + 1)) | 0) + min;
    }

    function lerp(v1, v2, t)
    {
        return v1 + t * (v2 - v1);
    }

    function clean()
    {
        dropTime = Infinity;
        clearTimeout(dropTimeout);
        cancelAnimationFrame(raf);
    }

    function drop()
    {
        dropTimeout = setTimeout(() =>
        {
            let x = randomInt() || Infinity;
            const y = randomInt() || Infinity;

            nextPerspectiveRotation[0] = Math.PI / x;
            nextPerspectiveRotation[1] = Math.PI / y;
            nextPerspectiveRotation[2] = Math.PI / (randomInt() || Infinity);

            const s = ((Math.abs(y) === 1 || !isFinite(y))
                && -(x === -2 || !isFinite(x)) * 2 + 1 || Math.sign(y)) * (isFinite(y) * 2 - 1);

            nextPerspectiveRotation[0] += basePerspectiveRotation[0];
            nextPerspectiveRotation[1] += basePerspectiveRotation[1];
            nextPerspectiveRotation[2] += basePerspectiveRotation[2] * s;

            x = randomInt() || Infinity;

            nextOrthographicRotation[0] = Math.PI / x + 0.35;
            nextOrthographicRotation[1] = !isFinite(x) && 0.35 || Math.abs(x) < 2 && -0.35 || 0;
            nextOrthographicRotation[2] = Math.abs(x) === 2 && Math.sign(x) * -0.35 || 0;

            nextOrthographicRotation[1] &&= nextOrthographicRotation[1] + Math.PI / (randomInt() || Infinity);
            nextOrthographicRotation[2] &&= nextOrthographicRotation[2] + Math.PI / (randomInt() || Infinity);

            dropTime = Date.now();
        }, 1e3);
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        time = (Date.now() - dropTime) / 1e3;

        const smoothTime = Utils.SmoothStep(time);
        let smootherTime = Utils.SmootherStep(time * 2);

        if (0.5 <= smoothTime)
        {
            smootherTime = (0.5 - (smoothTime - 0.5)) * 2;

            if (smoothTime === 1)
            {
                vec3.copy(nextOrthographicRotation, orthographicRotation);
                vec3.copy(nextPerspectiveRotation, perspectiveRotation);
                dropTime = Infinity;
                drop();
            }
        }

        // Perspective View:
        {
            const transform = perspectiveCube.Transform;
            mat4.copy(viewProjection, transform);
            vec3.copy(perspectivePosition, tempPosition);

            tempPosition[1] = lerp(perspectivePosition[1], nextPerspectiveY, smootherTime);
            mat4.translate(transform, tempPosition, transform);

            tempRotation[0] = lerp(perspectiveRotation[0], nextPerspectiveRotation[0], smoothTime);
            tempRotation[1] = lerp(perspectiveRotation[1], nextPerspectiveRotation[1], smoothTime);
            tempRotation[2] = lerp(perspectiveRotation[2], nextPerspectiveRotation[2], smoothTime);

            mat4.rotateX(transform, tempRotation[0], transform);
            mat4.rotateY(transform, tempRotation[1], transform);
            mat4.rotateZ(transform, tempRotation[2], transform);

            mat4.scale(transform, perspectiveScale, transform);
            Renderer.SetActiveBindGroups(0);
            perspectiveCube.Render(false);
        }

        // Orthographic View:
        {
            const transform = orthographicCube.Transform;
            mat4.copy(orthographicCamera.Projection, transform);
            vec3.copy(orthographicPosition, tempPosition);

            tempPosition[1] = lerp(orthographicPosition[1], nextOrthographicY, smootherTime);
            mat4.translate(transform, tempPosition, transform);

            tempRotation[0] = lerp(orthographicRotation[0], nextOrthographicRotation[0], smoothTime);
            tempRotation[1] = lerp(orthographicRotation[1], nextOrthographicRotation[1], smoothTime);
            tempRotation[2] = lerp(orthographicRotation[2], nextOrthographicRotation[2], smoothTime);

            mat4.rotateX(transform, tempRotation[0], transform);
            mat4.rotateY(transform, tempRotation[1], transform);
            mat4.rotateZ(transform, tempRotation[2], transform);

            mat4.scale(transform, orthographicScale, transform);
            Renderer.SetActiveBindGroups(1);
            orthographicCube.Render();
        }
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, height);

            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            perspectiveCamera.AspectRatio = Renderer.AspectRatio;
            perspectiveCamera.UpdateViewProjection(false);

            orthographicCamera.Bottom = height;
            orthographicCamera.Right = width;
            orthographicCamera.Near = -100;

            const p = (width - 360) / 1272;
            const ox = p * 245 + 110;
            const ps = p * 0.5 + 0.5;
            const os = p * 80 + 30;
            const px = p * -3 - 1;
            const py = p * -1 - 1;
            const pr = p * -0.05;

            vec3.set(ps, ps, ps, perspectiveScale);
            vec3.set(px, py, 0, basePerspectivePosition);
            vec3.set(0.35, 0, pr, basePerspectiveRotation);

            const hf = 1 - (p * 0.13 + 0.61);
            const oy = hf * height;
            nextPerspectiveY = py * -1;
            nextOrthographicY = height - oy - (hf * width);

            vec3.set(os, os, os, orthographicScale);
            vec3.set(0.35, 0.35, 0, orthographicRotation);
            vec3.set(width - ox, height - oy, 0, baseOrthographicPosition);

            vec3.copy(baseOrthographicPosition, orthographicPosition);
            vec3.copy(basePerspectivePosition, perspectivePosition);
            vec3.copy(basePerspectiveRotation, perspectiveRotation);
        }

        clean(); drop(); raf = requestAnimationFrame(render);
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy(
        undefined,
        texture
    );
}
