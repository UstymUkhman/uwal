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
    const tempRotation = MathUtils.Vec3.create();

    const perspectiveCube = new Mesh(CubeGeometry);
    const orthographicCube = new Mesh(CubeGeometry);

    const perspectiveCamera = new PerspectiveCamera();
    const orthographicCamera = new OrthographicCamera();

    const orthographicPosition = MathUtils.Vec3.create();
    const orthographicRotation = MathUtils.Vec3.create();

    const nextPerspectiveRotation  = MathUtils.Vec3.create();
    const nextOrthographicRotation = MathUtils.Vec3.create();
    const initialPerspectiveRotation = MathUtils.Vec3.create();

    const module = CubePipeline.CreateShaderModule([Shaders.CubeVertex, Cube]);

    const { buffer: textureCoordsBuffer, layout: textureCoordsLayout } =
        CubeGeometry.CreateTextureCoordsBuffer(CubePipeline, void 0, void 0, "cubeVertex");

    await Renderer.AddPipeline(CubePipeline, {
        primitive: CubePipeline.CreatePrimitiveState(),
        fragment: CubePipeline.CreateFragmentState(module, void 0, void 0, "cubeFragment"),
        multisample: CubePipeline.CreateMultisampleState(),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        vertex: CubePipeline.CreateVertexState(module, [
            CubeGeometry.GetPositionBufferLayout(CubePipeline),
            textureCoordsLayout
        ], void 0, "cubeVertex")
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
                MathUtils.Vec3.copy(nextPerspectiveRotation, initialPerspectiveRotation);
                MathUtils.Vec3.copy(nextOrthographicRotation, orthographicRotation);
                dropTime = Infinity;
                drop();
            }
        }

        // Perspective View:
        {
            const [rx, ry, rz] = initialPerspectiveRotation;

            tempRotation[0] = MathUtils.Lerp(rx, nextPerspectiveRotation[0], smoothTime);
            tempRotation[1] = MathUtils.Lerp(ry, nextPerspectiveRotation[1], smoothTime);
            tempRotation[2] = MathUtils.Lerp(rz, nextPerspectiveRotation[2], smoothTime);

            perspectiveCube.Transform = [[0, MathUtils.Lerp(0, 4, smootherTime), 0], tempRotation];
            perspectiveCube.UpdateWorldMatrix(); // Will be updated by the scene.
            perspectiveCube.UpdateProjectionMatrix(perspectiveCamera.ViewProjectionMatrix);

            CubePipeline.SetActiveBindGroups(0);
            Renderer.Render(false);
        }

        // Orthographic View:
        {
            const [px, py, pz] = orthographicPosition;
            const [rx, ry, rz] = orthographicRotation;

            tempRotation[0] = MathUtils.Lerp(rx, nextOrthographicRotation[0], smoothTime);
            tempRotation[1] = MathUtils.Lerp(ry, nextOrthographicRotation[1], smoothTime);
            tempRotation[2] = MathUtils.Lerp(rz, nextOrthographicRotation[2], smoothTime);

            orthographicCube.Transform = [[px, MathUtils.Lerp(py, nextOrthoY, smootherTime), pz], tempRotation];
            orthographicCube.UpdateWorldMatrix(); // Will be updated by the scene.
            orthographicCube.UpdateProjectionMatrix(orthographicCamera.ProjectionMatrix);

            CubePipeline.SetActiveBindGroups(1);
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

            perspectiveCube.Scaling = [s, s, s];
            const os = (1 - (height - 1e3) / -400) * 36 + 72;
            orthographicCube.Scaling = [os * s, os * s, os * s];

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
