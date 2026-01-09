/**
 * @example Geometries / Lights
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by dmnsgn's "Primitive Geometry"
 * {https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.4
 * @license MIT
 */

import {
    Node,
    Mesh,
    Color,
    Scene,
    Device,
    Shaders,
    Materials,
    Geometries,
    BLEND_STATE,
    PerspectiveCamera
} from "#/index";

import UV from "/assets/images/uv.jpg";
import GeometryShader from "./Geometry.wgsl";

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
        Renderer = new (await Device.Renderer(canvas, "Geometries / Lights"));
    }
    catch (error)
    {
        alert(error);
    }

    const geometries = [];
    const grid = new Node();
    const scene = new Scene();

    const Camera = new PerspectiveCamera();
    const Pipeline = new Renderer.Pipeline();
    const WIREFRAME_COLOR = new Color(0xffffff);

    const Texture = new (await Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(UV);
    const texture = await Texture.CopyImageToTexture(source);
    const module = Pipeline.CreateShaderModule([Shaders.Mesh, GeometryShader]);

    const Geometry = new Geometries.Mesh("Cube", "uint16");
    Geometry.Primitive = Geometries.Primitives.cube();

    const Cube = new Mesh(Geometry, new Materials.Color(WIREFRAME_COLOR));
    Cube.Transform = [[0, 0, -2.5], [0.625, -0.75, 0]];

    const vertexBuffers = [
        Geometry.GetPositionBufferLayout(Pipeline, "vertexNormalUV"),
        Geometry.GetNormalBufferLayout(Pipeline, "vertexNormalUV"),
        Geometry.GetUVBufferLayout(Pipeline, "vertexNormalUV")
    ];

    // Wireframe Pipeline:
    await Renderer.AddPipeline(Pipeline, {
        vertex: Pipeline.CreateVertexState(module, vertexBuffers, "vertexNormalUV"),
        primitive: Pipeline.CreatePrimitiveState("line-list"),
        depthStencil: Pipeline.CreateDepthStencilState(),
        multisample: Pipeline.CreateMultisampleState(),
        fragment: Pipeline.CreateFragmentState(module,
            Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE),
            "GeometryFragment"
        )
    });

    // const resources = [Texture.CreateSampler(), texture.createView()];
    Cube.SetRenderPipeline(Pipeline /*, resources */);
    Camera.Position = [0.0, 0.0, 10.0];
    Camera.LookAt(grid.Position);
    scene.AddCamera(Camera);
    scene.Add(grid);

    function clean()
    {
        geometries.length = 0;
    }

    function start(g = 0)
    {

        const gridSize = 6, halfSize = (gridSize - 1) * 0.5, offset = 1.5;
        geometries.push(Cube); scene.Add(geometries);

        geometries.forEach((geometry) => {
            if (!geometry)
            {
                if (g % gridSize) g += gridSize - (g % gridSize);

                return;
            }

            geometry.Position = [
                (g % gridSize) * offset - halfSize * offset,
                0,
                ~~(g++ / gridSize) * offset,
            ];
        });

        const halfGridSize = geometries.at(-1).Position[2] * 0.5;
        geometries.forEach((geometry) => geometry.Position[2] -= halfGridSize);

        raf = requestAnimationFrame(render);
    }

    function render()
    {
        Renderer.Render(scene);

        setTimeout(() =>
        {
            Geometry.CreateEdgeBuffer(Pipeline);
            Renderer.Render(scene);
        }, 2e3);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, blockSize);
            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            Camera.UpdateViewProjectionMatrix();
        }

        clean(), start();
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
