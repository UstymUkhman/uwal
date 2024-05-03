import { ERROR, ThrowError, ThrowWarning } from "@/Errors";

/** @abstract */
export default class BasePipeline
{
    /** @type {string} */ #ProgramName;
    /** @type {string} */ #CommandEncoderLabel;

    /** @protected @type {GPUDevice} */ Device;
    /** @protected @type {GPUBindGroup[]} */ BindGroups = [];
    /** @type {GPUCommandEncoder | undefined} */ #CommandEncoder;

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        !device && ThrowError(ERROR.DEVICE_NOT_REQUESTED);

        this.Device = device;
        this.#ProgramName = programName;
        this.#CommandEncoderLabel = this.CreateProgramLabel("Command Encoder");
    }

    /** @protected @param {string} [label = ""] */
    CreateProgramLabel(label)
    {
        return this.#ProgramName && label && `${this.#ProgramName} ${label}` || "";
    }

    /**
     * @typedef {Object} BufferDescriptor
     * @property {GPUSize64} size
     * @property {GPUBufferUsageFlags} usage
     * @property {string} [label = undefined]
     * @property {boolean} [mappedAtCreation = undefined]
     * @param {BufferDescriptor} descriptor
     */
    CreateBuffer(descriptor)
    {
        const label = descriptor.label ?? this.CreateProgramLabel("Buffer");
        return this.Device.createBuffer({ ...descriptor, label });
    }

    /**
     * @param {GPUBuffer} buffer
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {GPUSize64} [bufferOffset = 0]
     * @param {GPUSize64} [dataOffset = undefined]
     * @param {GPUSize64} [size = undefined]
     */
    WriteBuffer(buffer, data, bufferOffset = 0, dataOffset, size)
    {
        this.Device.queue.writeBuffer(buffer, bufferOffset, data, dataOffset, size);
    }

    /**
     * @param {GPUBuffer} source
     * @param {GPUBuffer} destination
     * @param {GPUSize64} size
     * @param {GPUSize64} [sourceOffset = 0]
     * @param {GPUSize64} [destinationOffset = 0]
     */
    CopyBufferToBuffer(source, destination, size, sourceOffset = 0, destinationOffset = 0)
    {
        this.CommandEncoder.copyBufferToBuffer(source, sourceOffset, destination, destinationOffset, size);
    }

    /**
     * @param {string | string[]} shader
     * @param {string} [label = undefined]
     * @param {any} [sourceMap = undefined]
     * @param {GPUShaderModuleCompilationHint[]} [hints = undefined]
     */
    CreateShaderModule(shader, label, sourceMap, hints)
    {
        label ??= this.CreateProgramLabel("Shader Module");
        const code = (/** @type {string} */ (Array.isArray(shader) && shader.join("\n\n") || shader));
        return this.Device.createShaderModule({ label, code, sourceMap, compilationHints: hints });
    }

    /** @param {GPUBindingResource | GPUBindingResource[]} resources */
    CreateBindGroupEntries(resources)
    {
        return (/** @type {GPUBindGroupEntry[]} */ (
            Array.isArray(resources)
                && resources.map((resource, binding) => ({ binding, resource }))
                || [{ binding: 0, resource: resources }]
            )
        );
    }

    /**
     * @typedef {Object} BindGroupDescriptor
     * @property {GPUBindGroupLayout} layout
     * @property {Iterable<GPUBindGroupEntry>} entries
     * @property {string} [label = undefined]
     * @param {BindGroupDescriptor} descriptor
     */
    CreateBindGroup(descriptor)
    {
        const label = descriptor.label ?? this.CreateProgramLabel("Bind Group");
        return this.Device.createBindGroup({ ...descriptor, label });
    }

    /** @param {GPUBindGroup | GPUBindGroup[]} bindGroups */
    SetBindGroups(bindGroups)
    {
        this.BindGroups = (/** @type {GPUBindGroup[]} */ (Array.isArray(bindGroups) && bindGroups || [bindGroups]));
    }

    CreateCommandEncoder()
    {
        return this.#CommandEncoder = this.Device.createCommandEncoder({ label: this.#CommandEncoderLabel });
    }

    SubmitCommandBuffer()
    {
        this.Device.queue.submit([this.CommandEncoder.finish()]);
    }

    /** @param {string} label */
    set CommandEncoderLabel(label)
    {
        this.#CommandEncoderLabel = label;
    }

    /** @protected */
    get CommandEncoder()
    {
        if (!this.#CommandEncoder)
        {
            const message = ` ${this.#CommandEncoderLabel && `Label: "${this.#CommandEncoderLabel}". `}`;
            ThrowWarning(ERROR.COMMAND_ENCODER_NOT_FOUND, message + "Creating a new one.");
            return this.CreateCommandEncoder();
        }

        return this.#CommandEncoder;
    }

    /** @protected */
    get ProgramName()
    {
        return this.#ProgramName;
    }
}
