import { ERROR, ThrowError, ThrowWarning } from "@/Errors";

export default /** @abstract */ class BasePipeline
{
    /**
     * @typedef {Object} BindGroup
     * @property {GPUBindGroup} bindGroup
     * @property {GPUBufferDynamicOffset[]} [dynamicOffsets]
     * @property {boolean} active
     */

    /** @type {string} */ #Type;
    /** @type {string} */ #ProgramName;
    /** @type {string} */ #CommandEncoderLabel;

    /** @protected @type {GPUDevice} */ Device;
    /** @protected @type {BindGroup[]} */ BindGroups = [];
    /** @type {GPUCommandEncoder | undefined} */ #CommandEncoder;
    /** @protected @type {GPURenderPipeline | GPUComputePipeline} */ Pipeline;
    /** @protected @type {GPURenderPassDescriptor | GPUComputePassDescriptor} */ Descriptor;

    /** @type {GPURenderPassDescriptor | GPUComputePassDescriptor} */ #PrevDescriptor;
    /** @type {GPURenderPipeline | GPUComputePipeline} */ #PrevPipeline;
    /** @type {BindGroup[]} */ #PrevBindGroups = [];

    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     * @param {string} [type = ""]
     */
    constructor(device, programName, type)
    {
        !device && ThrowError(ERROR.DEVICE_NOT_REQUESTED);

        this.#Type = type;
        this.Device = device;
        this.#ProgramName = programName;
        this.#CommandEncoderLabel = this.CreatePipelineLabel("Command Encoder");
    }

    /** @protected @param {string} [label = ""] */
    CreatePipelineLabel(label)
    {
        return this.#ProgramName && label && `${this.#ProgramName} ${label}` || "";
    }

    /**
     * @param {GPUBindGroupLayout | GPUBindGroupLayout[]} layouts
     * @param {string} [label]
     */
    CreatePipelineLayout(layouts, label)
    {
        const bindGroupLayouts = /** @type {GPUBindGroupLayout[]} */
            (Array.isArray(layouts) && layouts || [layouts]);

        label ??= this.CreatePipelineLabel(`${this.#Type} Pipeline Layout`);

        return this.Device.createPipelineLayout({ label, bindGroupLayouts });
    }

    /**
     * @param {string | string[]} shader
     * @param {string} [label]
     * @param {any} [sourceMap]
     * @param {GPUShaderModuleCompilationHint[]} [hints]
     */
    CreateShaderModule(shader, label, sourceMap, hints)
    {
        label ??= this.CreatePipelineLabel("Shader Module");
        const code = (/** @type {string} */ (Array.isArray(shader) && shader.join("\n\n") || shader));
        return this.Device.createShaderModule({ label, code, sourceMap, compilationHints: hints });
    }

    /**
     * @typedef {Object} BufferDescriptor
     * @property {GPUSize64} size
     * @property {GPUBufferUsageFlags} usage
     * @property {string} [label]
     * @property {boolean} [mappedAtCreation]
     * @param {BufferDescriptor} descriptor
     */
    CreateBuffer(descriptor)
    {
        const label = descriptor.label ?? this.CreatePipelineLabel("Buffer");
        return this.Device.createBuffer({ ...descriptor, label });
    }

    /**
     * @param {GPUBuffer} buffer
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {GPUSize64} [bufferOffset = 0]
     * @param {GPUSize64} [dataOffset]
     * @param {GPUSize64} [size]
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
        this.GetCommandEncoder(true).copyBufferToBuffer(source, sourceOffset, destination, destinationOffset, size);
    }

    /**
     * @typedef {
           Pick<Partial<GPUBindGroupLayoutEntry>, "binding"> &
           Omit<GPUBindGroupLayoutEntry, "binding">
       } BindGroupLayoutEntry
     * @param {BindGroupLayoutEntry | BindGroupLayoutEntry[]} layoutEntries
     * @param {string} [label]
     */
    CreateBindGroupLayout(layoutEntries, label)
    {
        label ??= this.CreatePipelineLabel("Bind Group Layout");

        layoutEntries = /** @type {BindGroupLayoutEntry[]} */ (Array.isArray(layoutEntries)
            && layoutEntries.map((entry, binding) => ({ ...entry, binding: entry.binding ?? binding }))
            || [{ ...layoutEntries, binding: /** @type {BindGroupLayoutEntry} */ (layoutEntries).binding ?? 0 }]);

        const entries = /** @type {GPUBindGroupLayoutEntry[]} */ (layoutEntries);
        return this.Device.createBindGroupLayout({ entries, label });
    }

    /**
     * @param {GPUBindingResource | GPUBindingResource[]} resources
     * @param {GPUIndex32 | GPUIndex32[]} [bindings = 0]
     */
    CreateBindGroupEntries(resources, bindings = 0)
    {
        return /** @type {GPUBindGroupEntry[]} */ (Array.isArray(resources)
            && resources.map((resource, binding) => ({ binding: bindings?.[binding] ?? binding, resource }))
            || [{ binding: bindings, resource: resources }]
        );
    }

    /**
     * @param {GPUBindGroupEntry[]} entries
     * @param {GPUBindGroupLayout | number} [layout = 0]
     * @param {string} [label]
     */
    CreateBindGroup(entries, layout = 0, label)
    {
        label ??= this.CreatePipelineLabel("Bind Group");

        if (typeof layout === "number")
            layout = /** @type {GPUBindGroupLayout} */ (!this.Pipeline
                ? ThrowError(ERROR.PIPELINE_NOT_FOUND, `${this.#Type}Pipeline.`)
                : this.Pipeline.getBindGroupLayout(layout)
            );

        return this.Device.createBindGroup({ entries, label, layout });
    }

    /**
     * @param {GPUBindGroup | GPUBindGroup[]} bindGroups
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    SetBindGroups(bindGroups, dynamicOffsets)
    {
        if (Array.isArray(dynamicOffsets))
        {
            if (!(/** @type {GPUBufferDynamicOffset[][]} */ (dynamicOffsets)[0].length))
                dynamicOffsets = /** @type {GPUBufferDynamicOffset[]} */
                    (dynamicOffsets).map(dynamicOffset => ([dynamicOffset]));
        }

        else dynamicOffsets = [dynamicOffsets];

        this.BindGroups = /** @type {BindGroup[]} */ (Array.isArray(bindGroups)
            && bindGroups.map((bindGroup, g) => ({ bindGroup, dynamicOffsets: dynamicOffsets[g], active: true }))
            || [{ bindGroup: bindGroups, dynamicOffsets: dynamicOffsets[0], active: true }]
        );
    }

    /**
     * @param {GPUBindGroup | GPUBindGroup[]} bindGroups
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    AddBindGroups(bindGroups, dynamicOffsets)
    {
        if (Array.isArray(dynamicOffsets))
        {
            if (!(/** @type {GPUBufferDynamicOffset[][]} */ (dynamicOffsets)[0].length))
                dynamicOffsets = /** @type {GPUBufferDynamicOffset[]} */
                    (dynamicOffsets).map(dynamicOffset => ([dynamicOffset]));
        }

        else dynamicOffsets = [dynamicOffsets];

        // @ts-ignore
        return this.BindGroups.push(...(Array.isArray(bindGroups)
            && bindGroups.map((bindGroup, g) => ({ bindGroup, dynamicOffsets: dynamicOffsets[g], active: true }))
            || [{ bindGroup: bindGroups, dynamicOffsets: dynamicOffsets[0], active: true }])
        );
    }

    /** @param {number | number[]} indices */
    SetActiveBindGroups(indices)
    {
        indices = /** @type {number[]} */ (Array.isArray(indices) && indices || [indices]);
        for (let g = this.BindGroups.length; g--; ) this.BindGroups[g].active = indices.includes(g);
    }

    #RestoreBindGroups()
    {
        const groups = this.#PrevBindGroups.map(({ bindGroup }) => bindGroup);
        const offsets = this.#PrevBindGroups.map(({ dynamicOffsets }) => dynamicOffsets);
        const dynamicOffsets = offsets.some(o => typeof o === "number") && offsets || void 0;
        const indices = this.#PrevBindGroups.map(({ active }, g) => active && g).filter(g => typeof g === "number");

        this.SetBindGroups(groups, dynamicOffsets);
        this.SetActiveBindGroups(indices);
    }

    ClearBindGroups()
    {
        this.BindGroups.splice(0);
    }

    CreateCommandEncoder()
    {
        return this.#CommandEncoder = this.Device.createCommandEncoder({ label: this.#CommandEncoderLabel });
    }

    /** @param {GPUCommandEncoder} commandEncoder */
    SetCommandEncoder(commandEncoder)
    {
        this.#CommandEncoder = commandEncoder;
    }

    /** @protected @param {boolean} [required = false] */
    GetCommandEncoder(required = false)
    {
        if (!this.#CommandEncoder)
        {
            if (required)
            {
                const message = ` ${this.#CommandEncoderLabel && `Label: "${this.#CommandEncoderLabel}". `}`;
                ThrowWarning(ERROR.COMMAND_ENCODER_NOT_FOUND, message + "Creating a new one.");
            }

            return this.CreateCommandEncoder();
        }

        return this.#CommandEncoder;
    }

    /** @protected */
    DestroyCommandEncoder()
    {
        this.#CommandEncoder = undefined;
    }

    /** @protected */
    SubmitCommandBuffer()
    {
        this.Device.queue.submit([this.#CommandEncoder.finish()]);
    }

    /** @protected */
    SavePipelineState()
    {
        this.#PrevPipeline = this.Pipeline;
        this.#PrevDescriptor = this.Descriptor;
        this.#PrevBindGroups = [...this.BindGroups];
    }

    /** @protected */
    RestorePipelineState()
    {
        this.Descriptor = this.#PrevDescriptor;
        this.Pipeline = this.#PrevPipeline;
        this.#RestoreBindGroups();
    }

    /** @param {string} label */
    set CommandEncoderLabel(label)
    {
        this.#CommandEncoderLabel = label;
    }

    /** @protected */
    get ProgramName()
    {
        return this.#ProgramName;
    }
}
