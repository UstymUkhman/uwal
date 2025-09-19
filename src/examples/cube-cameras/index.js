/**
 * @example Cube / Cameras
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import Dice from "/assets/images/dice.jpg";
import Cube from "./Cube.wgsl";

import {
    Mesh,
    Color,
    Device,
    TEXTURE,
    Shaders,
    MathUtils,
    Geometries,
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
        Renderer = new (await Device.Renderer(canvas, "Cube / Cameras"));
    }
    catch (error)
    {
        alert(error);
    }

    let orthoRotation, nextOrthoY;
    let dropTimeout, dropTime = Infinity;

    const CubeGeometry = new Geometries.Cube();
    const CubePipeline = new Renderer.Pipeline();

    const tempPosition = MathUtils.Vec3.create();
    const tempRotation = MathUtils.Vec3.create();

    const perspectiveCube = new Mesh(CubeGeometry);
    const orthographicCube = new Mesh(CubeGeometry);

    const perspectiveCamera = new PerspectiveCamera();
    const orthographicCamera = new OrthographicCamera();

    const perspectiveScale    = MathUtils.Vec3.create();
    const perspectivePosition = MathUtils.Vec3.create();
    const perspectiveRotation = MathUtils.Vec3.create();

    const orthographicScale    = MathUtils.Vec3.create();
    const orthographicPosition = MathUtils.Vec3.create();
    const orthographicRotation = MathUtils.Vec3.create();

    const nextPerspectiveRotation  = MathUtils.Vec3.create();
    const nextOrthographicRotation = MathUtils.Vec3.create();

    const fragmentEntry = [undefined, undefined, "cubeFragment"];
    const viewProjection = perspectiveCamera.UpdateViewProjectionMatrix();
    const module = CubePipeline.CreateShaderModule([Shaders.CubeVertex, Cube]);

    const { buffer: textureCoordsBuffer, layout: textureCoordsLayout } =
        CubeGeometry.CreateTextureCoordsBuffer(CubePipeline, void 0, void 0, "cubeVertex");

    await Renderer.AddPipeline(CubePipeline, {
        primitive: CubePipeline.CreatePrimitiveState(),
        fragment: CubePipeline.CreateFragmentState(module, ...fragmentEntry),
        multisample: CubePipeline.CreateMultisampleState(),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        vertex: CubePipeline.CreateVertexState(module, [
            CubeGeometry.GetPositionBufferLayout(CubePipeline),
            textureCoordsLayout
        ], undefined, "cubeVertex")
    });

    orthographicCube.SetRenderPipeline(CubePipeline, false);
    perspectiveCube.SetRenderPipeline(CubePipeline, false);

    const Texture = new (await Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(Dice);
    texture = await Texture.CopyImageToTexture(source);

    CubePipeline.SetBindGroupFromResources([
        perspectiveCube.ProjectionBuffer,
        Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR }),
        texture.createView()
    ]);

    CubePipeline.AddBindGroupFromResources([
        orthographicCube.ProjectionBuffer,
        Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR }),
        texture.createView()
    ]);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(new Color(0x194c33)),
        Renderer.CreateDepthStencilAttachment()
    );

    CubePipeline.AddVertexBuffers(textureCoordsBuffer);
    CubePipeline.AddVertexBuffers(textureCoordsBuffer);

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
            const rotationY = -orthoRotation || 0;

            const x = MathUtils.RandomInt(-2, 2) || Infinity;
            const y = MathUtils.RandomInt(-2, 2) || Infinity;
            const z = MathUtils.RandomInt(-2, 2) || Infinity;

            nextPerspectiveRotation[0] = Math.PI / x;
            nextPerspectiveRotation[1] = Math.PI / y;
            nextPerspectiveRotation[2] = Math.PI / z;

            nextOrthographicRotation[0] = Math.PI / x + orthoRotation;
            nextOrthographicRotation[1] = !isFinite(x) && orthoRotation || Math.abs(x) < 2 && rotationY;
            nextOrthographicRotation[2] = Math.abs(x) === 2 && Math.sign(x) * rotationY;

            nextOrthographicRotation[1] &&= nextOrthographicRotation[1] + Math.PI / y;
            nextOrthographicRotation[2] &&= nextOrthographicRotation[2] + Math.PI / z;

            dropTime = Date.now();
        }, 1e3);
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        time = (Date.now() - dropTime) / 1e3;

        const smoothTime = MathUtils.SmoothStep(time);
        let smootherTime = MathUtils.SmootherStep(time * 2);

        if (0.5 <= smoothTime)
        {
            smootherTime = (0.5 - (smoothTime - 0.5)) * 2;

            if (smoothTime === 1)
            {
                MathUtils.Vec3.copy(nextOrthographicRotation, orthographicRotation);
                MathUtils.Vec3.copy(nextPerspectiveRotation, perspectiveRotation);
                dropTime = Infinity;
                drop();
            }
        }

        // Perspective View:
        {
            const projection = perspectiveCube.Projection;
            MathUtils.Mat4.copy(viewProjection, projection);
            MathUtils.Vec3.copy(perspectivePosition, tempPosition);

            tempPosition[1] = MathUtils.Lerp(perspectivePosition[1], 4, smootherTime);
            MathUtils.Mat4.translate(projection, tempPosition, projection);

            tempRotation[0] = MathUtils.Lerp(perspectiveRotation[0], nextPerspectiveRotation[0], smoothTime);
            tempRotation[1] = MathUtils.Lerp(perspectiveRotation[1], nextPerspectiveRotation[1], smoothTime);
            tempRotation[2] = MathUtils.Lerp(perspectiveRotation[2], nextPerspectiveRotation[2], smoothTime);

            MathUtils.Mat4.rotateX(projection, tempRotation[0], projection);
            MathUtils.Mat4.rotateY(projection, tempRotation[1], projection);
            MathUtils.Mat4.rotateZ(projection, tempRotation[2], projection);

            MathUtils.Mat4.scale(projection, perspectiveScale, projection);
            CubePipeline.SetActiveBindGroups(0);
            perspectiveCube.Update();
            Renderer.Render(false);
        }

        // Orthographic View:
        {
            const projection = orthographicCube.Projection;
            MathUtils.Vec3.copy(orthographicPosition, tempPosition);
            MathUtils.Mat4.copy(orthographicCamera.ProjectionMatrix, projection);

            tempPosition[1] = MathUtils.Lerp(orthographicPosition[1], nextOrthoY, smootherTime);
            MathUtils.Mat4.translate(projection, tempPosition, projection);

            tempRotation[0] = MathUtils.Lerp(orthographicRotation[0], nextOrthographicRotation[0], smoothTime);
            tempRotation[1] = MathUtils.Lerp(orthographicRotation[1], nextOrthographicRotation[1], smoothTime);
            tempRotation[2] = MathUtils.Lerp(orthographicRotation[2], nextOrthographicRotation[2], smoothTime);

            MathUtils.Mat4.rotateX(projection, tempRotation[0], projection);
            MathUtils.Mat4.rotateY(projection, tempRotation[1], projection);
            MathUtils.Mat4.rotateZ(projection, tempRotation[2], projection);

            MathUtils.Mat4.scale(projection, orthographicScale, projection);
            CubePipeline.SetActiveBindGroups(1);
            orthographicCube.Update();
            Renderer.Render();
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
            perspectiveCamera.Position = [width / 360, 2, 8];
            perspectiveCamera.UpdateViewProjectionMatrix();

            orthographicCamera.Bottom = height;
            orthographicCamera.Right = width;
            orthographicCamera.Near = -100;

            const oy = height - height / 3.6;
            const nw = (width - 360) / 1320;
            orthoRotation = nw * 0.2 + 0.1;
            nextOrthoY = oy * 0.39;
            const s = nw + 1;

            MathUtils.Vec3.set(s, s, s, perspectiveScale);
            MathUtils.Vec3.set(0, 0, 0, perspectivePosition);
            const os = (1 - (height - 1e3) / -400) * 36 + 72;

            MathUtils.Vec3.set(os * s, os * s, os * s, orthographicScale);
            MathUtils.Vec3.set(0.2, orthoRotation, 0, orthographicRotation);
            MathUtils.Vec3.set(width - (nw * 250 + 100), oy, 0, orthographicPosition);
        }

        clean(); drop(); raf = requestAnimationFrame(render);
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy(
        undefined,
        texture
    );
}
