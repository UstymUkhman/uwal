export * as MathUtils from "./Math";
import { Color } from "./Color";
export { Color };

/**
 * @template {Record<string, unknown>} O
 * @param {O} target
 * @param {O} [source]
 * @returns {O}
 */
export function MergeObjects(target = /** @type {O} */ ({}), source)
{
    source && Object.keys(source).forEach(key =>
    {
        const value = /** @type {O} */ (source[key]);

        /** @type {Record<string, unknown>} */ (target)[key] =
            !Array.isArray(value) && typeof value === "object"
                ? key in target
                    ? MergeObjects(/** @type {O} */ (target[key]), value)
                    : value
                : value;
    });

    return target;
}

/**
 * @template {string} K
 * @template V
 * @param {Record<K, V>} values
 * @returns {Readonly<Record<K, V>>}
 */
export function CreateConstantObject(values)
{
    for (let value in values)
        values[value] = /** @type {V} */ ({ value: values[value] });

    return Object.freeze(Object.create(null, /** @type {PropertyDescriptorMap} */ (values)));
}

/** @param {unknown | unknown[]} param */
export function GetParamArray(param)
{
    return Array.isArray(param) && param || [param];
}

/**
 * @param {import("./Color").ColorParam} color
 * @returns {number[]}
 */
export function GetGPUColorValue(color)
{
    return color instanceof Color && color.rgba || Object.values(color);
}

/**
 * @param {number} color
 * @param {number} [alpha = 0xff]
 */
export function GetColorArray(color, alpha = 0xff)
{
    return [(color >> 16 & 0xff) / 255, (color >> 8 & 0xff) / 255, (color & 0xff) / 255, alpha / 255];
}

/**
 * @typedef {{ module?: GPUShaderModule }} PipelineDescriptor
 * @param {GPUShaderModule | PipelineDescriptor} moduleDescriptor
 */
export function GetShaderModule(moduleDescriptor)
{
    return moduleDescriptor instanceof GPUShaderModule && moduleDescriptor ||
        /** @type {PipelineDescriptor} */ (moduleDescriptor).module;
}

/**
 * @typedef {import("../pipelines/RenderPipeline").DrawParams} DrawParams
 * @param {DrawParams} DrawParams
 * @param {GPUSize32} count
 * @param {GPUSize32} [instanceCount]
 * @param {GPUSize32} [first]
 * @param {GPUSize32} [firstInstance]
 * @param {GPUSignedOffset32} [baseVertex]
 */
export function SetDrawParams(DrawParams, count, instanceCount, first, firstInstance, baseVertex)
{
    DrawParams[0] = count;
    DrawParams[1] = instanceCount;
    DrawParams[2] = first;
    DrawParams[3] = firstInstance;
    DrawParams[4] = baseVertex;

    if (baseVertex !== undefined)
    {
        DrawParams[3] = baseVertex;
        DrawParams[4] = firstInstance;
    }

    return DrawParams;
}
