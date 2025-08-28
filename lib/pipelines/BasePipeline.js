import { WgslReflect } from "wgsl_reflect";
import { USAGE } from "#/pipelines/Constants";
import EmptyShader from "#/shaders/Empty.wgsl";
import { ERROR, ThrowWarning, ThrowError } from "#/Errors";
import { GetParamArray, GetBaseType, GetTypeBytes, GetTypedArray, CreateBuffer, WriteBuffer } from "#/utils";

/**
 * @typedef {string | string[]} ShaderCode
 *
 * @typedef {Object} ShaderModuleDescriptor
 * @property {string} [pipelineName = ""]
 * @property {ShaderCode} [shader]
 * @property {string} [label]
 * @property {any} [sourceMap]
 * @property {GPUShaderModuleCompilationHint[]} [hints]
 *
 * @typedef {Object} BasePipelineDescriptor
 * @property {string} [label]
 * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
 * @property {GPUShaderModule} [module]
 *
 * @typedef {
       Pick<Partial<GPUBufferDescriptor>, "usage"> &
       Omit<GPUBufferDescriptor, "usage"> &
       Omit<GPUBufferDescriptor, "size">
   } BufferDescriptor
 *
 * @exports ShaderCode, ShaderModuleDescriptor, BasePipelineDescriptor, BufferDescriptor
 */

