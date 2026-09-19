/** @module MSDFFont */

import { Device } from "#/Device";
import { BINDINGS } from "#/pipelines/Constants";

/**
 * MSDF font management class, designed exclusively for internal usage.
 */
export class MSDFFont
{
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
     * @typedef {Map<number, Char>} Characters
     * @typedef {Map<number, Map<number, number>>} Kernings
     */

    /** @type {Record<string, GPUBindingResource> | undefined} */ #BindGroupResources;
    /** @type {GPUBuffer | undefined} */ #CharactersBuffer;
    /** @type {GPUTexture[] | undefined} */ #PageTextures;

    /** @type {Characters | undefined} */ #Characters;
    /** @type {Kernings | undefined} */ #Kernings;
    /** @type {Char | undefined} */ #DefaultChar;

    /** @type {boolean} */ #Generated = false;
    /** @type {number} */ #LineHeight = 0x20;

    /** @type {Font | undefined} */ #Font;
    /** @type {string} */ #Label = "";

    /**
     * @param {string} [label = "MSDFFont"] - Font label.
     * @param {boolean} [generated = false] - Whether the font was generated [here](https://msdf-bmfont.donmccurdy.com/).
     */
    constructor(label = "MSDFFont", generated = false)
    {
        this.#Generated = generated;
        this.#Label = label;
    }

    /**
     * @param {GPUDevice} device
     * @param {string} source
     * @param {RequestInit} [requestOptions]
     */
    async #LoadTexture(device, source, requestOptions)
    {
        const bitmap = await createImageBitmap(
            await (await fetch(source, requestOptions)).blob(),
            { colorSpaceConversion: "none" }
        );

        const texture = device.createTexture(
        {
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            size: { width: bitmap.width, height: bitmap.height },
            format: Device.PreferredCanvasFormat,
            label: `${this.#Label} Font Texture`,
            dimension: "2d"
        });

        device.queue.copyExternalImageToTexture({ source: bitmap, flipY: false }, { texture }, bitmap);

        return texture;
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
     * Get character information by its code.
     *
     * @param {number} code - Character code.
     */
    GetCharacter(code)
    {
        return /** @type {Char} */ (/** @type {Characters} */ (this.#Characters).get(code) ?? this.#DefaultChar);
    }

    /**
     * Get the distance in pixels the cursor should advance for a given character.
     * If the next character is given, any kerning between the two characters will be taken into account.
     *
     * @param {number} code - Character code.
     * @param {number} [nextCode = -1] - Next character code.
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
     * Load and parse a font from a valid source file and save its characters info into a storage buffer.
     *
     * @param {RenderPipeline} Pipeline - [MSDFText](./MSDFText) pipeline.
     * @param {string} url - Font source path.
     * @param {RequestInit} [requestOptions] - `fetch` request options.
     */
    async CreateBindGroupResources(Pipeline, url, requestOptions)
    {
        this.#Characters = new Map();
        const dir = url.lastIndexOf("/") + 1;

        const baseUrl = dir && url.substring(0, dir) || "";
        const device = /** @type {GPUDevice} */ (await Device.GPUDevice);

        this.#Font = /** @type {Font} */ (await (await fetch(url, requestOptions)).json());

        this.#PageTextures = /** @type {GPUTexture[]} */ (await Promise.all(
            this.#Font.pages.map(page => this.#LoadTexture(device, baseUrl + page, requestOptions))
        ));

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

        // Get the "question mark" character if present or the first one in the `characters` map.
        this.#DefaultChar = this.#Characters.get(63) ?? this.#Characters.entries().next().value?.[1];

        this.#BindGroupResources =
        {
            buffer: /** @type {GPUBuffer} */ (this.#CharactersBuffer),
            texture: /** @type {GPUTexture[]} */ (this.#PageTextures)[0],
            sampler: device.createSampler(
            {
                label: `${this.#Label} Sampler`,
                mipmapFilter: "linear",
                minFilter: "linear",
                magFilter: "linear",
                maxAnisotropy: 16
            })
        };
    }

    /**
     * Create font layout entries for the [MSDFText](./MSDFText) pipeline layout.
     *
     * @param {Renderer} Renderer - `Renderer` instance to create layout entries.
     */
    static GetBindGroupLayoutEntries(Renderer)
    {
        return [
            Renderer.CreateSamplerBindingLayout(), Renderer.CreateTextureBindingLayout(),
            Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, GPUShaderStage.VERTEX),
            Renderer.CreateBufferBindingLayout(void 0, false, 0, GPUShaderStage.VERTEX, BINDINGS.CAMERA_MATRIX)
        ];
    }

    /** @hidden */
    get BindGroupResources()
    {
        return /** @type {Record<string, GPUBindingResource>} */ (this.#BindGroupResources);
    }

    /**
     * @returns {number} Font line height.
     */
    get LineHeight()
    {
        return this.#LineHeight;
    }

    /**
     * @returns {boolean} Whether the font was generated [here](https://msdf-bmfont.donmccurdy.com/).
     */
    get Generated()
    {
        return this.#Generated;
    }

    /**
     * Destroy all page textures.
     */
    Destroy()
    {
        this.#PageTextures?.forEach(texture => texture?.destroy());
    }
}
