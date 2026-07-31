/** @module MSDFFont */

import { TextureUtils } from "#/textures";
import { ERROR, ThrowError } from "#/Errors";
import { BINDINGS } from "#/pipelines/Constants";

/**
 * @typedef {Map<number, Map<number, number>>} Kernings
 *
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
 * @property {number} base
 * @property {number} redChnl
 * @property {number} greenChnl
 * @property {number} blueChnl
 * @property {number} alphaChnl
 * @property {number} lineHeight
 * @property {number} scaleW
 * @property {number} scaleH
 * @property {number} packed
 * @property {number} pages
 *
 * @typedef {Object} Kerning
 * @property {number} first
 * @property {number} second
 * @property {number} amount
 *
 * @typedef {Object} Font
 * @property {Char[]} chars
 * @property {Common} common
 * @property {string[]} pages
 * @property {Kerning[]} [kernings]
 *
 * @exports Font
 */

/**
 * An MSDF font management class, designed specifically for internal usage.
 */
export class MSDFFont
{
    /** @type {import("../textures/Texture").Texture | undefined} */ #Texture;
    /** @type {Map<number, Char> | undefined} */ #Characters;
    /** @type {GPUBuffer | undefined} */ #CharactersBuffer;
    /** @type {GPUTexture[] | undefined} */ #PageTextures;
    /** @type {Char | undefined} */ #DefaultCharacter;

    /** @type {Kernings | undefined} */ #Kernings;
    /** @type {boolean} */ #Generated = false;
    /** @type {number} */ #LineHeight = 0x20;
    /** @type {Font | undefined} */ #Font;

    /** @type {string} */ #Label;

    /**
     * @param {string} [label = "MSDFFont"] - Name of the font
     * @param {boolean} [generated = false] - Whether the font was generated with [this tool](https://msdf-bmfont.donmccurdy.com/)
     */
    constructor(label = "MSDFFont", generated = false)
    {
        this.#Generated = generated;
        this.#Label = label;
    }

    #SetKernings()
    {
        if (!this.#Font?.kernings) return;
        this.#Kernings = new Map();

        for (const kerning of this.#Font.kernings)
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

    /**
     * Get character information when measuring the text.
     * @param {number} code - Character code to get info about
     */
    GetCharacter(code)
    {
        return /** @type {Char} */ (/** @type {Map<number, Char>} */
            (this.#Characters).get(code) ?? this.#DefaultCharacter
        );
    }

    /** @param {string} url */
    async #LoadTexture(url)
    {
        return this.#Texture && this.#Texture.CopyImageToTexture(
            await this.#Texture.CreateImageBitmap(url), {
                create: { label: `${this.#Label} Font Texture` },
                mipmaps: false, flipY: false
            }
        );
    }

    /**
     * Load and parse the font from a URL and save its character info into a storage buffer.
     * @param {RenderPipeline} Pipeline - Text pipeline
     * @param {string} url - URL to load the font from
     * @param {RequestInit} [requestOptions] - Optional `fetch` request options
     */
    async CreateBindGroupResources(Pipeline, url, requestOptions)
    {
        this.#Characters = new Map();
        const dir = url.lastIndexOf("/") + 1;

        this.#Texture = new (await TextureUtils());
        const baseUrl = dir && url.substring(0, dir) || "";

        this.#Font = /** @type {Font} */ (await (await fetch(url, requestOptions)).json());
        const pages = this.#Font.pages.map(page => this.#LoadTexture(baseUrl + page));
        this.#PageTextures = /** @type {GPUTexture[]} */ (await Promise.all(pages));

        this.#CharactersBuffer = Pipeline.CreateStorageBuffer("Characters",
        {
            label: `${this.#Label} Characters Buffer`,
            length: this.#Font.chars.length,
            mappedAtCreation: true
        }).buffer;

        const Characters = new Float32Array(this.#CharactersBuffer.getMappedRange());

        for (
            let c = 0, o = 0, l = this.#Font.chars.length,
            w = 1 / this.#Font.common.scaleW,
            h = 1 / this.#Font.common.scaleH;
            c < l; o += 8, ++c
        ) {
            const char = this.#Font.chars[c];

            Characters[o + 0] =  char.x      * w;
            Characters[o + 1] =  char.y      * h;
            Characters[o + 2] =  char.width  * w;
            Characters[o + 3] =  char.height * h;
            Characters[o + 4] =  char.width     ;
            Characters[o + 5] =  char.height    ;
            Characters[o + 6] =  char.xoffset   ;
            Characters[o + 7] = -char.yoffset   ;

            this.#Characters.set(char.id, Object.assign({ c }, char));
        }

        this.#SetKernings();

        this.#CharactersBuffer.unmap();

        this.#LineHeight = this.#Font.common.lineHeight;

        // Get the "question mark" character if present, otherwise the first one in the `characters` map:
        this.#DefaultCharacter = this.#Characters.get(63) ?? this.#Characters.entries().next().value?.[1];

        return this.BindGroupResources;
    }

    /**
     * Get the distance in pixels a line should advance for a given character.
     * If the next character is given, any kerning between the two characters will be taken into account.
     * @param {number} code - Code of the character to advance
     * @param {number} [nextCode = -1] - Code of the next character
     */
    GetXAdvance(code, nextCode = -1)
    {
        const character = this.GetCharacter(code);

        if (nextCode > -1)
        {
            const kerning = this.#Kernings?.get(code);
            if (kerning) return character.xadvance + (kerning.get(nextCode) || 0);
        }

        return character.xadvance;
    }

    /**
     * Create layout entries for the text bind group layout.
     * @param {Renderer} Renderer - `Renderer` instance to create layout entries
     */
    static GetBindGroupLayoutEntries(Renderer)
    {
        return [
            Renderer.CreateSamplerBindingLayout(), Renderer.CreateTextureBindingLayout(),
            Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, GPUShaderStage.VERTEX),
            Renderer.CreateBufferBindingLayout(void 0, false, 0, GPUShaderStage.VERTEX, BINDINGS.CAMERA_MATRIX)
        ];
    }

    /** @returns {Record<string, GPUBindingResource>} Font bind group resources. */
    get BindGroupResources()
    {
        !(this.#CharactersBuffer && this.#PageTextures && this.#Texture) && ThrowError(
            ERROR.FONT_RESOURCES_NOT_FOUND, `Call \`MSDFText.LoadFont\` method before setting a font instance.`
        );

        return {
            sampler: /** @type {import("../textures/Texture").Texture} */ (this.#Texture).CreateSampler({
                label: `${this.#Label} Sampler`, maxAnisotropy: 16, filter: "linear"
            }),
            texture: /** @type {GPUTexture[]} */ (this.#PageTextures)[0],
            buffer: /** @type {GPUBuffer} */ (this.#CharactersBuffer)
        };
    }

    /** @returns {number} Line height defined by the font. */
    get LineHeight()
    {
        return this.#LineHeight;
    }

    /** @returns {boolean} Whether the font was generated with [this tool](https://msdf-bmfont.donmccurdy.com/). */
    get Generated()
    {
        return this.#Generated;
    }

    /** Destroy font and page textures. */
    Destroy()
    {
        this.#PageTextures?.forEach(texture => texture?.destroy());
        return this.#Texture?.Destroy();
    }
}
