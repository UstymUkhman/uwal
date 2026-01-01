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
     */

    /** @type {string} */ #Label;
    /** @type {number} */ #Radius = 0.0;
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
    CreateVertexBuffer(Pipeline, vertexData, label = this.#Label)
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
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    AddVertexBuffer(Pipeline, data, attributes, stepMode = "vertex", vertexEntry = "vertex")
    {
        !this.Vertices && ThrowError(ERROR.INDEX_BUFFER_NOT_FOUND, `\`AddVertexBuffer\` method.
            Call \`Geometry.CreateBuffers\` or \`Mesh.SetRenderPipeline\` method before adding a vertex buffer.`
        );

        const { buffer, layout } = Pipeline.CreateVertexBuffer(attributes, this.Vertices, stepMode, vertexEntry);
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
     * @param {VertexData} [data]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = { name: "normal", format: "float32x3" }]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    AddNormalBuffer(
        Pipeline,
        data,
        attributes = { name: "normal", format: "float32x3" },
        stepMode = "vertex",
        vertexEntry = "vertex"
    ) {
        !this.Vertices && ThrowError(ERROR.INDEX_BUFFER_NOT_FOUND, `\`CreateNormalBuffer\` method.
            Call \`Geometry.CreateBuffers\` or \`Mesh.SetRenderPipeline\` method before creating a normal buffer.`
        );

        const vertexData = /** @type {VertexData} */ (data ?? this.Primitive?.normals);

        !vertexData && ThrowError(ERROR.VERTEX_DATA_NOT_FOUND, `\`CreateNormalBuffer\` method.
            If \`Primitive\` geometry is not set, \`data\` argument is required in this method call.`
        );

        return this.AddVertexBuffer(Pipeline, vertexData, attributes, stepMode, vertexEntry);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "textureCoords"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    /* CreateTextureCoordsBuffer(Pipeline, attributes, stepMode, vertexEntry)
    {
        // if (this.Primitive) return this.AddVertexBuffer(
        //     Pipeline, this.Primitive.uvs, attributes ?? "uvs", stepMode, vertexEntry
        // );

        const data = new Float32Array(
        [
            0.5 , 0.5, 0.75, 0.5, 0.5 , 1  , 0.75, 1  , // Top
            0.25, 0.5, 0.5 , 0.5, 0.25, 1  , 0.5 , 1  , // Bottom
            0   , 0  , 0   , 0.5, 0.25, 0  , 0.25, 0.5, // Front
            0.5 , 0  , 0.5 , 0.5, 0.75, 0  , 0.75, 0.5, // Back
            0   , 0.5, 0.25, 0.5, 0   , 1  , 0.25, 1  , // Left
            0.25, 0  , 0.5 , 0  , 0.25, 0.5, 0.5 , 0.5  // Right
        ]);

        return this.AddVertexBuffer(Pipeline, data, attributes ?? "textureCoords", stepMode, vertexEntry);
    } */

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Label]
     */
    CreateBuffers(Pipeline, label = this.#Label)
    {
        if (!this.Primitive) return;

        this.IndexFormat = this.Primitive.cells instanceof Uint16Array && "uint16" || "uint32";
        utils.setTypedArrayType(this.IndexFormat === "uint16" && Uint16Array || Uint32Array);

        this.CreateVertexBuffer(Pipeline, this.Primitive.positions, label);
        this.CreateIndexBuffer(Pipeline, this.Primitive.cells, label);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = { name: "position", format: "float32x3" }]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    GetPositionBufferLayout(
        Pipeline,
        attributes = { name: "position", format: "float32x3" },
        stepMode = "vertex",
        vertexEntry = "vertex"
    ) {
        const layout = Pipeline.CreateVertexBufferLayout(attributes, stepMode, vertexEntry);
        this.#PositionAttributeSize = layout.attributes[0].size;
        return layout;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = { name: "normal", format: "float32x3" }]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    GetNormalBufferLayout(
        Pipeline,
        attributes = { name: "normal", format: "float32x3" },
        stepMode = "vertex",
        vertexEntry = "vertex"
    ) {
        return Pipeline.CreateVertexBufferLayout(attributes, stepMode, vertexEntry);
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
