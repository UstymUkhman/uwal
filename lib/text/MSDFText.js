import { BLEND_STATE, USAGE } from "#/pipelines/Constants";
import { MSDFText as MSDFTextShader } from "#/shaders";
import { Color, GetColorArray } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { mat4 } from "wgpu-matrix";
import MSDFFont from "./MSDFFont";
import { Device } from "#/index";

/**
 * @typedef {import("../utils/Color").ColorParam | number} ColorValue
 *
 * @typedef {Object} Measurements
 * @property {number[]} lineWidths
 * @property {number} instances
 * @property {number} height
 * @property {number} width
 *
 * @typedef {Object} TextOptions
 * @property {boolean} [centered]
 * @property {number} [pixelScale]
 * @property {ColorValue} [color]
 *
 * @typedef {Map<number, Map<number, number>>} Kernings
 *
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
 * @exports Kernings, Char
 */

export default class MSDFText
{
    /** @type {string} */ #Label;
    /** @type {Renderer} */ #Renderer;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBindGroup} */ #FontBindGroup;
    /** @typw {GPURenderBundle} */ #RenderBundle;

    /** @type {boolean} */ #UpdateTextBuffer = !1;
    /** @type {GPUBuffer | undefined} */ #TextBuffer;
    /** @type {import("../textures").Texture} */ #Texture;
    /** @type {Float32Array} */ #TextData = mat4.identity();

    /** @param {string} [label = "MSDFText"] */
    constructor(label = "MSDFText")
    {
        this.#Label = label;
    }

