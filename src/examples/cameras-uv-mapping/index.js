/**
 * @example Cameras / UV Mapping
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Dice from "/assets/images/dice.jpg";
import * as UWAL from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUTexture} */ let texture;
/** @type {ResizeObserver} */ let observer;

/** @type {Scene} */ const scene = new UWAL.Scene();
const perspectiveCamera = new UWAL.PerspectiveCamera();
const orthographicCamera = new UWAL.OrthographicCamera();

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Cameras / UV Mapping"));
    }
    catch (error)
    {
        alert(error);
    }

    let orthoRotation, nextOrthoY;
    const { Vec3 } = UWAL.MathUtils;
    const tempRotation = Vec3.create();
    let dropTimeout, dropTime = Infinity;

    const orthographicPosition = Vec3.create();
    const orthographicRotation = Vec3.create();

    const nextPerspectiveRotation = Vec3.create();
    const nextOrthographicRotation = Vec3.create();
    const initialPerspectiveRotation = Vec3.create();

    const Texture = new (await UWAL.TextureUtils(Renderer));
    const sampler = Texture.CreateSampler({ filter: "linear" });

    const CubeGeometry = new UWAL.Geometries.Mesh("cube", "uint16");
    const FlatMaterial = new UWAL.FlatMaterial(Renderer, { colorMap: true });

    texture = await Texture.CopyImageToTexture(await Texture.CreateImageBitmap(Dice));
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new UWAL.Color(0x194c33)));

    const perspectiveCube = new UWAL.Mesh(CubeGeometry);
    const orthographicCube = new UWAL.Mesh(CubeGeometry);

    await FlatMaterial.AddPipeline({
        primitive: FlatMaterial.Pipeline.CreatePrimitiveState(),
        multisample: FlatMaterial.Pipeline.CreateMultisampleState(),
        depthStencil: FlatMaterial.Pipeline.CreateDepthStencilState(),
        vertex: { buffers: [
            CubeGeometry.GetPositionBufferLayout(FlatMaterial.Pipeline),
            FlatMaterial.Pipeline.CreateVertexBufferLayout("uv", "vertexUV")
        ]}
    });

    const { CAMERA_MATRIX, COLOR, COLOR_MAP, COLOR_MAP_SAMPLER } = UWAL.BINDINGS;
    const bindings = [CAMERA_MATRIX, COLOR, COLOR_MAP, COLOR_MAP_SAMPLER];

    perspectiveCube.SetRenderPipeline(FlatMaterial.Pipeline, [
        perspectiveCamera.SetRenderPipeline(FlatMaterial.Pipeline),
        FlatMaterial.ColorBuffer, texture, sampler
    ], bindings);

    orthographicCube.SetRenderPipeline(FlatMaterial.Pipeline, [
        orthographicCamera.SetRenderPipeline(FlatMaterial.Pipeline),
        FlatMaterial.ColorBuffer, texture, sampler
    ], bindings);

    CubeGeometry.AddUVBuffer(FlatMaterial.Pipeline, new Float32Array([
        0.5 , 0.5, 0.75, 0.5, 0.5 , 1  , 0.75, 1  , // Top
        0.25, 0.5, 0.5 , 0.5, 0.25, 1  , 0.5 , 1  , // Bottom
        0   , 0  , 0   , 0.5, 0.25, 0  , 0.25, 0.5, // Front
        0.5 , 0  , 0.5 , 0.5, 0.75, 0  , 0.75, 0.5, // Back
        0   , 0.5, 0.25, 0.5, 0   , 1  , 0.25, 1  , // Left
        0.25, 0  , 0.5 , 0  , 0.25, 0.5, 0.5 , 0.5  // Right
    ]));

    scene.Add([perspectiveCamera, orthographicCamera]);
    scene.Add([perspectiveCube, orthographicCube]);

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

            const x = UWAL.MathUtils.RandomInt(-2, 2) || Infinity;
            const y = UWAL.MathUtils.RandomInt(-2, 2) || Infinity;
            const z = UWAL.MathUtils.RandomInt(-2, 2) || Infinity;

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

        const smoothTime = UWAL.MathUtils.SmoothStep(time);
        let smootherTime = UWAL.MathUtils.SmootherStep(time * 2);

        if (0.5 <= smoothTime)
        {
            smootherTime = (0.5 - (smoothTime - 0.5)) * 2;

            if (smoothTime === 1)
            {
                Vec3.copy(nextPerspectiveRotation, initialPerspectiveRotation);
                Vec3.copy(nextOrthographicRotation, orthographicRotation);
                dropTime = Infinity;
                drop();
            }
        }

        // Perspective Cube:
        {
            const [rx, ry, rz] = initialPerspectiveRotation;

            tempRotation[0] = UWAL.MathUtils.Lerp(rx, nextPerspectiveRotation[0], smoothTime);
            tempRotation[1] = UWAL.MathUtils.Lerp(ry, nextPerspectiveRotation[1], smoothTime);
            tempRotation[2] = UWAL.MathUtils.Lerp(rz, nextPerspectiveRotation[2], smoothTime);

            perspectiveCube.Transform = [[0, UWAL.MathUtils.Lerp(0, 4, smootherTime), 0], tempRotation];
            perspectiveCube.Visible = !(orthographicCube.Visible = false);

            scene.MainCamera = perspectiveCamera;
            Renderer.Render(scene, false);
        }

        // Orthographic Cube:
        {
            const [px, py, pz] = orthographicPosition;
            const [rx, ry, rz] = orthographicRotation;

            tempRotation[0] = UWAL.MathUtils.Lerp(rx, nextOrthographicRotation[0], smoothTime);
            tempRotation[1] = UWAL.MathUtils.Lerp(ry, nextOrthographicRotation[1], smoothTime);
            tempRotation[2] = UWAL.MathUtils.Lerp(rz, nextOrthographicRotation[2], smoothTime);

            orthographicCube.Transform = [[px, UWAL.MathUtils.Lerp(py, nextOrthoY, smootherTime), pz], tempRotation];
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

            orthographicCamera.Bottom = height;
            orthographicCamera.Right = width;
            orthographicCamera.Near = -100;

            // `Transform` also resets camera's local matrix:
            perspectiveCamera.Transform = [[width / 360, 2, 8]];
            perspectiveCamera.AspectRatio = Renderer.AspectRatio;

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

            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            Vec3.set(0.2, orthoRotation, 0, orthographicRotation);
            Vec3.set(width - (nw * 250 + 100), oy, 0, orthographicPosition);
        }

        clean(); drop(); raf = requestAnimationFrame(render);
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    orthographicCamera.Destroy();
    perspectiveCamera.Destroy();
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    scene.Destroy();
    UWAL.Device.Destroy(
        undefined,
        texture
    );
}
