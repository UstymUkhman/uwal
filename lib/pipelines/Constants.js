import { CreateConstantObject } from "#/utils";

/** @type {GPUBlendComponent} */ const copy            = { operation: "add", srcFactor: "one",                 dstFactor: "zero"                };
/** @type {GPUBlendComponent} */ const additive        = { operation: "add", srcFactor: "one",                 dstFactor: "one"                 };
/** @type {GPUBlendComponent} */ const sourceOver      = { operation: "add", srcFactor: "one",                 dstFactor: "one-minus-src-alpha" };
/** @type {GPUBlendComponent} */ const destinationOver = { operation: "add", srcFactor: "one-minus-dst-alpha", dstFactor: "one"                 };
/** @type {GPUBlendComponent} */ const sourceIn        = { operation: "add", srcFactor: "dst-alpha",           dstFactor: "zero"                };
/** @type {GPUBlendComponent} */ const destinationIn   = { operation: "add", srcFactor: "zero",                dstFactor: "src-alpha"           };
/** @type {GPUBlendComponent} */ const sourceOut       = { operation: "add", srcFactor: "one-minus-dst-alpha", dstFactor: "zero"                };
/** @type {GPUBlendComponent} */ const destinationOut  = { operation: "add", srcFactor: "zero",                dstFactor: "one-minus-src-alpha" };
/** @type {GPUBlendComponent} */ const alphaBlending   = { operation: "add", srcFactor: "src-alpha",           dstFactor: "one-minus-src-alpha" };
/** @type {GPUBlendComponent} */ const sourceAtop      = { operation: "add", srcFactor: "dst-alpha",           dstFactor: "one-minus-src-alpha" };
/** @type {GPUBlendComponent} */ const destinationAtop = { operation: "add", srcFactor: "one-minus-dst-alpha", dstFactor: "src-alpha"           };

/**
 * @typedef {Readonly<Record<
 *     "COPY"             |
 *     "ADDITIVE"         |
 *     "SOURCE_OVER"      |
 *     "DESTINATION_OVER" |
 *     "SOURCE_IN"        |
 *     "DESTINATION_IN"   |
 *     "SOURCE_OUT"       |
 *     "DESTINATION_OUT"  |
 *     "ALPHA_ADDITIVE"   |
 *     "SOURCE_ATOP"      |
 *     "DESTINATION_ATOP",
 *     GPUBlendState
 * >>} BlendState
 * @type {BlendState}
 */
export const BLEND_STATE = /*@__PURE__*/ CreateConstantObject(
{
    COPY            : CreateConstantObject({ color: copy,            alpha: copy            }),
    ADDITIVE        : CreateConstantObject({ color: additive,        alpha: additive        }),
    SOURCE_OVER     : CreateConstantObject({ color: sourceOver,      alpha: sourceOver      }),
    DESTINATION_OVER: CreateConstantObject({ color: destinationOver, alpha: destinationOver }),
    SOURCE_IN       : CreateConstantObject({ color: sourceIn,        alpha: sourceIn        }),
    DESTINATION_IN  : CreateConstantObject({ color: destinationIn,   alpha: destinationIn   }),
    SOURCE_OUT      : CreateConstantObject({ color: sourceOut,       alpha: sourceOut       }),
    DESTINATION_OUT : CreateConstantObject({ color: destinationOut,  alpha: destinationOut  }),
    ALPHA_ADDITIVE  : CreateConstantObject({ color: alphaBlending,   alpha: additive        }),
    SOURCE_ATOP     : CreateConstantObject({ color: sourceAtop,      alpha: sourceAtop      }),
    DESTINATION_ATOP: CreateConstantObject({ color: destinationAtop, alpha: destinationAtop })
});

/**
 * @typedef {Readonly<Record<
 *     "INDEX"    |
 *     "VERTEX"   |
 *     "STORAGE"  |
 *     "UNIFORM"  |
 *     "READABLE" |
 *     "WRITABLE" |
 *     "QUERY",
 *     GPUBufferUsageFlags
 * >>} Usage
 * @type {Usage}
 */
export const USAGE = /*@__PURE__*/ CreateConstantObject(
{
    INDEX:    GPUBufferUsage.INDEX         | GPUBufferUsage.COPY_DST,
    VERTEX:   GPUBufferUsage.VERTEX        | GPUBufferUsage.COPY_DST,
    STORAGE:  GPUBufferUsage.STORAGE       | GPUBufferUsage.COPY_DST,
    UNIFORM:  GPUBufferUsage.UNIFORM       | GPUBufferUsage.COPY_DST,
    READABLE: GPUBufferUsage.MAP_READ      | GPUBufferUsage.COPY_DST,
    WRITABLE: GPUBufferUsage.MAP_WRITE     | GPUBufferUsage.COPY_SRC,
    QUERY:    GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
});

/**
 * @typedef {Readonly<Record<
 *     "CAMERA_MATRIX"          |
 *     "SHAPE_MATRIX"           |
 *     "MESH_MATRIX"            |
 *     "COLOR"                  |
 *     "COLOR_MAP"              |
 *     "MAP_SAMPLER"            |
 *     "EMISSIVE_COLOR"         |
 *     "EMISSIVE_COLOR_MAP"     |
 *     "EMISSIVE_MAP_SAMPLER"   |
 *     "AMBIENT_LIGHT"          |
 *     "DIRECTIONAL_LIGHT"      |
 *     "POINT_LIGHT"            |
 *     "SPOT_LIGHT",
 *     GPUIndex32
 * >>} Bindings
 * @type {Bindings}
 */
export const BINDINGS = /*@__PURE__*/ CreateConstantObject(
{
    CAMERA_MATRIX:          10,
    SHAPE_MATRIX:           20,
    MESH_MATRIX:            30,

    COLOR:                  40,
    COLOR_MAP:              41,
    MAP_SAMPLER:            42,

    EMISSIVE_COLOR:         43,
    EMISSIVE_COLOR_MAP:     44,
    EMISSIVE_MAP_SAMPLER:   45,

    NORMAL_COLOR_MAP:       46,
    NORMAL_MAP_SAMPLER:     47,

    MATCAP_COLOR_MAP:       48,
    MATCAP_MAP_SAMPLER:     49,

    AMBIENT_LIGHT:          50,
    DIRECTIONAL_LIGHT:      51,
    POINT_LIGHT:            52,
    SPOT_LIGHT:             53
});
