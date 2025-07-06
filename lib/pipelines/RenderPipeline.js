import { BasePipeline } from "#/pipelines";
import { ERROR, ThrowError } from "#/Errors";
import { GetParamArray, GetDefaultVertexFormat, GetVertexFormatSize } from "#/utils";

/**
 * @typedef {import("./BasePipeline").BasePipelineDescriptor} BaseDescriptor
 *
 * @typedef {BaseDescriptor & {
 *   vertex?: GPUVertexState;
 *   fragment?: GPUFragmentState;
 *   primitive?: GPUPrimitiveState;
 *   depthStencil?: GPUDepthStencilState;
 *   multisample?: GPUMultisampleState;
 * }} RenderPipelineDescriptor
 *
 * @exports RenderPipelineDescriptor
 */

export default class RenderPipeline extends BasePipeline
{
    /** @typedef {import("../pipelines/BasePipeline").BufferDescriptor} BufferDescriptor */

    /**
     * @param {GPUDevice} device
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        super(device, "Render", programName);
    }

    /** @param {RenderPipelineDescriptor | GPUShaderModule} [moduleDescriptor] */
    async Init(moduleDescriptor = {})
    {
        let module = this.GetShaderModule(moduleDescriptor);
        let { vertex, fragment } = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor);

        !module && !vertex && (module = this.CreateShaderModule());

        if (module)
        {
            vertex ??= this.CreateVertexState(module);
            fragment ??= this.CreateFragmentState(module);
        }

        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Render Pipeline");
        const layout = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";

        return this.GPUPipeline = await this.Device.createRenderPipelineAsync({
            label, layout, vertex, fragment, ...moduleDescriptor
        });
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entryPoint = "vertex"]
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateVertexState(module, entryPoint = "vertex", buffers, constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (GetParamArray(buffers));
        return { module, entryPoint, buffers, constants };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entryPoint = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateFragmentState(module, entryPoint = "fragment", targets, constants)
    {
        targets ??= this.CreateTargetState();
        targets = /** @type {GPUColorTargetState[]} */ (GetParamArray(targets));
        return { module, entryPoint, targets, constants };
    }

    /**
     * @typedef {string | { name: string; format?: GPUVertexFormat }} VertexAttribute
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    CreateVertexBufferLayout(attributes, stepMode, vertexEntry = "vertex")
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`Renderer.CreateVertexBufferLayout\`.
            Call \`Renderer.CreateShaderModule\` before creating a vertex layout or vertex buffer.`
        );

        const { entry: { vertex } } = this.Reflect;
        const entry = vertex.find(({ name }) => vertexEntry === name);

        !entry && ThrowError(ERROR.VERTEX_ENTRY_NOT_FOUND, `\`${vertexEntry}\` in vertex shader entries.`);
        attributes = /** @type {VertexAttribute[]} */ (GetParamArray(attributes));

        let vertexAttributes = [], arrayStride = 0;

        for (let a = 0, l = attributes.length; a < l; ++a)
        {
            const attribute = attributes[a];
            const string = typeof attribute === "string";
            const attributeName = string ? attribute : attribute.name;
            const input = entry.inputs.find(({ name }) => attributeName === name);

            if (input)
            {
                const format = string ? GetDefaultVertexFormat(input.type.size) : attribute.format;
                vertexAttributes.push(this.#CreateVertexBufferAttribute(format, +input.location, arrayStride));

                arrayStride += GetVertexFormatSize(format);
                continue;
            }

            ThrowWarning(ERROR.VERTEX_ATTRIBUTE_NOT_FOUND, `\`${attributeName}\` in vertex shader inputs.`);
        }

        return { arrayStride, stepMode, attributes: vertexAttributes };
    }

    /**
     * @param {Float32Array | VertexAttribute | VertexAttribute[]} dataOrAttributes
     * @param {number | import("./BasePipeline").BufferDescriptor & { count?: number }} [descriptor]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     *
     * @returns {GPUBuffer | { buffer: GPUBuffer, layout: GPUVertexBufferLayout }}
     */
    CreateVertexBuffer(dataOrAttributes, descriptor = 1, stepMode, vertexEntry = "vertex")
    {
        const label = descriptor.label ?? "Vertex Buffer";

        if (dataOrAttributes instanceof Float32Array)
            return this.CreateBuffer({ label, size: dataOrAttributes.byteLength, usage: USAGE.VERTEX, ...descriptor });

        const layout = this.CreateVertexBufferLayout(dataOrAttributes, stepMode, vertexEntry);
        const size = ((typeof descriptor === "number" && descriptor) || (descriptor.count ?? 1)) * layout.arrayStride;

        return { buffer: this.CreateBuffer({ label, size, usage: USAGE.VERTEX, ...descriptor }), layout };
    }

    /**
     * @param {Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | number[]} indices
     * @param {BufferDescriptor} [descriptor]
     */
    CreateIndexBuffer(indices, descriptor)
    {
        const label = descriptor?.label ?? "Index Buffer";
        indices = (Array.isArray(indices) && new Uint32Array(indices)) || indices;
        return this.CreateBuffer({ label, size: indices.byteLength, usage: USAGE.INDEX, ...descriptor });
    }
}
