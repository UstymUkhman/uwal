import { GetParamArray } from "#/utils";
import { WgslReflect } from "wgsl_reflect";
import EmptyShader from "#/shaders/Empty.wgsl";
import { ERROR, ThrowWarning } from "#/Errors";

/**
 * @typedef {Object} BasePipelineDescriptor
 * @property {string} [label]
 * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
 * @property {GPUShaderModule} [module]
 * @exports BasePipelineDescriptor
 */

/** @abstract */ export default class BasePipeline
{
    /** @type {"Compute" | "Render"} */ #Type;
    /** @type {string} */ #ProgramName;
    /** @type {string} */ #CommandEncoderLabel;

    /** @protected @type {GPUDevice} */ Device;
    /** @protected @type {WgslReflect | undefined} */ Reflect;
    /** @protected @type {GPURenderPipeline | GPUComputePipeline} */ Pipeline;

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
        this.#CommandEncoderLabel = this.CreatePipelineLabel("Command Encoder");
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
}
