import { GetParamArray, CreateBuffer, WriteBuffer } from "#/utils";
import { ERROR, ThrowWarning, ThrowError } from "#/Errors";
import EmptyShader from "#/shaders/Empty.wgsl";
import { USAGE } from "#/pipelines/Constants";
import { WgslReflect } from "wgsl_reflect";

/**
 * @template {ArrayBufferLike} TArrayBuffer
 * @typedef {Float16Array<TArrayBuffer> |
 *     Float32Array<TArrayBuffer>       |
 *     Uint32Array<TArrayBuffer>        |
 *     Int32Array<TArrayBuffer>
 * } TypedArray<TArrayBuffer>
 *
 * @exports TypedArray<TArrayBuffer>
 */

/**
 * @typedef {string | string[]} ShaderCode
 *
 * @typedef {Object} BindGroup
 * @property {GPUBindGroup} bindGroup
 * @property {GPUBufferDynamicOffset[]} [dynamicOffsets]
 * @property {boolean} active
 *
 * @typedef {Object} ShaderModuleDescriptor
 * @property {string} [pipelineName = ""]
 * @property {ShaderCode} [shader]
 * @property {string} [label]
 * @property {GPUShaderModuleCompilationHint[]} [hints]
 *
 * @typedef {Object} BasePipelineDescriptor
 * @property {string} [label]
 * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
 * @property {GPUShaderModule} [module]
 *
 * @typedef {Pick<Partial<GPUBufferDescriptor>, "usage" | "size"> &
 *     Omit<GPUBufferDescriptor, "usage" | "size">
 * } BufferDescriptor
 *
 * @typedef {Pick<Partial<GPUBindGroupLayoutEntry>, "binding"> &
 *     Omit<GPUBindGroupLayoutEntry, "binding">
 * } BindGroupLayoutEntry
 *
 * @exports ShaderCode, BindGroup, ShaderModuleDescriptor
 * @exports BasePipelineDescriptor, BufferDescriptor, BindGroupLayoutEntry
 */

