export default class Color {
    /**
     * @param {number} [hexOrRed = 0x000000]
     * @param {number} [green]
     * @param {number} [blue]
     * @param {number} [alpha = 0xff]
     */
    constructor(hexOrRed?: number | undefined, green?: number | undefined, blue?: number | undefined, alpha?: number | undefined);
    /** @param {number[]} values */
    set RGBA(values: number[]);
    get RGBA(): number[];
    /**
     * @param {number} [alpha]
     * @param {Color} [dst]
     */
    Premultiply(alpha?: number | undefined, dst?: Color | undefined): Color;
    /** @param {number[]} values */
    set rgb(values: number[]);
    get rgb(): number[];
    /** @param {number} value */
    set a(value: number);
    get a(): number;
    /** @param {number[]} values */
    set rgba(values: number[]);
    get rgba(): number[];
    /** @param {number[]} values */
    set RGB(values: number[]);
    get RGB(): number[];
    /** @param {number} value */
    set A(value: number);
    get A(): number;
    #private;
}
//# sourceMappingURL=Color.d.ts.map