/** @abstract */ export default class BasePipeline
{
    /**
     * @typedef {Object} BindGroup
     * @property {GPUBindGroup} bindGroup
     * @property {GPUBufferDynamicOffset[]} [dynamicOffsets]
     * @property {boolean} active
     */

    /** @type {string} */ #Name;
    /** @type {boolean} */ Active;

    /** @type {"Compute" | "Render"} */ #Type;
    /** @protected @type {GPUDevice} */ Device;
    /** @type {BindGroup[]} */ #BindGroups = [];

    /** @protected @type {WgslReflect | undefined} */ Reflect;
    /** @type {GPURenderPipeline | GPUComputePipeline} */ GPUPipeline;

    /**
     * @typedef {Float16Array | Float32Array | Uint32Array | Int32Array} TypedArray
     * @typedef {TypedArray | LayoutView | LayoutView[]} Layout
     * @typedef {{ [name: string]: Layout }} LayoutView
     */

    /**
     * @param {GPUDevice} device
     * @param {"Compute" | "Render"} type
     * @param {string} [name = ""]
     */
    constructor(device, type, name)
    {
        this.#Name = name;
        this.#Type = type;
        this.Active = true;
        this.Device = device;
    }

    /**
     * @protected
     * @param {string} [label = ""]
     */
    /*#__INLINE__*/ CreatePipelineLabel(label)
    {
        return this.#Name && label && `${this.#Name} ${label}` || "";
    }

    /**
     * @typedef {GPUBindGroupLayout | undefined | null} BindGroupLayout
     * @param {BindGroupLayout | BindGroupLayout[]} bindGroupLayouts
     * @param {string} [label]
     */
    CreatePipelineLayout(bindGroupLayouts, label)
    {
        label ??= this.CreatePipelineLabel(`${this.#Type} Pipeline Layout`);
        bindGroupLayouts = /** @type {BindGroupLayout[]} */ (GetParamArray(bindGroupLayouts));
        return this.Device.createPipelineLayout({ label, bindGroupLayouts });
    }

    /**
     * @param {ShaderCode} [shader]
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
     * @param {import("wgsl_reflect").MemberInfo} member
     * @param {ArrayBuffer} buffer
     * @param {number} [lastOffset = 0]
     * @param {Object[]} [views = []]
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
        {
            // Create a new struct for each element of `format.members` array:
            for (let c = 0, v = {}, l = (format?.isStruct && member.count || 1); c < l; ++c)
            {
                members.forEach(member => v[member.name] = this.#CreateMemberLayout(member, buffer, offset));
                format?.isStruct && (offset += member.stride);
                views.push(v);
            }
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

    /** @param {GPUBufferDescriptor} descriptor */
    CreateBuffer(descriptor)
    {
        const label = descriptor.label ?? this.CreatePipelineLabel("Buffer");
        return CreateBuffer(this.Device, { label, ...descriptor });
    }

    /**
     * @typedef {Pick<Partial<GPUBufferDescriptor>, "usage"> & Omit<GPUBufferDescriptor, "usage">} Descriptor
     * @param {GPUSize64 | Descriptor} sizeOrDescriptor
     */
    CreateReadableBuffer(sizeOrDescriptor)
    {
        const sizeDescriptor = typeof sizeOrDescriptor === "number";
        const usage = USAGE.READABLE | (!sizeDescriptor && sizeOrDescriptor.usage || 0);

        let size = sizeDescriptor && sizeOrDescriptor;
        size ||= /** @type {Descriptor} */ (sizeOrDescriptor).size;

        const label = sizeOrDescriptor?.label ?? "Readable Buffer";
        return this.CreateBuffer({ label, size, ...sizeOrDescriptor, usage });
    }

    /**
     * @typedef {Pick<Partial<GPUBufferDescriptor>, "usage"> & Omit<GPUBufferDescriptor, "usage">} Descriptor
     * @param {GPUSize64 | Descriptor} sizeOrDescriptor
     */
    CreateWritableBuffer(sizeOrDescriptor)
    {
        const sizeDescriptor = typeof sizeOrDescriptor === "number";
        const usage = USAGE.WRITABLE | (!sizeDescriptor && sizeOrDescriptor.usage || 0);

        let size = sizeDescriptor && sizeOrDescriptor;
        size ||= /** @type {Descriptor} */ (sizeOrDescriptor).size;

        const label = sizeOrDescriptor?.label ?? "Writable Buffer";
        return this.CreateBuffer({ label, size, ...sizeOrDescriptor, usage });
    }

    /**
     * @template {string} UniformName
     * @param {UniformName} uniformName
     * @param {BufferDescriptor} [descriptor]
     * @returns {{ [Name in UniformName]: Layout } & { buffer: GPUBuffer }}
     */
    CreateUniformBuffer(uniformName, descriptor)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.CreateUniformBuffer\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before creating a uniform buffer.`
        );

        const uniform = this.Reflect.uniforms.find(({ name }) => uniformName === name);
        !uniform && ThrowError(ERROR.UNIFORM_NOT_FOUND, `\`${uniformName}\` in shader uniforms.`);
        uniformName === "resolution" && ThrowWarning(ERROR.INVALID_UNIFORM_NAME, `\`${uniformName}\`.`);

        const label = descriptor?.label ?? `${uniformName} Uniform Buffer`;
        const arrayBuffer = new ArrayBuffer(uniform.size);
        const usage = USAGE.UNIFORM | descriptor?.usage;

        return {
            buffer: this.CreateBuffer({ label, size: arrayBuffer.byteLength, ...descriptor, usage }),
            [uniformName]: this.#CreateMemberLayout(/** @type import("wgsl_reflect").MemberInfo */
                (/** @type {unknown} */ (uniform)), arrayBuffer
            )
        };
    }

    /**
     * @template {string} StorageName
     * @param {StorageName} storageName
     * @param {(BufferDescriptor & { length: number }) | number} [descriptor]
     * @returns {{ [Name in StorageName]: Layout } & { buffer: GPUBuffer }}
     */
    CreateStorageBuffer(storageName, descriptor = 1)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.CreateStorageBuffer\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before creating a storage buffer.`
        );

        const storage = this.Reflect.storage.find(({ name }) => storageName === name);
        !storage && ThrowError(ERROR.STORAGE_NOT_FOUND, `\`${storageName}\` in shader bindings.`);

        const lengthDescriptor = typeof descriptor === "number";
        const length = lengthDescriptor && descriptor || descriptor.length;
        const usage = USAGE.STORAGE | (!lengthDescriptor && descriptor.usage || 0);
        const label = !lengthDescriptor && descriptor.label || `${storageName} Storage Buffer`;

        const byteLength = storage.format.size * length;
        const arrayBuffer = new ArrayBuffer(byteLength);

        /** @param {Layout} layout */
        const CreateTypedArrays = (layout) =>
        {
            Object.keys(layout).forEach(member =>
            {
                if (!(layout[member].buffer instanceof ArrayBuffer))
                {
                    CreateTypedArrays(layout[member]);
                }
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
            buffer: this.CreateBuffer({ label, size: byteLength, ...descriptor, usage }),
            [storageName]: layout.buffer instanceof ArrayBuffer
                ? new layout.constructor(arrayBuffer, 0, length)
                : CreateTypedArrays(layout)
        };
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
        WriteBuffer(this.Device.queue, ...arguments);
    }

    /** @param {string} bindingName */
    GetBufferMinBindingSize(bindingName)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.GetBufferMinBindingSize\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before requesting buffer's min binding size.`
        );

        const groups = this.Reflect.getBindGroups().flat();
        const binding = groups.find(({ name }) => bindingName === name);
        return binding?.size ?? ThrowError(ERROR.BINDING_NOT_FOUND, `\`${bindingName}\` in shader bind groups.`);
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
        {
            layout = /** @type {GPUBindGroupLayout} */ (this.GPUPipeline
                ? this.GPUPipeline.getBindGroupLayout(layout)
                : ThrowError(ERROR.PIPELINE_NOT_FOUND, `${this.#Type}Pipeline.
                    Use \`${this.#Type}Stage.AddPipeline\` before creating a bind group.`
                )
            );
        }

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
            ? dynamicOffsets.map(offsets => GetParamArray(offsets))
            : (offsetsArray && dynamicOffsets) || dynamicOffsets && [dynamicOffsets];

        dynamicOffsets = (dynamicOffsets && dynamicOffsets) || [];

        this.#BindGroups = /** @type {BindGroup[]} */ (groupsArray
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
            ? dynamicOffsets.map(offsets => GetParamArray(offsets))
            : (offsetsArray && dynamicOffsets) || dynamicOffsets && [dynamicOffsets];

        dynamicOffsets = (dynamicOffsets && dynamicOffsets) || [];

        return this.#BindGroups.push(...(groupsArray
            && bindGroups.map((bindGroup) => ({ bindGroup, dynamicOffsets, active: true }))
            || [{ bindGroup: bindGroups, dynamicOffsets, active: true }])
        );
    }

    /** @param {number | number[]} indices */
    SetActiveBindGroups(indices)
    {
        indices = /** @type {number[]} */ (GetParamArray(indices));

        for (let g = this.#BindGroups.length; g--; )
            this.#BindGroups[g].active = indices.includes(g);
    }

    /** @param {GPUComputePassEncoder | GPURenderPassEncoder} passEncoder */
    UseBindGroups(passEncoder)
    {
        for (let g = 0, a = 0, l = this.#BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.#BindGroups[g];
            active && passEncoder.setBindGroup(a++, bindGroup, dynamicOffsets);
        }
    }

    /**
     * @returns {{
           label: string,
           active: boolean,
           dynamicOffsets: GPUBufferDynamicOffset[],
           bindings: import("wgsl_reflect").VariableInfo[]
       }[]}
     */
    GetBindGroupsInfo()
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.GetBindGroupsInfo\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before requesting bind groups information.`
        );

        const l = this.#BindGroups.length;
        const bindGroupsInfo = new Array(l);
        const groups = this.Reflect.getBindGroups();

        for (let g = 0; g < l; ++g)
        {
            const { bindGroup: { label }, dynamicOffsets, active } = this.#BindGroups[g];
            bindGroupsInfo[g] = { label, active, dynamicOffsets, bindings: groups[g] };
        }

        return bindGroupsInfo;
    }

    ClearBindGroups()
    {
        this.#BindGroups.splice(0);
    }

    Destroy()
    {
        this.ClearBindGroups();
    }
}
