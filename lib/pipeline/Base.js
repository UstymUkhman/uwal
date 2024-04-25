import { ThrowError, ThrowWarning } from "@/Errors";
import { ERROR } from "@/Constants";

/** @abstract */
export default class BasePipeline
{
    /** @type {string} */ #CommandEncoderLabel;

    /** @protected @type {GPUDevice} */ Device;
    /** @protected @type {GPUBindGroup[]} */ BindGroups = [];
    /** @protected @type {GPUCommandEncoder | undefined} */ CommandEncoder;

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [commandEncoderLabel = ""]
     */
    constructor(device, commandEncoderLabel)
    {
        !device && ThrowError(ERROR.DEVICE_NOT_REQUESTED);

        this.Device = device;
        this.#CommandEncoderLabel = commandEncoderLabel;
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
        return this.Device.createBuffer(descriptor);
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
        this.CheckCommandEncoder();
        this.CommandEncoder.copyBufferToBuffer(source, sourceOffset, destination, destinationOffset, size);
    }

    /**
     * @param {string | string[]} shader
     * @param {string} [label = ""]
     * @param {any} [sourceMap = undefined]
     * @param {GPUShaderModuleCompilationHint[]} [hints = undefined]
     */
    CreateShaderModule(shader, label = "", sourceMap, hints)
    {
        const code = Array.isArray(shader) ? shader.join("\n\n") : shader;
        return this.Device.createShaderModule({ label, code, sourceMap, compilationHints: hints });
    }

    /** @param {GPUBindingResource | GPUBindingResource[]} resources */
    CreateBindGroupEntries(resources)
    {
        return Array.isArray(resources)
            ? resources.map((resource, binding) => ({ binding, resource }))
            : [{ binding: 0, resource: resources }];
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
        return this.Device.createBindGroup(descriptor);
    }

    /** @param {GPUBindGroup | GPUBindGroup[]} bindGroups */
    AddBindGroups(bindGroups)
    {
        this.BindGroups = Array.isArray(bindGroups) ? bindGroups : [bindGroups];
    }

    CreateCommandEncoder()
    {
        return this.CommandEncoder = this.Device.createCommandEncoder({ label: this.#CommandEncoderLabel });
    }

    /** @protected */
    CheckCommandEncoder()
    {
        if (!this.CommandEncoder)
        {
            const message = ` ${this.#CommandEncoderLabel && `Label: "${this.#CommandEncoderLabel}". `}`;
            ThrowWarning(ERROR.COMMAND_ENCODER_NOT_FOUND, message + "Creating a new one.");
            this.CreateCommandEncoder();
        }
    }

    SubmitCommandBuffer()
    {
        this.CheckCommandEncoder();
        const commandBuffer = this.CommandEncoder.finish();
        this.Device.queue.submit([commandBuffer]);
    }
}
