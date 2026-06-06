/**
 * @module Compatibility Mode
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Compatibility Mode
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-compatibility-mode.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.4.0
 * @license MIT
 */

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    BINDINGS,
    MathUtils,
    Geometries,
    PerspectiveCamera
} from "#/index";

import Cubemap from './Cubemap.wgsl';

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    Device.AdapterOptions = { featureLevel: "compatibility", forceCompatibility: true };

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Compatibility Mode"));
    }
    catch (error)
    {
        alert(error);
    }

    const CubePipeline = new Renderer.Pipeline();
    const CubeGeometry = new Geometries.Mesh();
    const Camera = new PerspectiveCamera();
    const Cube = new Mesh(CubeGeometry);

    const scene = new Scene();
    const gui = new GUI();
    gui.onChange(render);
    scene.Add(Cube);

    const radToDeg =
    {
        converters: GUI.converters.radToDeg,
        min: -360,
        max: 360,
        step: 1
    };

    const settings =
    {
        rotation:
        [
            MathUtils.DegreesToRadians(20),
            MathUtils.DegreesToRadians(25),
            MathUtils.DegreesToRadians(0)
        ]
    };

    gui.add(settings.rotation, "0", radToDeg).name("rotation.x");
    gui.add(settings.rotation, "1", radToDeg).name("rotation.y");
    gui.add(settings.rotation, "2", radToDeg).name("rotation.z");

    const module = CubePipeline.CreateShaderModule([Shaders.MeshVertex, Cubemap]);
    CubeGeometry.Primitive = Geometries.Primitives.cube();
    Cube.Transform = [void 0, settings.rotation, 2];

    const Texture = new (await Device.Texture(Renderer));
    const texture = await createTextureFromSources([
        { faceColor: "#F00", textColor: "#0FF", text: "+X" },
        { faceColor: "#FF0", textColor: "#00F", text: "-X" },
        { faceColor: "#0F0", textColor: "#F0F", text: "+Y" },
        { faceColor: "#0FF", textColor: "#F00", text: "-Y" },
        { faceColor: "#00F", textColor: "#FF0", text: "+Z" },
        { faceColor: "#F0F", textColor: "#0F0", text: "-Z" }
    ]
    .map(faceOption => generateFace(faceOption)));

    Cube.SetRenderPipeline(await Renderer.AddPipeline(CubePipeline,
        {
            primitive: CubePipeline.CreatePrimitiveState(),
            depthStencil: CubePipeline.CreateDepthStencilState(),
            fragment: CubePipeline.CreateFragmentState(module),
            vertex: CubePipeline.CreateVertexState(module, "cubeVertex",
                CubeGeometry.GetPositionBufferLayout(CubePipeline)
            )
        }), [
            Texture.CreateSampler({ filter: "linear" }),
            texture.createView({ dimension: "cube" }),
            Camera.SetRenderPipeline(CubePipeline)
        ], [0, 1, BINDINGS.CAMERA_MATRIX]
    );

    CubeGeometry.AddUVBuffer(CubePipeline, CubeGeometry.Primitive.normals);

    /**
     * @typedef {Object} FaceOptions
     * @property {string} faceColor
     * @property {string} textColor
     * @property {string} text
     * @param {FaceOptions} options
     */
    function generateFace({ faceColor, textColor, text })
    {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = canvas.height = 128;
        context.fillStyle = faceColor;
        context.fillRect(0, 0, 128, 128);

        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillStyle = textColor;
        context.font = "90px sans-serif";

        const {
            actualBoundingBoxLeft,
            actualBoundingBoxRight,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent
        } = context.measureText(text);

        context.fillText(
            text,
            (128 - actualBoundingBoxRight + actualBoundingBoxLeft) / 2,
            (128 - actualBoundingBoxDescent + actualBoundingBoxAscent) / 2
        );

        return canvas;
    }

    /** @param {HTMLCanvasElement[]} sources */
    async function createTextureFromSources(sources)
    {
        const texture = Texture.CreateTextureFromSource(sources[0],
        {
            size: [sources[0].width, sources[0].height, sources.length],
            textureBindingViewDimension: "cube"
        });

        for (let [s, source] of sources.entries())
        {
            await Texture.CopyImageToTexture(source,
            {
                mipmaps: s === sources.length - 1,
                destinationOrigin: [0, 0, s],
                flipY: false,
                texture
            })
        }

        return texture;
    }

    function render()
    {
        Cube.Rotation = settings.rotation;
        Renderer.Render(scene);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.Position = [0, 1, 5];
            Camera.LookAt([0, 0, 0]);
            scene.AddMainCamera(Camera);
            Camera.UpdateWorldMatrix(true);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
