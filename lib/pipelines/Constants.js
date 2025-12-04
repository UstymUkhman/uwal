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
