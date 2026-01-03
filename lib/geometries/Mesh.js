import { SetDrawParams, CreateConstantObject } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { utils } from "primitive-geometry";
import { vec3 } from "wgpu-matrix";

export default class Mesh
{
    /**
     * @typedef {import("../pipelines/BasePipeline").TypedArray<ArrayBuffer>} VertexData
     * @typedef {import("../pipelines/RenderPipeline").VertexAttribute} VertexAttribute
     * @typedef {import("../pipelines/RenderPipeline").DrawParams} DrawParams
     * @typedef {import("./Primitives").Primitive} Primitive
     *
     * @typedef {Object} VertexBuffer
     * @property {VertexData} data
     * @property {string} [vertexEntry]
     * @property {GPUVertexStepMode} [stepMode]
     * @property {VertexAttribute | VertexAttribute[]} [attributes]
     */

    /** @type {string} */ #Label;
    /** @type {number} */ #Radius = 0.0;
    /** @type {boolean} */ #AddUVBuffer = !1;
    /** @type {boolean} */ #AddNormalBuffer = !1;

    /** @type {Primitive | undefined} */ Primitive;
    /** @type {string} */ #ID = crypto.randomUUID();
    /** @type {number} */ #PositionAttributeSize = 3;
    /** @type {GPUIndexFormat | undefined} */ IndexFormat;

