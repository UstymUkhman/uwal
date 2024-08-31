import { CreateConstantObject } from "@/Utils";

const copy            = { operation: "add", srcFactor: "one",                 dstFactor: "zero"                };
const additive        = { operation: "add", srcFactor: "one",                 dstFactor: "one"                 };
const sourceOver      = { operation: "add", srcFactor: "one",                 dstFactor: "one-minus-src-alpha" };
const destinationOver = { operation: "add", srcFactor: "one-minus-dst-alpha", dstFactor: "one"                 };
const sourceIn        = { operation: "add", srcFactor: "dst-alpha",           dstFactor: "zero"                };
const destinationIn   = { operation: "add", srcFactor: "zero",                dstFactor: "src-alpha"           };
const sourceOut       = { operation: "add", srcFactor: "one-minus-dst-alpha", dstFactor: "zero"                };
const destinationOut  = { operation: "add", srcFactor: "zero",                dstFactor: "one-minus-src-alpha" };
const sourceAtop      = { operation: "add", srcFactor: "dst-alpha",           dstFactor: "one-minus-src-alpha" };
const destinationAtop = { operation: "add", srcFactor: "one-minus-dst-alpha", dstFactor: "src-alpha"           };

export default CreateConstantObject(
{
    COPY            : CreateConstantObject({ color: copy,            alpha: copy            }),
    ADDITIVE        : CreateConstantObject({ color: additive,        alpha: additive        }),
    SOURCE_OVER     : CreateConstantObject({ color: sourceOver,      alpha: sourceOver      }),
    DESTINATION_OVER: CreateConstantObject({ color: destinationOver, alpha: destinationOver }),
    SOURCE_IN       : CreateConstantObject({ color: sourceIn,        alpha: sourceIn        }),
    DESTINATION_IN  : CreateConstantObject({ color: destinationIn,   alpha: destinationIn   }),
    SOURCE_OUT      : CreateConstantObject({ color: sourceOut,       alpha: sourceOut       }),
    DESTINATION_OUT : CreateConstantObject({ color: destinationOut,  alpha: destinationOut  }),
    SOURCE_ATOP     : CreateConstantObject({ color: sourceAtop,      alpha: sourceAtop      }),
    DESTINATION_ATOP: CreateConstantObject({ color: destinationAtop, alpha: destinationAtop })
});