/** @abstract */ export default class BasePipeline
{
    /** @type {string} */ #Name;
    /** @type {boolean} */ Active;
    /** @type {number} */ Index = 0;

    /** @type {"Compute" | "Render"} */ #Type;
    /** @protected @type {GPUDevice} */ Device;
    /** @type {BindGroup[]} */ BindGroups = [];

    /** @protected @type {WgslReflect | undefined} */ Reflect;
    /** @type {GPURenderPipeline | GPUComputePipeline | undefined} */ GPUPipeline;

    /**
     * @typedef {Pick<Partial<GPUBufferDescriptor>, "usage"> & Omit<GPUBufferDescriptor, "usage">} Descriptor
     * @typedef {TypedArray<ArrayBufferLike> | LayoutView | LayoutView[]} Layout
     * @typedef {BufferDescriptor & { length?: number }} StorageBufferDescriptor
     * @typedef {import("wgsl_reflect").MemberInfo} MemberInfo
     * @typedef {{ [name: string]: Layout }} LayoutView
     * @import { VariableInfo } from "wgsl_reflect"
     */

    /**
     * @param {GPUDevice} device
     * @param {"Compute" | "Render"} type
     * @param {string} [name = ""]
     */
    constructor(device, type, name = "")
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
    CreatePipelineLabel(label)
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
        label ??= /*@__INLINE__*/ this.CreatePipelineLabel(`${this.#Type} Pipeline Layout`);
        bindGroupLayouts = /** @type {BindGroupLayout[]} */ (GetParamArray(bindGroupLayouts));
        return this.Device.createPipelineLayout({ label, bindGroupLayouts });
    }

    /**
     * @param {ShaderCode} [shader]
     * @param {string} [label]
     * @param {GPUShaderModuleCompilationHint[]} [hints]
     */
    CreateShaderModule(shader, label, hints)
    {
        if (!shader)
        {
            shader = EmptyShader;
            ThrowWarning(ERROR.SHADER_CODE_NOT_FOUND);
        }

        label ??= /*@__INLINE__*/ this.CreatePipelineLabel("Shader Module");
        const code = (/** @type {string} */ (Array.isArray(shader) && shader.join("\n\n") || shader));

        this.Reflect = new WgslReflect(code);
        return this.Device.createShaderModule({ label, code, compilationHints: hints });
    }

    /**
     * @param {MemberInfo} member
     * @param {ArrayBuffer} buffer
     * @param {number} [lastOffset = 0]
     * @param {LayoutView[]} [views = []]
     * @returns {Layout}
     */
    #CreateMemberLayout(member, buffer, lastOffset = 0, views = [])
    {
        const { format } = /** @type {import("wgsl_reflect").TemplateInfo} */ (member.type);

        const members = /** @type {import("wgsl_reflect").StructInfo} */ (member.type).members ??
            // `format` can have `members` array only when it's an array of struct:
            /** @type {import("wgsl_reflect").StructInfo} */ (format)?.members;

        let offset = lastOffset + (member.offset || 0);

        if (members)
            // Create a new struct for each element of `format.members` array:
            for (
                let c = 0, v = /** @type {Record<string, Layout>} */ ({}),
                l = (format?.isStruct && member.count || 1); c < l; ++c
            ) {
                members.forEach(member => v[member.name] = this.#CreateMemberLayout(member, buffer, offset));
                format?.isStruct && (offset += member.stride);
                views.push(v);
            }

        else
        {
            let type = (format ?? member.type).name;

            type = type === "f16" || type.includes("h") ? "f16" :
                type.includes("f") ? "f32" : type.includes("u") ? "u32" : "i32";

            const TypedArray = type === "f16" ? Float16Array : type === "f32"
                ? Float32Array : type === "u32" ? Uint32Array : Int32Array;

            return new TypedArray(buffer, offset, member.size / (+type.slice(1) / 8));
        }

        return views.length === 1 && views[0] || views;
    }

    /** @param {GPUBufferDescriptor} descriptor */
    CreateBuffer(descriptor)
    {
        const label = descriptor.label ?? /*@__INLINE__*/ this.CreatePipelineLabel("Buffer");
        return /*@__INLINE__*/ CreateBuffer(this.Device, { label, ...descriptor });
    }

    /** @param {GPUSize64 | Descriptor} sizeOrDescriptor */
    CreateReadableBuffer(sizeOrDescriptor)
    {
        const sizeDescriptor = typeof sizeOrDescriptor === "number";
        const usage = USAGE.READABLE | (!sizeDescriptor && sizeOrDescriptor.usage || 0);

        let size = sizeDescriptor && sizeOrDescriptor;
        size ||= /** @type {Descriptor} */ (sizeOrDescriptor).size;

        const label = sizeDescriptor ? "Readable Buffer" : sizeOrDescriptor.label;
        return this.CreateBuffer({ label, .../** @type {Descriptor} */ (sizeOrDescriptor), size, usage });
    }

    /** @param {GPUSize64 | Descriptor} sizeOrDescriptor */
    CreateWritableBuffer(sizeOrDescriptor)
    {
        const sizeDescriptor = typeof sizeOrDescriptor === "number";
        const usage = USAGE.WRITABLE | (!sizeDescriptor && sizeOrDescriptor.usage || 0);

        let size = sizeDescriptor && sizeOrDescriptor;
        size ||= /** @type {Descriptor} */ (sizeOrDescriptor).size;

        const label = sizeDescriptor ? "Writable Buffer" : sizeOrDescriptor.label;
        return this.CreateBuffer({ label, .../** @type {Descriptor} */ (sizeOrDescriptor), size, usage });
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

        const uniform = /** @type {WgslReflect} */ (this.Reflect).uniforms.find(({ name }) => uniformName === name);
        !uniform && ThrowError(ERROR.UNIFORM_NOT_FOUND, `\`${uniformName}\` in shader uniforms.`);
        uniformName === "resolution" && ThrowWarning(ERROR.INVALID_UNIFORM_NAME, `\`${uniformName}\`.`);

        const arrayBuffer = new ArrayBuffer(/** @type {VariableInfo} */ (uniform).size);
        const label = descriptor?.label ?? `${uniformName} Uniform Buffer`;
        const usage = USAGE.UNIFORM | (descriptor?.usage || 0);

        return /** @type {{ [Name in UniformName]: Layout } & { buffer: GPUBuffer }} */ ({
            buffer: this.CreateBuffer({ label, size: arrayBuffer.byteLength, ...descriptor, usage }),
            [uniformName]: this.#CreateMemberLayout(/** @type {MemberInfo} */
                (/** @type {unknown} */ (uniform)), arrayBuffer
            )
        });
    }

    /**
     * @template {string} StorageName
     * @param {StorageName} storageName
     * @param {StorageBufferDescriptor | number} [descriptor]
     * @returns {{ [Name in StorageName]: Layout } & { buffer: GPUBuffer }}
     */
    CreateStorageBuffer(storageName, descriptor = 1)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.CreateStorageBuffer\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before creating a storage buffer.`
        );

        const storage = /** @type {WgslReflect} */ (this.Reflect).storage.find(({ name }) => storageName === name);
        !storage && ThrowError(ERROR.STORAGE_NOT_FOUND, `\`${storageName}\` in shader bindings.`);

        const lengthDescriptor = typeof descriptor === "number";
        const usage = USAGE.STORAGE | (!lengthDescriptor && descriptor.usage || 0);
        const label = !lengthDescriptor && descriptor.label || `${storageName} Storage Buffer`;
        const length = lengthDescriptor && descriptor || /** @type {StorageBufferDescriptor} */ (descriptor).length || 0;

        const size = /** @type {BufferDescriptor} */ (descriptor).size ??
            (/** @type {VariableInfo} */ (storage).format?.size || 0) * length;

        const arrayBuffer = new ArrayBuffer(size);

        /** @param {Layout} layout */
        const CreateTypedArrays = (layout) =>
        {
            Object.keys(layout).forEach(member =>
            {
                let typedLayout = /** @type {TypedArray<ArrayBufferLike>} */ (
                    /** @type {LayoutView} */ (layout)[member]
                );

                if (!(typedLayout.buffer instanceof ArrayBuffer))
                    CreateTypedArrays(typedLayout);

                else
                {
                    const TypedArray = /** @type {Float32ArrayConstructor} */ (typedLayout.constructor);
                    typedLayout = new TypedArray(arrayBuffer, 0, size / TypedArray.BYTES_PER_ELEMENT);
                }
            });

            return layout;
        };

        const layout = this.#CreateMemberLayout(/** @type import("wgsl_reflect").MemberInfo */
            (/** @type {unknown} */ (storage)), arrayBuffer
        );

        return /** @type {{ [Name in StorageName]: Layout } & { buffer: GPUBuffer }} */ ({
            buffer: this.CreateBuffer({ label, size, .../** @type {StorageBufferDescriptor} */ (descriptor), usage }),
            [storageName]: /** @type {TypedArray<ArrayBufferLike>} */ (layout).buffer instanceof ArrayBuffer
                ? new /** @type {Float32ArrayConstructor} */ (layout.constructor)(arrayBuffer, 0, length)
                : CreateTypedArrays(layout)
        });
    }

    /**
     * @param {GPUBuffer} buffer
     * @param {GPUAllowSharedBufferSource} data
     * @param {GPUSize64} [bufferOffset = 0]
     * @param {GPUSize64} [dataOffset]
     * @param {GPUSize64} [size]
     */
    WriteBuffer(buffer, data, bufferOffset = 0, dataOffset, size)
    {
        /*@__INLINE__*/ WriteBuffer(this.Device.queue, buffer, data, bufferOffset, dataOffset, size);
    }

    /** @param {string} bindingName */
    GetBufferMinBindingSize(bindingName)
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.GetBufferMinBindingSize\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before requesting buffer's min binding size.`
        );

        const groups = /** @type {WgslReflect} */ (this.Reflect).getBindGroups().flat();
        const binding = groups.find(({ name }) => bindingName === name);
        return binding?.size ?? ThrowError(ERROR.BINDING_NOT_FOUND, `\`${bindingName}\` in shader bind groups.`);
    }

    /**
     * @param {GPUBindingResource | GPUBindingResource[]} resources
     * @param {GPUIndex32 | GPUIndex32[]} [bindings = 0]
     * @param {GPUBindGroupLayout | number} [layout = 0]
     * @param {string} [label]
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    SetBindGroupFromResources(resources, bindings = 0, layout = 0, label, dynamicOffsets)
    {
        return this.SetBindGroups(this.CreateBindGroup(
            this.CreateBindGroupEntries(resources, bindings), layout, label
        ), dynamicOffsets);
    }

    /**
     * @param {GPUBindingResource | GPUBindingResource[]} resources
     * @param {GPUIndex32 | GPUIndex32[]} [bindings = 0]
     * @param {GPUBindGroupLayout | number} [layout = 0]
     * @param {string} [label]
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    AddBindGroupFromResources(resources, bindings = 0, layout = 0, label, dynamicOffsets)
    {
        return this.AddBindGroups(this.CreateBindGroup(
            this.CreateBindGroupEntries(resources, bindings), layout, label
        ), dynamicOffsets);
    }

    /**
     * @param {GPUBindingResource | GPUBindingResource[]} resources
     * @param {GPUIndex32 | GPUIndex32[]} [bindings = 0]
     */
    CreateBindGroupEntries(resources, bindings = 0)
    {
        return /** @type {GPUBindGroupEntry[]} */ (
            !Array.isArray(resources) && [{ binding: bindings, resource: resources }]
            || /** @type {GPUBindingResource[]} */ (resources).map((resource, binding) => ({
                binding: /** @type {GPUIndex32[]} */ (bindings)?.[binding] || binding, resource })
            )
        );
    }

    /**
     * @param {BindGroupLayoutEntry | BindGroupLayoutEntry[]} entries
     * @param {string} [label]
     */
    CreateBindGroupLayout(entries, label)
    {
        label ??= /*@__INLINE__*/ this.CreatePipelineLabel("Bind Group Layout");

        entries = /** @type {BindGroupLayoutEntry[]} */ (Array.isArray(entries)
            && entries.map((entry, binding) => ({ ...entry, binding: entry.binding || binding }))
            || [{ ...entries, binding: /** @type {BindGroupLayoutEntry} */ (entries).binding || 0 }]);

        return this.Device.createBindGroupLayout({ entries: /** @type {GPUBindGroupLayoutEntry[]} */ (entries), label });
    }

    /**
     * @param {GPUBindGroupEntry[]} entries
     * @param {GPUBindGroupLayout | number} [layout = 0]
     * @param {string} [label]
     */
    CreateBindGroup(entries, layout = 0, label)
    {
        label ??= /*@__INLINE__*/ this.CreatePipelineLabel("Bind Group");

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

        dynamicOffsets = /** @type {number[]} */ (groupsArray && offsetsArray
            ? /** @type {number[] | number[][]} */ (dynamicOffsets).map(GetParamArray)
            : (offsetsArray && dynamicOffsets) || dynamicOffsets && [dynamicOffsets]);

        dynamicOffsets = (dynamicOffsets && dynamicOffsets) || [];

        return this.BindGroups = /** @type {BindGroup[]} */ (groupsArray
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

        dynamicOffsets = /** @type {number[]} */ (groupsArray && offsetsArray
            ? /** @type {number[] | number[][]} */ (dynamicOffsets).map(GetParamArray)
            : (offsetsArray && dynamicOffsets) || dynamicOffsets && [dynamicOffsets]);

        dynamicOffsets = (dynamicOffsets && dynamicOffsets) || [];

        this.BindGroups.push(.../** @type {BindGroup[]} */ (groupsArray
            && bindGroups.map((bindGroup) => ({ bindGroup, dynamicOffsets, active: true }))
            || [{ bindGroup: bindGroups, dynamicOffsets, active: true }])
        );

        return this.BindGroups;
    }

    /** @param {number | number[]} indices */
    SetActiveBindGroups(indices)
    {
        indices = /** @type {number[]} */ /*@__INLINE__*/ (GetParamArray(indices));

        for (let g = this.BindGroups.length; g--; )
            this.BindGroups[g].active = indices.includes(g);
    }

    /** @param {GPUComputePassEncoder | GPURenderPassEncoder} passEncoder */
    UseBindGroups(passEncoder)
    {
        for (let g = 0, a = 0, l = this.BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.BindGroups[g];
            active && passEncoder.setBindGroup(a++, bindGroup, dynamicOffsets);
        }
    }

    /**
     * @returns {{
     *     label: string,
     *     active: boolean,
     *     bindings: VariableInfo[],
     *     dynamicOffsets: GPUBufferDynamicOffset[]
     * }[]}
     */
    GetBindGroupsInfo()
    {
        !this.Reflect && ThrowError(ERROR.SHADER_MODULE_NOT_FOUND, `\`${this.#Type}Pipeline.GetBindGroupsInfo\`.
            Use \`${this.#Type}Pipeline.CreateShaderModule\` before requesting bind groups information.`
        );

        const l = this.BindGroups.length; const bindGroupsInfo = new Array(l);
        const groups = /** @type {WgslReflect} */ (this.Reflect).getBindGroups();

        for (let g = 0; g < l; ++g)
        {
            const { bindGroup: { label }, dynamicOffsets, active } = this.BindGroups[g];
            bindGroupsInfo[g] = { label, active, dynamicOffsets, bindings: groups[g] };
        }

        return bindGroupsInfo;
    }

    ClearBindGroups()
    {
        this.BindGroups.splice(0);
    }

    Destroy()
    {
        this.ClearBindGroups();
    }
}
