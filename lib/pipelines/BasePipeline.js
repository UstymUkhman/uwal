import { USAGE } from "@/pipelines";
import { WgslReflect } from "wgsl_reflect";
import EmptyShader from "@/shaders/Empty.wgsl";
import { ERROR, ThrowError, ThrowWarning } from "@/Errors";
import { GetBaseType, GetTypeBytes, GetTypedArray } from "@/utils";

/**
 * @typedef {Float32Array | Uint32Array | Int32Array} TypedArray
 * @typedef {TypedArray | LayoutView | LayoutView[]} Layout
 * @typedef {{ [name: string]: Layout }} LayoutView
 *
 * @typedef {
       Pick<Partial<GPUBufferDescriptor>, "usage"> &
       Omit<GPUBufferDescriptor, "usage"> &
       Omit<GPUBufferDescriptor, "size">
   } BufferDescriptor
 *
 * @exports BufferDescriptor
 */

/** @abstract */ export default class BasePipeline
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
    /** @protected @type {WgslReflect | undefined} */ Reflect;
    /** @type {GPUCommandEncoder | undefined} */ #CommandEncoder;
    /** @protected @type {GPURenderPipeline | GPUComputePipeline} */ Pipeline;
    /** @protected @type {GPURenderPassDescriptor | GPUComputePassDescriptor} */ Descriptor;

    /** @type {GPURenderPassDescriptor | GPUComputePassDescriptor} */ #PrevDescriptor;
    /** @type {GPURenderPipeline | GPUComputePipeline} */ #PrevPipeline;
    /** @type {WgslReflect | undefined} */ #PrevReflect;
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
        label ??= this.CreatePipelineLabel(`${this.#Type} Pipeline Layout`);
        const bindGroupLayouts = /** @type {GPUBindGroupLayout[]} */ (Array.isArray(layouts) && layouts || [layouts]);
        return this.Device.createPipelineLayout({ label, bindGroupLayouts });
    }

    /**
     * @param {GPUQuerySet} querySet
     * @param {GPUSize32} [beginningOfPassWriteIndex]
     * @param {GPUSize32} [endOfPassWriteIndex]
     */
    CreateTimestampWrites(querySet, beginningOfPassWriteIndex, endOfPassWriteIndex)
    {
        return { querySet, beginningOfPassWriteIndex, endOfPassWriteIndex };
    }

    /**
     * @param {GPUQuerySet} querySet
     * @param {GPUBuffer} destination
     * @param {GPUSize32} [firstQuery = 0]
     * @param {GPUSize32} [queryCount = querySet.count]
     * @param {GPUSize64} [destinationOffset = 0]
     */
    ResolveQuerySet(querySet, destination, firstQuery = 0, queryCount = querySet.count, destinationOffset = 0)
    {
        this.GetCommandEncoder(true).resolveQuerySet(querySet, firstQuery, queryCount, destination, destinationOffset);
    }

    /**
     * @param {string | string[]} [shader]
     * @param {string} [label]
     * @param {any} [sourceMap]
     * @param {GPUShaderModuleCompilationHint[]} [hints]
     */
    CreateShaderModule(shader, label, sourceMap, hints)
    {
        if (!shader)
        {
            shader = EmptyShader;
            ThrowWarning(ERROR.SHADER_CODE_NOT_FOUND);
        }

        label ??= this.CreatePipelineLabel("Shader Module");
        const code = (/** @type {string} */ (Array.isArray(shader) && shader.join("\n\n") || shader));

        this.Reflect = new WgslReflect(code);
        return this.Device.createShaderModule({ label, code, sourceMap, compilationHints: hints });
    }

    /**
     * @protected
     * @typedef {{ module?: GPUShaderModule }} PipelineDescriptor
     * @param {GPUShaderModule | PipelineDescriptor} moduleDescriptor
     */
    GetShaderModule(moduleDescriptor)
    {
        return moduleDescriptor instanceof GPUShaderModule && moduleDescriptor ||
            /** @type {PipelineDescriptor} */ (moduleDescriptor).module;
    }

    /** @param {GPUBufferDescriptor} descriptor */
    CreateBuffer(descriptor)
    {
        const label = descriptor.label ?? this.CreatePipelineLabel("Buffer");
        return this.Device.createBuffer({ label, ...descriptor });
    }

    /**
     * @typedef {Pick<Partial<GPUBufferDescriptor>, "usage"> & Omit<GPUBufferDescriptor, "usage">} Descriptor
     * @param {GPUSize64 | Descriptor} sizeOrDescriptor
     */
    CreateReadableBuffer(sizeOrDescriptor)
    {
        let size = typeof sizeOrDescriptor === "number" && sizeOrDescriptor;
        size ||= /** @type {Descriptor} */ (sizeOrDescriptor).size;
        const label = sizeOrDescriptor?.label ?? "Readable Buffer";
        return this.CreateBuffer({ label, size, usage: USAGE.READABLE, ...sizeOrDescriptor });
    }

    /**
     * @typedef {Pick<Partial<GPUBufferDescriptor>, "usage"> & Omit<GPUBufferDescriptor, "usage">} Descriptor
     * @param {GPUSize64 | Descriptor} sizeOrDescriptor
     */
    CreateWritableBuffer(sizeOrDescriptor)
    {
        let size = typeof sizeOrDescriptor === "number" && sizeOrDescriptor;
        size ||= /** @type {Descriptor} */ (sizeOrDescriptor).size;
        const label = sizeOrDescriptor?.label ?? "Writable Buffer";
        return this.CreateBuffer({ label, size, usage: USAGE.WRITABLE, ...sizeOrDescriptor });
    }

    /**
     * @todo Add Support for `Float16Array` in `TypedArray` return type.
     * @see Implementation in `Utils.GetTypedArray`, `ERROR.FORMAT_NOT_SUPPORTED` is thrown.
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array
     *
     * @param {import("wgsl_reflect").MemberInfo} member
     * @param {ArrayBuffer} buffer
     * @param {number} [lastOffset = 0]
     * @param {Object[]} [views = []]
     *
     * @returns {Layout}
     */
    #CreateMemberLayout(member, buffer, lastOffset = 0, views = [])
    {
        const { format } = /** @type {import("wgsl_reflect").TemplateInfo} */ (member.type);

        const members = /** @type {import("wgsl_reflect").StructInfo} */ (member.type).members ??
            // `format` can have `members` array only when it's an array of struct:
            /** @type {import("wgsl_reflect").StructInfo} */ (format)?.members;

        let offset = lastOffset + (member.offset ?? 0);

        if (members)
            // Create a new struct for each element of `format.members` array:
            for (let c = 0, v = {}, l = (format?.isStruct && member.count || 1); c < l; ++c)
            {
                members.forEach(member => v[member.name] = this.#CreateMemberLayout(member, buffer, offset));
                format?.isStruct && (offset += member.stride);
                views.push(v);
            }
        else
        {
            const type = GetBaseType((format ?? member.type).name);
            const length = member.size / GetTypeBytes(type);
            const TypedArray = GetTypedArray(type);

            return new TypedArray(buffer, offset, length);
        }

        return views.length === 1 && views[0] || views;
    }

    /**
     * @param {string} storageName
     * @param {number | BufferDescriptor & { length: number }} [descriptor]
     * @returns {{ [storageName: string]: Layout, buffer: GPUBuffer }}
     */
    CreateStorageBuffer(storageName, descriptor = 1)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`CreateStorageBuffer\`.
            Use \`CreateShaderModule\` before creating a storage buffer.`
        );

        const storage = this.Reflect.storage.find(({ name }) => storageName === name);
        !storage && ThrowError(ERROR.STORAGE_NOT_FOUND, `\`${storageName}\` in shader bindings.`);

        const length = (typeof descriptor === "number" && descriptor) || descriptor.length;
        const label = descriptor.label ?? `${storageName} Storage Buffer`;

        const byteLength = storage.format.size * length;
        const arrayBuffer = new ArrayBuffer(byteLength);

        /** @param {Layout} layout */
        const CreateTypedArrays = (layout) =>
        {
            Object.keys(layout).forEach(member =>
            {
                if (!(layout[member].buffer instanceof ArrayBuffer))
                    CreateTypedArrays(layout[member]);
                else
                {
                    const TypedArray = layout[member].constructor;
                    const length = byteLength / TypedArray.BYTES_PER_ELEMENT;
                    layout[member] = new TypedArray(arrayBuffer, 0, length);
                }
            });

            return layout;
        };

        const layout = this.#CreateMemberLayout(/** @type import("wgsl_reflect").MemberInfo */
            (/** @type {unknown} */ storage), arrayBuffer
        );

        return {
            buffer: this.CreateBuffer({ label, size: byteLength, usage: USAGE.STORAGE, ...descriptor }),
            [storageName]: layout.buffer instanceof ArrayBuffer
                ? new layout.constructor(arrayBuffer, 0, length)
                : CreateTypedArrays(layout)
        };
    }

    /**
     * @param {string} uniformName
     * @param {BufferDescriptor} [descriptor]
     * @returns {{ [uniformName: string]: Layout, buffer: GPUBuffer }}
     */
    CreateUniformBuffer(uniformName, descriptor)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`CreateUniformBuffer\`.
            Use \`CreateShaderModule\` before creating a uniform buffer.`
        );

        const uniform = this.Reflect.uniforms.find(({ name }) => uniformName === name);
        !uniform && ThrowError(ERROR.UNIFORM_NOT_FOUND, `\`${uniformName}\` in shader uniforms.`);
        uniformName === "resolution" && ThrowWarning(ERROR.INVALID_UNIFORM_NAME, `\`${uniformName}\`.`);

        const label = descriptor?.label ?? `${uniformName} Uniform Buffer`;
        const arrayBuffer = new ArrayBuffer(uniform.size);

        return {
            buffer: this.CreateBuffer({ label, size: arrayBuffer.byteLength, usage: USAGE.UNIFORM, ...descriptor }),
            [uniformName]: this.#CreateMemberLayout(/** @type import("wgsl_reflect").MemberInfo */
                (/** @type {unknown} */ uniform), arrayBuffer
            )
        };
    }

    /**
     * @deprecated Use `CreateUniformBuffer` instead.
     * @param {string} uniformName
     */
    CreateUniformBufferLayout(uniformName)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`CreateUniformBufferLayout\`.
            Use \`CreateShaderModule\` before creating a uniform buffer layout.`
        );

        const uniform = this.Reflect.uniforms.find(({ name }) => uniformName === name);
        !uniform && ThrowError(ERROR.UNIFORM_NOT_FOUND, `\`${uniformName}\` in shader uniforms.`);
        uniformName === "resolution" && ThrowWarning(ERROR.INVALID_UNIFORM_NAME, `\`${uniformName}\`.`);

        return this.#CreateMemberLayout(/** @type import("wgsl_reflect").MemberInfo */
            (/** @type {unknown} */ (uniform)), new ArrayBuffer(uniform.size)
        );
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
     * @param {GPUSize64} [size = destination.size]
     * @param {GPUSize64} [sourceOffset = 0]
     * @param {GPUSize64} [destinationOffset = 0]
     */
    CopyBufferToBuffer(source, destination, size = destination.size, sourceOffset = 0, destinationOffset = 0)
    {
        this.GetCommandEncoder(true).copyBufferToBuffer(source, sourceOffset, destination, destinationOffset, size);
    }

    #GetBindingLayoutVisibility()
    {
        return (this.#Type === "Render" && GPUShaderStage.FRAGMENT) || GPUShaderStage.COMPUTE;
    }

    /** @param {string} bindingName */
    GetBufferMinBindingSize(bindingName)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`GetBufferMinBindingSize\`.
            Use \`CreateShaderModule\` before requesting buffer's min binding size.`
        );

        const groups = this.Reflect.getBindGroups().flat();
        const binding = groups.find(({ name }) => bindingName === name);
        return binding?.size ?? ThrowError(ERROR.BINDING_NOT_FOUND, `\`${bindingName}\` in shader bind groups.`);
    }

    /**
     * @param {GPUBufferBindingType} [type]
     * @param {boolean} [hasDynamicOffset]
     * @param {GPUSize64} [minBindingSize]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateBufferBindingLayout(type, hasDynamicOffset, minBindingSize, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, buffer: { type, hasDynamicOffset, minBindingSize } };
    }

    /**
     * @param {GPUSamplerBindingType} [type]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateSamplerBindingLayout(type, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, sampler: { type } };
    }

    /**
     * @param {GPUTextureSampleType} [sampleType]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {boolean} [multisampled]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateTextureBindingLayout(sampleType, viewDimension, multisampled, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, texture: { sampleType, viewDimension, multisampled } };
    }

    /**
     * @param {GPUTextureFormat} format
     * @param {GPUStorageTextureAccess} [access]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateStorageTextureBindingLayout(format, access, viewDimension, visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, storageTexture: { access, format, viewDimension } };
    }

    /**
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateExternalTextureBindingLayout(visibility, binding)
    {
        visibility ??= this.#GetBindingLayoutVisibility();
        return { binding, visibility, externalTexture: {} };
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
     * @typedef {
           Pick<Partial<GPUBindGroupLayoutEntry>, "binding"> &
           Omit<GPUBindGroupLayoutEntry, "binding">
       } BindGroupLayoutEntry
     * @param {BindGroupLayoutEntry | BindGroupLayoutEntry[]} entries
     * @param {string} [label]
     */
    CreateBindGroupLayout(entries, label)
    {
        label ??= this.CreatePipelineLabel("Bind Group Layout");

        entries = /** @type {BindGroupLayoutEntry[]} */ (Array.isArray(entries)
            && entries.map((entry, binding) => ({ ...entry, binding: entry.binding ?? binding }))
            || [{ ...entries, binding: /** @type {BindGroupLayoutEntry} */ (entries).binding ?? 0 }]);

        return this.Device.createBindGroupLayout({ entries, label });
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
        const groupsArray = Array.isArray(bindGroups);
        const offsetsArray = Array.isArray(dynamicOffsets);

        dynamicOffsets = groupsArray && offsetsArray
            ? dynamicOffsets.map(offsets => (Array.isArray(offsets) && offsets) || [offsets])
            : (offsetsArray && dynamicOffsets) || dynamicOffsets && [dynamicOffsets];

        dynamicOffsets = (dynamicOffsets && dynamicOffsets) || [];

        this.BindGroups = /** @type {BindGroup[]} */ (groupsArray
            && bindGroups.map((bindGroup, g) => ({ bindGroup, dynamicOffsets, active: true }))
            || [{ bindGroup: bindGroups, dynamicOffsets, active: true }]
        );
    }

    /**
     * @param {GPUBindGroup | GPUBindGroup[]} bindGroups
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    AddBindGroups(bindGroups, dynamicOffsets)
    {
        const groupsArray = Array.isArray(bindGroups);
        const offsetsArray = Array.isArray(dynamicOffsets);

        dynamicOffsets = groupsArray && offsetsArray
            ? dynamicOffsets.map(offsets => (Array.isArray(offsets) && offsets) || [offsets])
            : (offsetsArray && dynamicOffsets) || dynamicOffsets && [dynamicOffsets];

        dynamicOffsets = (dynamicOffsets && dynamicOffsets) || [];

        // @ts-ignore
        return this.BindGroups.push(...(groupsArray
            && bindGroups.map((bindGroup, g) => ({ bindGroup, dynamicOffsets, active: true }))
            || [{ bindGroup: bindGroups, dynamicOffsets, active: true }])
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

    /**
     * @returns {{
           label: string,
           isActive: boolean,
           dynamicOffsets: GPUBufferDynamicOffset[],
           bindings: import("wgsl_reflect").VariableInfo[]
       }[]}
     */
    GetBindGroupsInfo()
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`GetBindGroupsInfo\`.
            Use \`CreateShaderModule\` before requesting bind groups information.`
        );

        const l = this.BindGroups.length;
        const bindGroupsInfo = new Array(l);
        const groups = this.Reflect.getBindGroups();

        for (let g = 0; g < l; ++g)
        {
            const { bindGroup: { label }, dynamicOffsets, active } = this.BindGroups[g];
            bindGroupsInfo[g] = { label, isActive: active, dynamicOffsets, bindings: groups[g] };
        }

        return bindGroupsInfo;
    }

    CreateCommandEncoder()
    {
        return this.#CommandEncoder = this.Device.createCommandEncoder({ label: this.#CommandEncoderLabel });
    }

    /** @param {GPUCommandEncoder} [commandEncoder] */
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
                const message = `${this.#CommandEncoderLabel && `Label: "${this.#CommandEncoderLabel}".`}`;
                ThrowWarning(ERROR.COMMAND_ENCODER_NOT_FOUND, ` ${message} ` + "Creating a new one.");
            }

            return this.CreateCommandEncoder();
        }

        return this.#CommandEncoder;
    }

    SubmitCommandBuffer()
    {
        this.Device.queue.submit([this.#CommandEncoder.finish()]);
    }

    /** @param {GPURenderPipeline | GPUComputePipeline} pipeline */
    SetPipeline(pipeline)
    {
        return this.Pipeline = pipeline;
    }

    /** @protected */
    SavePipelineState()
    {
        this.#PrevReflect = this.Reflect;
        this.#PrevPipeline = this.Pipeline;
        this.#PrevDescriptor = this.Descriptor;
        this.#PrevBindGroups = [...this.BindGroups];
    }

    /** @protected */
    ResetPipelineState()
    {
        this.ClearBindGroups();
    }

    /** @protected */
    RestorePipelineState()
    {
        this.Descriptor = this.#PrevDescriptor;
        this.SetPipeline(this.#PrevPipeline);
        this.Reflect = this.#PrevReflect;
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

    Destroy()
    {
        this.ResetPipelineState();
        this.#PrevReflect = void 0;
        this.#PrevBindGroups.splice(0);
        this.SetCommandEncoder(undefined);
    }
}
