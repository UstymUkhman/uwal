import { CreateConstantObject } from "@/Utils";

/**
 * @readonly
 * @typedef {"HPI" | "TAU"} Constant
 * @type {Readonly<Record<Constant, number>>}
 */
export const NUMBER = CreateConstantObject(
{
    HPI: Math.PI / 2,
    TAU: Math.PI * 2
});
