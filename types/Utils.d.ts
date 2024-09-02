/**
 * @template {string} K
 * @template V
 * @param {Record<K, V>} values
 * @returns {Readonly<Record<K, V>>}
 */
export function CreateConstantObject<K extends string, V>(values: Record<K, V>): Readonly<Record<K, V>>;
/** @param {number} degrees */
export function DegreesToRadians(degrees: number): number;
/** @param {number} radians */
export function RadiansToDegrees(radians: number): number;
/** @param {number} size */
export function GetDefaultVertexFormat(size: number): "unorm8x2" | "float32" | "float32x2" | "float32x3" | "float32x4" | undefined;
/** @param {GPUVertexFormat} format */
export function GetVertexFormatSize(format: GPUVertexFormat): 2 | 0 | 4 | 8 | 12 | 16;
/** @param {string} type */
export function GetBaseType(type: string): "f16" | "f32" | "u32" | "i32";
/** @param {string} type */
export function GetTypeBytes(type: string): number;
/** @param {string} type */
export function GetTypedArray(type: string): Float32ArrayConstructor | Uint32ArrayConstructor | Int32ArrayConstructor;
//# sourceMappingURL=Utils.d.ts.map