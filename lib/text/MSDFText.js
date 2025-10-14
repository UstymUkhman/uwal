import { Color, GetColorArray, GetGPUColorValue } from "#/utils";
import { MSDFText as MSDFTextShader } from "#/shaders";
import { BLEND_STATE } from "#/pipelines/Constants";
import { ERROR, ThrowError } from "#/Errors";
import MSDFFont from "./MSDFFont";
import { Device } from "#/index";

export default class MSDFText
{
    /**
     * @typedef {import("../utils/Color").ColorParam | number} ColorValue
     *
     * @typedef {Object} Measurements
     * @property {number[]} lineWidths
     * @property {number} instances
     * @property {number} height
     * @property {number} width
     */

    /** @type {string} */ #Label;
    /** @type {Renderer} */ #Renderer;

    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBindGroup} */ #FontBindGroup;

    /** @type {GPUBuffer | undefined} */ #TextBuffer;
    /** @type {GPUBuffer | undefined} */ #CameraBuffer;

    /** @type {import("../textures").Texture} */ #Texture;
    /** @type {GPUBindGroupLayout} */ #FontBindGroupLayout;
    /** @type {GPUBindGroupLayout} */ #TextBindGroupLayout;

    /** @typw {GPURenderBundle | undefined} */ #RenderBundle;
    /** @type {Float32Array} */ #TextData = new Float32Array(8);

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
        const renderStageVisibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;

        this.#FontBindGroupLayout = this.#Pipeline.CreateBindGroupLayout([
            this.#Renderer.CreateSamplerBindingLayout(), this.#Renderer.CreateTextureBindingLayout(),
            this.#Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, GPUShaderStage.VERTEX)
        ]);

        this.#TextBindGroupLayout = this.#Pipeline.CreateBindGroupLayout([
            this.#Renderer.CreateBufferBindingLayout(void 0, false, 0, GPUShaderStage.VERTEX),
            this.#Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, renderStageVisibility)
        ]);

        return this.#Renderer.AddPipeline(this.#Pipeline, {
            layout: this.#Pipeline.CreatePipelineLayout([this.#FontBindGroupLayout, this.#TextBindGroupLayout]),
            primitive: this.#Pipeline.CreatePrimitiveState("triangle-strip", void 0, "uint32"),
            depthStencil: this.#Pipeline.CreateDepthStencilState(void 0, false),
            vertex: this.#Pipeline.CreateVertexState(module),
            fragment: this.#Pipeline.CreateFragmentState(module,
                this.#Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
            )
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

        const dir = url.lastIndexOf("/") + 1;
        this.#Texture = new (await Device.Texture());
        const baseUrl = dir && url.substring(0, dir) || "";
        const font = await (await fetch(url, requestOptions)).json();
        const pages = font.pages.map(page => this.#LoadTexture(baseUrl + page));

        const { buffer: CharactersBuffer } = this.#Pipeline.CreateStorageBuffer("Characters",
        {
            label: `${this.#Label} Characters Buffer`,
            length: font.chars.length,
            mappedAtCreation: true
        });

        const characters = new Map();
        const w = 1 / font.common.scaleW, h = 1 / font.common.scaleH;
        const Characters = new Float32Array(CharactersBuffer.getMappedRange());

        for (let c = 0, o = 0, l = font.chars.length; c < l; o += 8, ++c)
        {
            const char = font.chars[c];

            Characters[o + 0] =  char.x      * w;
            Characters[o + 1] =  char.y      * h;
            Characters[o + 2] =  char.width  * w;
            Characters[o + 3] =  char.height * h;
            Characters[o + 4] =  char.width     ;
            Characters[o + 5] =  char.height    ;
            Characters[o + 6] =  char.xoffset   ;
            Characters[o + 7] = -char.yoffset   ;

            characters.set(char.char, Object.assign({ c }, char));
        }

        const sampler = this.#Texture.CreateSampler({
            label: `${this.#Label} Sampler`,
            maxAnisotropy: 16,
            filter: "linear"
        });

        CharactersBuffer.unmap();
        const textures = await Promise.all(pages);

        // Multi-page fonts are not supported yet.
        this.#FontBindGroup = this.#Pipeline.CreateBindGroup(
            this.#Pipeline.CreateBindGroupEntries([sampler, textures[0].createView(), CharactersBuffer]),
            this.#FontBindGroupLayout
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
     * @param {ColorValue} [color = 0x000000]
     * @param {number} [pixelScale = 0.01]
     * @param {boolean} [centered = false]
     */
    WriteString(string, font, color = 0x000000, pixelScale = 0.01, centered = false)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before writing a string.`
        );

        this.#CameraBuffer = this.#Pipeline.CreateUniformBuffer("Camera", {
            label: `${this.#Label} Camera Buffer`,
        }).buffer;

        this.#TextBuffer = this.#Pipeline.CreateStorageBuffer("Text", {
            label: `${this.#Label} Storage Buffer`,
            size: string.length * 16 + 96,
            mappedAtCreation: true
        }).buffer;

        const text = new Float32Array(this.#TextBuffer.getMappedRange());
        let offset = 24; // Skip internal MSDFText values.
        /** @type {Measurements} */ let measurements;

        if (centered)
        {
            measurements = this.#MeasureString(string, font);

            this.#MeasureString(string, font, ([x, y], line, index) =>
            {
                const { lineWidths, width, height } = measurements;
                const lineOffset = width * -0.5 - (width - lineWidths[line]) * -0.5;

                text[offset + 0] = x + lineOffset;
                text[offset + 1] = y + height * 0.5;
                text[offset + 2] = index;
                offset += 4;
            });
        }
        else
            measurements = this.#MeasureString(string, font, ([x, y], line, c) =>
            {
                text[offset + 0] = x;
                text[offset + 1] = y;
                text[offset + 2] = c;
                offset += 4;
            });

        this.#TextBuffer.unmap();

        const textBindGroup = this.#Pipeline.CreateBindGroup(
            this.#Pipeline.CreateBindGroupEntries([this.#CameraBuffer, this.#TextBuffer]), this.#TextBindGroupLayout
        );

        const encoder = this.#Renderer.CreateRenderBundleEncoder();
        encoder.setPipeline(this.#Pipeline.GPUPipeline);
        encoder.setBindGroup(0, this.#FontBindGroup);
        encoder.setBindGroup(1, textBindGroup);
        encoder.draw(4, measurements.instances);

        this.#RenderBundle = encoder.finish();
        this.PixelScale = pixelScale;
        this.Color = color;
    }

    /**
     * @param {string} string
     * @param {MSDFFont} font
     * @param {Function} [callback]
     * @returns {Measurements}
     */
    #MeasureString(string, font, callback)
    {
        let width = 0, instances = 0, nextCode = string.charCodeAt(0);
        const offset = [0, 0], lineWidths = [], { LineHeight } = font;

        for (let c = 0, line = 0, char = string[c], l = string.length, last = l - 1; c < l; char = string[++c])
        {
            nextCode = c < last && string.charCodeAt(c + 1) || -1;

            switch (char)
            {
                case 10:
                case 13:
                    width = Math.max(width, offset[0]);
                    lineWidths.push(offset[0]);
                    offset[1] -= LineHeight;
                    offset[0] = 0;
                    line++;
                break;

                case 32:
                    offset[0] += font.GetXAdvance(char);
                break;

                default:
                    callback?.(offset, line, font.GetCharacter(char).c);
                    offset[0] += font.GetXAdvance(char, nextCode);
                    instances++;
            }
        }

        lineWidths.push(offset[0]);
        width = Math.max(width, offset[0]);

        const height = LineHeight * lineWidths.length;
        return { lineWidths, instances, height, width };
    }

    /**
     * @param {Float32Array} view
     * @param {Float32Array} projection
     */
    UpdateProjectionMatrix(view, projection)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before updating projection matrix.`
        );

        this.#Pipeline.WriteBuffer(this.#CameraBuffer, view, 0);
        this.#Pipeline.WriteBuffer(this.#CameraBuffer, projection, 64);
    }

    /** @param {Float32Array} transform */
    set Transform(transform)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before setting transform matrix.`
        );

        // Write transform as 16 elements (mat4x4f) starting at the 8th index of the buffer:
        this.#Pipeline.WriteBuffer(this.#TextBuffer, transform, 32, 0, 16);
    }

    /** @param {number} scale */
    set PixelScale(scale)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before setting pixel scale.`
        );

        this.#TextData[0] = scale;

        // Write scale as one element (f32) at the beginning of the buffer:
        this.#Pipeline.WriteBuffer(this.#TextBuffer, this.#TextData, 0, 0, 1);
    }

    /** @param {ColorValue} color */
    set Color(color)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before setting text color.`
        );

        this.#TextData.set(typeof color === "number" && GetColorArray(color) || GetGPUColorValue(color), 4);
        // Write color as 4 elements (vec4f) starting at the 4th index of the buffer:
        this.#Pipeline.WriteBuffer(this.#TextBuffer, this.#TextData, 16, 4, 4);
    }

    get RenderBundle()
    {
        return this.#RenderBundle;
    }

    get Pipeline()
    {
        return this.#Pipeline;
    }
}
