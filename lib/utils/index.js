import Color from "#/Color";
import { NUMBER } from "#/Constants";
import { ERROR, ThrowError } from "#/Errors";
export { default as GPUTiming } from "#/utils/GPUTiming";

/**
 * @template {string} K
 * @template V
 * @param {Record<K, V>} values
 * @returns {Readonly<Record<K, V>>}
 */
export function CreateConstantObject(values)
{
    for (let value in values)
        values[value] = /** @type {V} */ ({
            value: values[value]
        });

    return Object.freeze(Object.create(null, values));
}

/** @param {number} degrees */
export function DegreesToRadians(degrees)
{
    return NUMBER.RAD * degrees;
}

/** @param {number} radians */
export function RadiansToDegrees(radians)
{
    return NUMBER.DEG * radians;
}

export function EuclideanModulo(dividend, divisor)
{
    return ((dividend % divisor) + divisor) % divisor;
}

/**
 * @param {number} value
 * @param {number} [min = 0]
 * @param {number} [max = 1]
 */
export function SmootherStep(value, min = 0, max = 1)
{
    if (value <= min) return 0;
    if (value >= max) return 1;

    value = (value - min) / (max - min);
    return value * value * value * (value * (value * 6 - 15) + 10);
}

/**
 * @param {number} value
 * @param {number} [min = 0]
 * @param {number} [max = 1]
 */
export function SmoothStep(value, min = 0, max = 1)
{
    if (value <= min) return 0;
    if (value >= max) return 1;

    value = (value - min) / (max - min);
    return value * value * (3 - 2 * value);
}

/** @param {number} size */
export function GetDefaultVertexFormat(size)
{
    switch (size)
    {
        case 2:
            return "unorm8x2";

        case 4:
            return "float32";

        case 8:
            return "float32x2";

        case 12:
            return "float32x3";

        case 16:
            return "float32x4";
    }
}

/** @param {GPUVertexFormat} format */
export function GetVertexFormatSize(format)
{
    switch (format)
    {
        case "uint8x2":
        case "sint8x2":
        case "unorm8x2":
        case "snorm8x2":
            return 2;

        case "uint32":
        case "sint32":
        case "float32":
        case "uint8x4":
        case "sint8x4":
        case "unorm8x4":
        case "snorm8x4":
        case "uint16x2":
        case "sint16x2":
        case "unorm16x2":
        case "snorm16x2":
        case "float16x2":
            return 4;

        case "uint16x4":
        case "sint16x4":
        case "uint32x2":
        case "sint32x2":
        case "unorm16x4":
        case "snorm16x4":
        case "float16x4":
        case "float32x2":
            return 8;

        case "uint32x3":
        case "sint32x3":
        case "float32x3":
            return 12;

        case "uint32x4":
        case "sint32x4":
        case "float32x4":
            return 16;
    }

    return 0;
}

/** @param {string} type */
export function GetBaseType(type)
{
    return type === "f16" || type.includes("h")
        ? "f16" : type.includes("f") ? "f32"
        : type.includes("u") ? "u32" : "i32";
}

/** @param {string} type */
export function GetTypeBytes(type)
{
    return +type.slice(1) / 8;
}

/** @param {string} type */
export function GetTypedArray(type)
{
    return type === "f16" ? Float16Array : type === "f32" ? Float32Array : type === "u32" ? Uint32Array : Int32Array;
}

/**
 * @template {unknown | unknown[]} P
 * @param {P} param
 * @returns {P[]}
 */
export function GetParamArray(param)
{
    return Array.isArray(param) && param || [param];
}

/** @param {import("../Color").ColorParam} color */
export function GetGPUColorValue(color)
{
    return color instanceof Color ? color.rgba : color;
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
