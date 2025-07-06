import { USAGE } from "#/pipelines";
import { WgslReflect } from "wgsl_reflect";
import EmptyShader from "#/shaders/Empty.wgsl";
import { ERROR, ThrowWarning, ThrowError } from "#/Errors";
import { GetParamArray, GetBaseType, GetTypeBytes, GetTypedArray } from "#/utils";

/**
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
 * @exports BasePipelineDescriptor, BufferDescriptor
 */

/** @abstract */ export default class BasePipeline
{
    /**
     * @typedef {Object} BindGroup
     * @property {GPUBindGroup} bindGroup
     * @property {GPUBufferDynamicOffset[]} [dynamicOffsets]
     * @property {boolean} active
     */

    /** @type {string} */ #ProgramName;
    /** @type {boolean} */ Active = true;
    /** @type {"Compute" | "Render"} */ #Type;
    /** @type {BindGroup[]} */ BindGroups = [];

    /** @protected @type {GPUDevice} */ Device;
    /** @protected @type {WgslReflect | undefined} */ Reflect;
    /** @type {GPURenderPipeline | GPUComputePipeline} */ GPUPipeline;

    /**
     * @typedef {Float32Array | Uint32Array | Int32Array} TypedArray
     * @typedef {TypedArray | LayoutView | LayoutView[]} Layout
     * @typedef {{ [name: string]: Layout }} LayoutView
     */

    /**
     * @param {GPUDevice} device
     * @param {"Compute" | "Render"} type
     * @param {string} [programName = ""]
     */
    constructor(device, type, programName)
    {
        this.Device = device;
        this.#Type = type;
        this.#ProgramName = programName;
    }

    /**
     * @protected
     * @param {string} [label = ""]
     */
    /*#__INLINE__*/ CreatePipelineLabel(label)
    {
        return this.#ProgramName && label && `${this.#ProgramName} ${label}` || "";
    }

    /**
     * @protected
     * @typedef {{ module?: GPUShaderModule }} PipelineDescriptor
     * @param {GPUShaderModule | PipelineDescriptor} moduleDescriptor
     */
    /*#__INLINE__*/ GetShaderModule(moduleDescriptor)
    {
        return moduleDescriptor instanceof GPUShaderModule && moduleDescriptor ||
            /** @type {PipelineDescriptor} */ (moduleDescriptor).module;
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
                (/** @type {unknown} */ (uniform)), arrayBuffer
            )
        };
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

    ClearBindGroups()
    {
        this.BindGroups.splice(0);
    }

    Destroy()
    {
        this.ClearBindGroups();
    }
}
