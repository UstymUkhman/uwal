import { ERROR, ThrowError } from "#/Errors";
import { Device } from "#/index";

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
    /** @type {GPUBindGroupLayout | undefined} */ static #BindGroupLayout;
    /** @type {import("../textures").Texture | undefined} */ #Texture;

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
     * @param {string} [label = "MSDFFont"]
     * @param {boolean} [generated = false]
     */
    constructor(label = "MSDFFont", generated = false)
    {
        this.#Generated = generated;
        this.#Label = label;
    }

    SetKernings()
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

    /** @param {number} code */
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
            await this.#Texture.CreateImageBitmap(url),
            { mipmaps: false, create: { label: `${this.#Label} Font Texture` } }
        );
    }

    /**
     * @param {Renderer} Renderer
     * @param {RenderPipeline} Pipeline
     */
    static CreateBindGroupLayout(Renderer, Pipeline)
    {
        return MSDFFont.#BindGroupLayout = Pipeline.CreateBindGroupLayout([
            Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, GPUShaderStage.VERTEX),
            Renderer.CreateTextureBindingLayout(), Renderer.CreateSamplerBindingLayout(),
            Renderer.CreateBufferBindingLayout(void 0, false, 0, GPUShaderStage.VERTEX)
        ]);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} url
     * @param {RequestInit} [requestOptions]
     */
    async CreateBindGroupResources(Pipeline, url, requestOptions)
    {
        this.#Characters = new Map();
        const dir = url.lastIndexOf("/") + 1;

        this.#Texture = new (await Device.Texture());
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

        this.SetKernings();

        this.#CharactersBuffer.unmap();

        this.#LineHeight = this.#Font.common.lineHeight;

        // Get the "question mark" character if present, otherwise the first one in the `characters` map:
        this.#DefaultCharacter = this.#Characters.get(63) ?? this.#Characters.entries().next().value?.[1];

        return this.BindGroupResources;
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

    static get BindGroupLayout()
    {
        return MSDFFont.#BindGroupLayout;
    }

    /**
     * @todo Add multi-page fonts support.
     * @see https://github.com/UstymUkhman/uwal/issues/9
     */
    get BindGroupResources()
    {
        !(this.#CharactersBuffer && this.#PageTextures && this.#Texture) && ThrowError(
            ERROR.FONT_RESOURCES_NOT_FOUND, `Call \`MSDFText.LoadFont\` method before setting a font instance.`
        );

        return {
            buffer: /** @type {GPUBuffer} */ (this.#CharactersBuffer),
            texture: /** @type {GPUTexture[]} */ (this.#PageTextures)[0].createView(),
            sampler: /** @type {import("../textures").Texture} */ (this.#Texture).CreateSampler({
                label: `${this.#Label} Sampler`, maxAnisotropy: 16, filter: "linear"
            })
        };
    }

    get LineHeight()
    {
        return this.#LineHeight;
    }

    get Generated()
    {
        return this.#Generated;
    }

    Destroy()
    {
        this.#PageTextures?.forEach(texture => texture?.destroy());
        this.#Texture?.Destroy();
    }
}
