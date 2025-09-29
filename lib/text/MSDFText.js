import { ERROR, ThrowError } from "#/Errors";
import MSDFFont from "./MSDFFont";
import { Device } from "#/index";

export default class MSDFText
{
    /** @type {string} */ #Label;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {import("../textures").Texture} */ #Texture;

    /** @param {string} [label = "MSDFText"] */
    constructor(renderer, label = "MSDFText")
    {
        this.#Label = label;
    }

    /** @param {RenderPipeline} Pipeline */
    SetRenderPipeline(Pipeline)
    {
        this.#Pipeline = Pipeline;
    }

    /**
     * @param {string} url
     * @param {RequestInit} [requestOptions]
     */
    async LoadFont(url, requestOptions)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.SetRenderPipeline\` method before loading a font file.`
        );

        const pages = [];
        const dir = url.lastIndexOf("/") + 1;
        this.#Texture = new (await Device.Texture());

        const baseUrl = dir && url.substring(0, dir) || "";
        const json = await (await fetch(url, requestOptions)).json();

        for (const page of json.pages)
            pages.push(this.#LoadTexture(baseUrl + page));

        const { Characters, buffer } = this.#Pipeline.CreateStorageBuffer("Characters",
        {
            label: `${this.#Label} Characters Buffer`,
            length: json.chars.length,
            mappedAtCreation: true
        });

        const chars = new WeakMap();
        const w = 1 / json.common.scaleW;
        const h = 1 / json.common.scaleH;

        for (let c = 0, o = 0; c < json.chars.length; o += 8, ++c)
        {
            const char = json.chars[c];

            chars[char.id] = char;
            chars[char.id].index = c;

            Characters[o + 0] =  char.x      * w;
            Characters[o + 1] =  char.y      * h;
            Characters[o + 2] =  char.width  * w;
            Characters[o + 3] =  char.height * h;
            Characters[o + 4] =  char.width     ;
            Characters[o + 5] =  char.height    ;
            Characters[o + 6] =  char.xoffset   ;
            Characters[o + 7] = -char.yoffset   ;
        }

        const sampler = this.#Texture.CreateSampler({
            label: `${this.#Label} Sampler`,
            maxAnisotropy: 16,
            filter: "linear"
        });

        const textures = await Promise.all(pages);
        const kernings = new Map();
        buffer.unmap();

        this.#Pipeline.SetBindGroupFromResources([
            // Multi-page fonts are not supported yet.
            sampler, textures[0].createView(), buffer
        ]);

        if (json.kernings)
        {
            for (const kerning of json.kernings)
            {
                let charKerning = kernings.get(kerning.first);

                if (!charKerning)
                {
                    charKerning = new Map();
                    kernings.set(kerning.first, charKerning);
                }

                charKerning.set(kerning.second, kerning.amount);
            }
        }

        return new MSDFFont();
    }

    /** @param {string} url */
    async #LoadTexture(url)
    {
        return this.#Texture.CopyImageToTexture(
            await this.#Texture.CreateImageBitmap(url),
            { mipmaps: false, create: { label: `${this.#Label} Font Texture` } }
        );
    }
}
