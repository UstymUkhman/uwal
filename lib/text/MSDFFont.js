/**
 * @typedef {Readonly<Record<
       "x" |
       "y" |
       "id" |
       "chnl" |
       "page" |
       "index" |
       "width" |
       "height" |
       "xoffset" |
       "yofsset" |
       "xadvance" |
       "charIndex",
       number
   > & Readonly<Record<"char", string>>>} Char
 *
 * @typedef {Map<number, Map<number, number>>} Kernings
 */

export default class MSDFFont
{
    /** @type {Kernings | undefined} */ #Kernings;
    /** @type {Map<string, Char>} */ #Characters;
    /** @type {Char} */ #DefaultCharacter;
    /** @type {number} */ #LineHeight;

    /**
     * @param {JSON} font
     * @param {Map<string, Char>} characters
     */
    constructor(font, characters)
    {
        this.#DefaultCharacter = characters.get("?") ?? characters.entries().next().value[1];
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

    /** @param {string} char */
    GetCharacter(char)
    {
        return this.#Characters.get(char) ?? this.#DefaultCharacter;
    }

    /**
     * @param {string} char
     * @param {number} [nextCode = -1]
     * @description Gets the distance in pixels a line should advance for a given character. If the
     * next character is given, any kerning between the two characters will be taken into account.
     */
    GetXAdvance(char, nextCode = -1)
    {
        const character = this.GetCharacter(char);

        if (nextCode > -1)
        {
            const kerning = this.#Kernings.get(char.charCodeAt(0));
            if (kerning) return character.xadvance + (kerning.get(nextCode) ?? 0);
        }

        return character.xadvance;
    }

    get LineHeight()
    {
        return this.#LineHeight;
    }
}
