/**
 * @example Cube / Cameras
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.3.0
 * @license MIT
 */

import Dice from "/assets/images/dice.jpg";
import Cube from "./Cube.wgsl";

import {
    Mesh,
    Color,
    Scene,
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
/** @type {Scene} */ const scene = new Scene();

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

    const CubePipeline = new Renderer.Pipeline();
    const tempRotation = MathUtils.Vec3.create();

    const perspectiveCamera = new PerspectiveCamera();
    const orthographicCamera = new OrthographicCamera();

    const orthographicPosition = MathUtils.Vec3.create();
    const orthographicRotation = MathUtils.Vec3.create();

    const CubeGeometry = new Geometries.Mesh("Cube", "uint16");
    CubeGeometry.Primitive = Geometries.Primitives.cube();

    const perspectiveCube = new Mesh(CubeGeometry, null);
    const orthographicCube = new Mesh(CubeGeometry, null);

    const initialPerspectiveRotation = MathUtils.Vec3.create();
    const nextPerspectiveRotation  = MathUtils.Vec3.create();
    const nextOrthographicRotation = MathUtils.Vec3.create();

    const Texture = new (await Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(Dice);
    texture = await Texture.CopyImageToTexture(source);

    const module = CubePipeline.CreateShaderModule([Shaders.MeshVertex, Cube]);
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new Color(0x194c33)));

    await Renderer.AddPipeline(CubePipeline, {
        primitive: CubePipeline.CreatePrimitiveState(),
        multisample: CubePipeline.CreateMultisampleState(),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        fragment: CubePipeline.CreateFragmentState(module),
        vertex: CubePipeline.CreateVertexState(module, [
            CubeGeometry.GetPositionBufferLayout(CubePipeline, "vertexUV"),
            CubePipeline.CreateVertexBufferLayout("uv", "vertexUV")
        ], "vertexUV")
    });

    orthographicCube.SetRenderPipeline(CubePipeline, [
        Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR }),
        texture.createView()
    ]);

    perspectiveCube.SetRenderPipeline(CubePipeline, [
        Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR }),
        texture.createView()
    ]);

    CubeGeometry.AddVertexBuffer(CubePipeline, new Float32Array(
    [
        0.5 , 0.5, 0.75, 0.5, 0.5 , 1  , 0.75, 1  , // Top
        0.25, 0.5, 0.5 , 0.5, 0.25, 1  , 0.5 , 1  , // Bottom
        0   , 0  , 0   , 0.5, 0.25, 0  , 0.25, 0.5, // Front
        0.5 , 0  , 0.5 , 0.5, 0.75, 0  , 0.75, 0.5, // Back
        0   , 0.5, 0.25, 0.5, 0   , 1  , 0.25, 1  , // Left
        0.25, 0  , 0.5 , 0  , 0.25, 0.5, 0.5 , 0.5  // Right
    ]), "uv", "vertexUV");

    scene.Add([perspectiveCube, orthographicCube]);

    scene.AddCamera(orthographicCamera);
    scene.AddCamera(perspectiveCamera);

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

        // Perspective Cube:
        {
            const [rx, ry, rz] = initialPerspectiveRotation;

            tempRotation[0] = MathUtils.Lerp(rx, nextPerspectiveRotation[0], smoothTime);
            tempRotation[1] = MathUtils.Lerp(ry, nextPerspectiveRotation[1], smoothTime);
            tempRotation[2] = MathUtils.Lerp(rz, nextPerspectiveRotation[2], smoothTime);

            perspectiveCube.Transform = [[0, MathUtils.Lerp(0, 4, smootherTime), 0], tempRotation];
            perspectiveCube.Visible = !(orthographicCube.Visible = false);

            scene.MainCamera = perspectiveCamera;
            Renderer.Render(scene, false);
        }

        // Orthographic Cube:
        {
            const [px, py, pz] = orthographicPosition;
            const [rx, ry, rz] = orthographicRotation;

            tempRotation[0] = MathUtils.Lerp(rx, nextOrthographicRotation[0], smoothTime);
            tempRotation[1] = MathUtils.Lerp(ry, nextOrthographicRotation[1], smoothTime);
            tempRotation[2] = MathUtils.Lerp(rz, nextOrthographicRotation[2], smoothTime);

            orthographicCube.Transform = [[px, MathUtils.Lerp(py, nextOrthoY, smootherTime), pz], tempRotation];
            orthographicCube.Visible = !(perspectiveCube.Visible = false);

            scene.MainCamera = orthographicCamera;
            Renderer.Render(scene);
        }
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, height);

            perspectiveCamera.ResetLocalMatrix();
            orthographicCamera.Bottom = height;
            orthographicCamera.Right = width;
            orthographicCamera.Near = -100;

            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            perspectiveCamera.AspectRatio = Renderer.AspectRatio;
            perspectiveCamera.Position = [width / 360, 2, 8];
            orthographicCamera.UpdateViewProjectionMatrix();
            perspectiveCamera.UpdateViewProjectionMatrix();

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
    scene.Destroy();
    Device.Destroy(
        undefined,
        texture
    );
}