    // Bounding box in local space:
    #bbox = CreateConstantObject({
        min: vec3.create( Infinity,  Infinity,  Infinity),
        max: vec3.create(-Infinity, -Infinity, -Infinity)
    });

    // Bounding box in world space:
    #BBox = CreateConstantObject({
        Min: vec3.create( Infinity,  Infinity,  Infinity),
        Max: vec3.create(-Infinity, -Infinity, -Infinity)
    });

    /** @type {import("wgpu-matrix").Vec3Arg} */ #Center = vec3.create();
    /** @type {DrawParams} */ DrawParams = [0, void 0, void 0, void 0, void 0];

    /** @type {import("../pipelines/RenderPipeline").VertexBuffer[]} */ VertexBuffers = [];
    /** @type {import("../pipelines/RenderPipeline").IndexBufferParams | undefined} */ IndexBuffer;

    /**
     * @param {string} [label = "Mesh"]
     * @param {GPUIndexFormat} [format]
     */
    constructor(label = "Mesh", format)
    {
        this.#Label = label;
        this.IndexFormat = format;
        utils.setTypedArrayType(format === "uint16" && Uint16Array || Uint32Array);
    }

    /** @param {(number | undefined)[]} args */
    SetDrawParams(...args)
    {
        return this.DrawParams = /*@__INLINE__*/ SetDrawParams(this.DrawParams, .../** @type {DrawParams} */ (args));
    }

    /** @param {import("wgpu-matrix").Mat4Arg} world */
    UpdateBoundingBox(world)
    {
        const { Min, Max } = this.#BBox;
        const { min, max } = this.#bbox;

        vec3.set(world[12], world[13], world[14], Min);
        vec3.set(world[12], world[13], world[14], Max);

        for (let a = 0, c = 0; a < 12; a += 4, ++c)
        {
            const x = world[a], y = world[a + 1], z = world[a + 2];

            const minX = x * min[c], maxX = x * max[c];
            const minY = y * min[c], maxY = y * max[c];
            const minZ = z * min[c], maxZ = z * max[c];

            Min[0] += Math.min(minX, maxX);
            Max[0] += Math.max(minX, maxX);

            Min[1] += Math.min(minY, maxY);
            Max[1] += Math.max(minY, maxY);

            Min[2] += Math.min(minZ, maxZ);
            Max[2] += Math.max(minZ, maxZ);
        }

        return this.#BBox;
    }

    /** @param {Float32Array<ArrayBufferLike>} vertices */
    #ComputeBoundingBox(vertices)
    {
        const { min, max } = this.#bbox;

        for (let v = 0, l = vertices.length, size = this.#PositionAttributeSize; v < l; v += size)
        {
            const x = vertices[v], y = vertices[v + 1], z = vertices[v + 2];

            min[0] = Math.min(min[0], x);
            min[1] = Math.min(min[1], y);
            min[2] = Math.min(min[2], z);

            max[0] = Math.max(max[0], x);
            max[1] = Math.max(max[1], y);
            max[2] = Math.max(max[2], z);
        }

        vec3.add(min, max, this.#Center);
        vec3.mulScalar(this.#Center, 0.5, this.#Center);
    }

    /** @param {Float32Array<ArrayBufferLike>} vertices */
    #ComputeBoundingSphere(vertices)
    {
        this.#Radius = 0;

        for (
            let vertex = 0,
            squaredDistance = 0,
            length = vertices.length,
            size = this.#PositionAttributeSize;
            vertex < length; vertex += size, squaredDistance = 0
        ) {
            for (let c = 0, v = vertex, l = vertex + size; v < l; c = ++v - vertex)
                squaredDistance += (vertices[v] - this.#Center[c]) ** 2;

            this.#Radius = Math.max(this.#Radius, squaredDistance);
        }

        this.#Radius = Math.sqrt(this.#Radius);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Float32Array<ArrayBufferLike>} vertexData
     * @param {string} [label = this.#Label]
     */
    CreatePositionBuffer(Pipeline, vertexData, label = this.#Label)
    {
        const vertexBuffer = Pipeline.CreateVertexBuffer(vertexData, { label: `${label} Vertex Buffer` });
        Pipeline.WriteBuffer(vertexBuffer, /** @type {Float32Array<ArrayBuffer>} */ (vertexData));
        this.VertexBuffers = Pipeline.SetVertexBuffers(vertexBuffer);

        this.#ComputeBoundingBox(vertexData);
        this.#ComputeBoundingSphere(vertexData);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexData} data
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {string} [vertexEntry = "vertex"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    AddVertexBuffer(Pipeline, data, attributes, vertexEntry = "vertex", stepMode = "vertex")
    {
        !this.Vertices && ThrowError(ERROR.INDEX_BUFFER_NOT_FOUND, `\`AddVertexBuffer\` method.
            Call \`Geometry.CreateBuffers\` or \`Mesh.SetRenderPipeline\` method before adding a vertex buffer.`
        );

        const { buffer, layout } = Pipeline.CreateVertexBuffer(attributes, this.Vertices, vertexEntry, stepMode);
        this.VertexBuffers = Pipeline.AddVertexBuffers(buffer);
        Pipeline.WriteBuffer(buffer, data);
        return { buffer, layout };
    }

    /**
     * @template {ArrayBufferLike} Buffer
     * @typedef {Uint16Array | Uint32Array} IndexArray
     * @param {RenderPipeline} Pipeline
     * @param {IndexArray<ArrayBufferLike>} indexData
     * @param {string} [label = this.#Label]
     */
    CreateIndexBuffer(Pipeline, indexData, label = this.#Label)
    {
        const indexBuffer = Pipeline.CreateIndexBuffer(indexData, { label: `${label} Index Buffer` });
        Pipeline.WriteBuffer(indexBuffer, /** @type {Uint16Array<ArrayBuffer>} */ (indexData));
        Pipeline.SetDrawParams.apply(Pipeline, this.SetDrawParams(indexData.length));
        this.IndexBuffer = Pipeline.SetIndexBuffer(indexBuffer, this.IndexFormat);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Label]
     * @param {VertexBuffer} [normalBuffer]
     * @param {VertexBuffer} [uvBuffer]
     */
    CreateBuffers(Pipeline, label = this.#Label, normalBuffer, uvBuffer)
    {
        if (!this.Primitive) return;

        this.IndexFormat = this.Primitive.cells instanceof Uint16Array && "uint16" || "uint32";
        utils.setTypedArrayType(this.IndexFormat === "uint16" && Uint16Array || Uint32Array);

        this.CreatePositionBuffer(Pipeline, this.Primitive.positions, label);
        this.CreateIndexBuffer(Pipeline, this.Primitive.cells, label);

        if (!(this.#AddNormalBuffer || this.#AddUVBuffer)) return;

        const vertexEntry = this.#AddNormalBuffer && this.#AddUVBuffer && "vertexNormalUV"
            || this.#AddNormalBuffer && "vertexNormal" || "vertexUV";

        this.#AddNormalBuffer && this.AddVertexBuffer(
            Pipeline,
            /** @type {VertexData} */ (normalBuffer?.data || this.Primitive?.normals),
            normalBuffer?.attributes || "normal",
            normalBuffer?.vertexEntry || vertexEntry,
            normalBuffer?.stepMode || "vertex"
        );

        this.#AddUVBuffer && this.AddVertexBuffer(
            Pipeline,
            /** @type {VertexData} */ (uvBuffer?.data || this.Primitive?.uvs),
            uvBuffer?.attributes || "uv",
            uvBuffer?.vertexEntry || vertexEntry,
            uvBuffer?.stepMode || "vertex"
        );
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [vertexEntry = "vertex"]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = { name: "position", format: "float32x3" }]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    GetPositionBufferLayout(
        Pipeline,
        vertexEntry = "vertex",
        attributes = { name: "position", format: "float32x3" },
        stepMode = "vertex",
    ) {
        const layout = Pipeline.CreateVertexBufferLayout(attributes, vertexEntry, stepMode);
        this.#PositionAttributeSize = layout.attributes[0].size;
        return layout;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [vertexEntry = "vertex"]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "normal"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    GetNormalBufferLayout(Pipeline, vertexEntry = "vertex", attributes = "normal", stepMode = "vertex")
    {
        return (this.#AddNormalBuffer = true) && Pipeline.CreateVertexBufferLayout(attributes, vertexEntry, stepMode);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [vertexEntry = "vertex"]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "uv"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    GetUVBufferLayout(Pipeline, vertexEntry = "vertex", attributes = "uv", stepMode = "vertex")
    {
        return (this.#AddUVBuffer = true) && Pipeline.CreateVertexBufferLayout(attributes, vertexEntry, stepMode);
    }

    get BoundingBox()
    {
        return this.#BBox;
    }

    get Vertices()
    {
        return this.DrawParams[0];
    }

    get Radius()
    {
        return this.#Radius;
    }

    get ID()
    {
        return this.#ID;
    }

    Destroy()
    {
        this.IndexBuffer?.buffer.destroy();
        this.IndexBuffer = undefined;
    }
}
