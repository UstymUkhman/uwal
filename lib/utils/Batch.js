export default class Batch
{
    /** @type {number} */ Index;
    /** @type {number} */ #Size;
    /** @type {boolean} */ #Delete;
    /** @type {Uint32Array} */ #IDs;
    /** @type {Pipeline} */ Pipeline;

    /** @type {number} */ #Instances;
    /** @type {number} */ #LastFrame;
    /** @type {number} */ #ResizeFrame;
    /** @type {Geometries} */ Geometry;

    /** @type {Uint32Array} */ #Indices;
    /** @type {Float32Array} */ #Centers;
    /** @type {Float32Array} */ #Distances;
    /** @type {BindGroup[][]} */ #BindGroups;

    // Clear unused batches & instances after ~5 sec.
    /** @type {number} */ #ClearFrame = 60 * 5 - 1;

    /**
     * @typedef {import("../pipelines/BasePipeline").BindGroup} BindGroup
     * @typedef {import("../primitives").Shape | import("../primitives").Mesh} Mesh
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineInstance} Pipeline
     * @typedef {import("../geometries").Mesh | import("../geometries").Shape} Geometries
     * @typedef {Float32ArrayConstructor | Uint32ArrayConstructor} TypedArrayConstructor
     */

    /**
     * @param {Pipeline} Pipeline
     * @param {Geometries} Geometry
     * @param {number} Index
     * @param {number} Size
     */
    constructor(Pipeline, Geometry, Index, Size)
    {
        this.#Distances  = new Float32Array(Size);
        this.#Centers    = new Float32Array(Size);
        this.#Indices    = new Uint32Array(Size);
        this.#IDs        = new Uint32Array(Size);
        this.#BindGroups = new Array(Size);

        this.Pipeline     = Pipeline;
        this.Geometry     = Geometry;
        this.#Delete      = false;
        this.Index        = Index;
        this.#Size        = Size;
        this.#ResizeFrame = 0;
        this.#LastFrame   = 0;
        this.#Instances   = 0;
    }

    /**
     * @template {Float32Array | Uint32Array} TypedArray
     * @param {TypedArray} TypedArray
     * @returns {TypedArray}
     */
    #Resize(TypedArray)
    {
        const Constructor = /** @type {TypedArrayConstructor} */ (TypedArray.constructor);
        const typedArray = /** @type {TypedArray} */ (new Constructor(this.#Size));
        typedArray.set(TypedArray.subarray(0, this.#Size));
        return typedArray;
    }

    /**
     * @param {Mesh} Mesh
     * @param {number} Center
     * @param {number} frame
     */
    Add(Mesh, Center, frame)
    {
        if (this.#Size === this.#Instances)
        {
            this.#BindGroups.length = this.#Size = this.#Size << 1;
            this.#Distances = this.#Resize(this.#Distances);
            this.#Centers = this.#Resize(this.#Centers);
            this.#Indices = this.#Resize(this.#Indices);
            this.#IDs = this.#Resize(this.#IDs);
            this.#ResizeFrame = frame;
        }

        const i = this.#Instances++;

        this.#Distances[i] = Center + Mesh.Radius;
        this.#BindGroups[i] = Mesh.BindGroups;
        this.#Centers[i] = Center;
        this.#IDs[i] = Mesh.ID;
        this.#Indices[i] = i;
    }

    SortOpaque()
    {
        const IDs = this.#IDs, Centers = this.#Centers;

        this.#Indices.subarray(0, this.#Instances).sort((a, b) =>
            Centers[a] === Centers[b] && IDs[a] - IDs[b] || Centers[a] - Centers[b]
        );

        return this;
    }

    SortTransparent()
    {
        let MaxDistance = this.#Distances.at(-1) || 0;
        const IDs = this.#IDs, Centers = this.#Centers, Distances = this.#Distances;

        this.#Indices.subarray(0, this.#Instances).sort((a, b) =>
            Centers[a] === Centers[b] && IDs[a] - IDs[b] || Centers[b] - Centers[a]
        );

        for (let d = Distances.length - 1; d--; )
        {
            const Distance = Distances[d];

            if (MaxDistance < Distance)
                MaxDistance = Distance;
        }

        return MaxDistance;
    }

    /** @param {number} frame */
    ResizeInstances(frame)
    {
        const i = this.#Instances, last = this.#LastFrame;
        const deleteFrame = frame - this.#ClearFrame;
        i && (this.#LastFrame = frame);

        if (this.#ResizeFrame < deleteFrame && !(this.#Delete = last < deleteFrame))
        {
            this.#BindGroups.length = this.#Size = Math.max(i, 1);
            this.#Distances = this.#Resize(this.#Distances);
            this.#Centers = this.#Resize(this.#Centers);
            this.#Indices = this.#Resize(this.#Indices);
            this.#IDs = this.#Resize(this.#IDs);
            this.#ResizeFrame = Infinity;
        }

        return i;
    }

    /** @param {number} index */
    GetBindGroups(index)
    {
        return this.#BindGroups[this.#Indices[index]];
    }

    ResetInstances()
    {
        this.#Instances = 0;
    }

    get Instances()
    {
        return this.#Instances;
    }

    get Delete()
    {
        return this.#Delete;
    }
}
