export default class MSDFFont
{
    /** @type {import("./MSDFText").Kernings | undefined} */ #Kernings;
    /** @typedef {import("./MSDFText").Char} Char */

    /** @type {Char} */ #DefaultCharacter;
    /** @type {Char[]} */ #Characters;
    /** @type {number} */ #LineHeight;

    /**
     * @param {JSON} font
     * @param {Map<number, Char>} characters
     */
    constructor(font, characters)
    {
        this.#Characters = Array.from(characters.values());
        this.#DefaultCharacter = this.#Characters[0];
        this.#LineHeight = font.common.lineHeight;

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
        return this.#Characters[code] ?? this.#DefaultCharacter;
    }

    /**
     * @param {number} code
     * @param {number} [nextCode]
     * @description Gets the distance in pixels a line should advance for a given character code. If the
     * next character code is given, any kerning between the two characters will be taken into account.
     */
    GetXAdvance(code, nextCode = -1)
    {
        const character = this.GetCharacter(code);

        if (nextCode > -1)
        {
            const kerning = this.#Kernings.get(code);
            if (kerning) return character.xadvance + (kerning.get(nextCode) ?? 0);
        }

        return character.xadvance;
    }

    get LineHeight()
    {
        return this.#LineHeight;
    }
}
