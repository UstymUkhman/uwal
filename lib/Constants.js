import { CreateConstantObject } from "@/Utils";

export const NUMBER = CreateConstantObject(
{
    RAD: Math.PI / 180,
    DEG: 180 / Math.PI,

    HPI: Math.PI / 2,
    TAU: Math.PI * 2
});
