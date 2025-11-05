/**
 * @typedef {Object} Char
 * @property {number} c
 * @property {number} x
 * @property {number} y
 * @property {number} id
 * @property {string} char
 * @property {number} chnl
 * @property {number} page
 * @property {number} index
 * @property {number} width
 * @property {number} height
 * @property {number} xoffset
 * @property {number} yoffset
 * @property {number} xadvance
 *
 * @typedef {Object} Common
 * @property {number} alphaChnl
 * @property {number} base
 * @property {number} redChnl
 * @property {number} greenChnl
 * @property {number} blueChnl
 * @property {number} lineHeight
 * @property {number} scaleW
 * @property {number} scaleH
 * @property {number} packed
 * @property {number} pages
 *
 * @typedef {Map<number, Map<number, number>>} Kernings
 * @typedef {{ first: number, second: number, amount: number }} Kerning
 * @typedef {{ chars: Char[], common: Common, kernings?: Kerning[], pages: string[] }} Font
 *
 * @exports Font
 */

export default class MSDFFont
{
    /** @type {Kernings | undefined} */ #Kernings;
    /** @type {Map<number, Char>} */ #Characters;
    /** @type {Char} */ #DefaultCharacter;
    /** @type {number} */ #LineHeight;

    /**
     * @param {Font} font
     * @param {Map<number, Char>} characters
     */
    constructor(font, characters)
    {
        // Get the "question mark" character if present.
        this.#DefaultCharacter = characters.get(63) ??
            // Or the first character in the `characters` map if not.
            /** @type {[number, Char]} */ (characters.entries().next().value)[1];

        this.#LineHeight = font.common.lineHeight;
        this.#Characters = characters;

        if (!font.kernings) return;
        this.#Kernings = new Map();

        for (const kerning of font.kernings)
        {
            let charKerning = this.#Kernings.get(kerning.first);

            if (!charKerning)
            {
                charKerning = new Map();
                this.#Kernings.set(kerning.first, charKerning);
            }

            charKerning.set(kerning.second, kerning.amount);
        }
    }

    /** @param {number} code */
    GetCharacter(code)
    {
        return this.#Characters.get(code) ?? this.#DefaultCharacter;
    }

    /**
     * @param {number} code
     * @param {number} [nextCode = -1]
     * @description Gets the distance in pixels a line should advance for a given character. If the
     * next character is given, any kerning between the two characters will be taken into account.
     */
    GetXAdvance(code, nextCode = -1)
    {
        const character = this.GetCharacter(code);

        if (nextCode > -1)
        {
            const kerning = this.#Kernings?.get(code);
            if (kerning) return character.xadvance + (kerning.get(nextCode) ?? 0);
        }

        return character.xadvance;
    }

    get LineHeight()
    {
        return this.#LineHeight;
    }
}