    /**
     * @param {Renderer} Renderer
     * @todo Add method arguments to make pipeline creation more flexible.
     */
    CreateRenderPipeline(Renderer)
    {
        this.#Renderer = Renderer;
        this.#Pipeline = new this.#Renderer.Pipeline();
        const module = this.#Pipeline.CreateShaderModule(MSDFTextShader);

        return this.#Renderer.AddPipeline(this.#Pipeline, {
            vertex: this.#Pipeline.CreateVertexState(module),
            fragment: this.#Pipeline.CreateFragmentState(module,
                this.#Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
            ),
            primitive: this.#Pipeline.CreatePrimitiveState("triangle-strip", void 0, "uint32"),
            depthStencil: this.#Pipeline.CreateDepthStencilState(void 0, false)
        });
    }

    /**
     * @param {string} url
     * @param {RequestInit} [requestOptions]
     */
    async LoadFont(url, requestOptions)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before loading a font file.`
        );

        const pages = [];
        const dir = url.lastIndexOf("/") + 1;
        this.#Texture = new (await Device.Texture());

        const baseUrl = dir && url.substring(0, dir) || "";
        const font = await (await fetch(url, requestOptions)).json();

        for (const page of font.pages)
            pages.push(this.#LoadTexture(baseUrl + page));

        const { Characters, buffer } = this.#Pipeline.CreateStorageBuffer("Characters",
        {
            label: `${this.#Label} Characters Buffer`,
            length: font.chars.length,
            mappedAtCreation: true
        });

        const characters = new Map();
        const w = 1 / font.common.scaleW;
        const h = 1 / font.common.scaleH;

        for (let c = 0, o = 0, l = font.chars.length; c < l; o += 8, ++c)
        {
            const char = font.chars[c];
            characters.set(char.id, Object.assign({ c }, char));

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

        const textures = await Promise.all(pages); buffer.unmap();

        // Multi-page fonts are not supported yet.
        this.#FontBindGroup = this.#Pipeline.CreateBindGroup(
            this.#Pipeline.CreateBindGroupEntries([sampler, textures[0].createView(), buffer])
        );

        return new MSDFFont(font, characters);
    }

    /** @param {string} url */
    async #LoadTexture(url)
    {
        return this.#Texture.CopyImageToTexture(
            await this.#Texture.CreateImageBitmap(url),
            { mipmaps: false, create: { label: `${this.#Label} Font Texture` } }
        );
    }

    /**
     * @param {string} string
     * @param {MSDFFont} font
     * @param {TextOptions} [options = {}]
     */
    WriteString(string, font, options = {})
    {
        this.#TextBuffer = this.#Pipeline.CreateBuffer({
            label: `${this.#Label} Text Buffer`,
            size: string.length * 16 + 96,
            mappedAtCreation: true,
            usage: USAGE.STORAGE
        });

        const text = new Float32Array(this.#TextBuffer.getMappedRange());
        let offset = 24; // Skip internal MSDFText values.
        const { centered, pixelScale, color } = options;
        /** @type {Measurements} */ let measurements;

        if (centered)
        {
            measurements = this.#MeasureString(string, font);

            this.#MeasureString(string, font, (char, line, [x, y]) =>
            {
                const { lineWidths, width, height } = measurements;
                const lineOffset = width * -0.5 - (width - lineWidths[line]) * -0.5;

                text[offset + 0] = x + lineOffset;
                text[offset + 1] = y + height * 0.5;
                text[offset + 2] = char.c;
                offset += 4;
            });
        }
        else measurements = this.#MeasureString(string, font, (char, line, [x, y]) =>
        {
            text[offset + 0] = x;
            text[offset + 1] = y;
            text[offset + 2] = char.c;
            offset += 4;
        });

        this.#TextBuffer.unmap();

        const textBindGroup = this.#Pipeline.CreateBindGroup(
            this.#Pipeline.CreateBindGroupEntries([/* Camera Uniform Buffer */ this.#TextBuffer])
        );

        const encoder = this.#Renderer.CreateRenderBundleEncoder();
        encoder.setPipeline(this.#Pipeline.GPUPipeline);
        encoder.setBindGroup(0, this.#FontBindGroup);
        encoder.setBindGroup(1, textBindGroup);
        encoder.draw(4, measurements.instances);

        this.#RenderBundle = encoder.finish();
        this.PixelScale = pixelScale ?? 1 / 512;
        this.Color = color ?? 0xffffff;
    }

    /**
     * @param {string} string
     * @param {MSDFFont} font
     * @param {Function} [callback]
     * @returns {Measurements}
     */
    #MeasureString(string, font, callback)
    {
        let width = 0, instances = 0;
        const offset = [], lineWidths = [];
        const lineHeight = font.LineHeight;
        let nextCode = string.charCodeAt(0);

        for (
            let c = 0, line = 0, code = nextCode, length = string.length, last = length - 1;
            c < length; code = nextCode, ++c
        ) {
            nextCode = c < last && string.charCodeAt(c + 1) || -1;

            switch (code)
            {
                case 10:
                case 13:
                    width = Math.max(width, offset[0]);
                    lineWidths.push(offset[0]);
                    offset[1] -= lineHeight;
                    offset[0] = 0;
                    line++;
                break;

                case 32:
                    offset[0] += font.GetXAdvance(code);
                break;

                default:
                {
                    callback?.(font.GetCharacter(code), line, offset);
                    offset[0] += font.GetXAdvance(code, nextCode);
                    instances++;
                }
            }
        }

        lineWidths.push(offset[0]);
        width = Math.max(width, offset[0]);
        const height = lineHeight * lineWidths.length;
        return { lineWidths, instances, height, width };
    }

    /** @param {Float32Array} transform */
    set Transform(transform)
    {
        mat4.copy(transform, this.#TextData);
        this.#UpdateTextBuffer = true;
    }

    /** @param {number} scale */
    set PixelScale(scale)
    {
        this.#UpdateTextBuffer = true;
        this.#TextData[20] = scale;
    }

    /** @param {ColorValue} color */
    set Color(color)
    {
        const colorValue = typeof color === "number" && GetColorArray(color) ||
            color instanceof Color && color.rgba || Object.values(color);

        this.#TextData.fill(1, 16, 20);
        this.#UpdateTextBuffer = true;
    }

    get RenderBundle()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before getting a render bundle.`
        );

        if (this.#UpdateTextBuffer)
        {
            this.#Pipeline.WriteBuffer(this.#TextBuffer, this.#TextData);
            this.#UpdateTextBuffer = false;
        }

        return this.#RenderBundle;
    }
}
