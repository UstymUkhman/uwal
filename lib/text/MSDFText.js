import { GetColorArray, GetGPUColorValue } from "#/utils";
import { MSDFText as MSDFTextShader } from "#/shaders";
import { BLEND_STATE } from "#/pipelines/Constants";
import { ERROR, ThrowError } from "#/Errors";
import MSDFFont from "./MSDFFont";
import { Device } from "#/index";

export default class MSDFText
{
    /**
     * @typedef {import("../utils/Color").ColorParam} ColorParam
     * @typedef {ColorParam | number} ColorValue
     *
     * @typedef {Object} Measurements
     * @property {number[]} lineWidths
     * @property {number} instances
     * @property {number} height
     * @property {number} width
     */

    /** @type {string} */ #Label;
    /** @type {boolean} */ #GeneratedFont = false;
    /** @type {Renderer | undefined} */ #Renderer;

    /** @type {GPUBuffer | undefined} */ #CameraBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {GPUTexture[] | undefined} */ #PageTextures;

    /** @type {Float32Array} */ #TextData = new Float32Array(8);

    /** @type {import("../textures").Texture | undefined} */ #Texture;
    /** @type {GPUBindGroupLayout | undefined} */ #FontBindGroupLayout;
    /** @type {GPUBindGroupLayout | undefined} */ #TextBindGroupLayout;

    /** @param {string} [label = "MSDFText"] */
    constructor(label = "MSDFText")
    {
        this.#Label = label;
    }

    /**
     * @param {Renderer} Renderer
     * @todo Add method arguments to make pipeline creation more flexible
     */
    CreateRenderPipeline(Renderer)
    {
        this.#Renderer = Renderer;
        this.#Pipeline = new this.#Renderer.Pipeline();

        const module = this.#Pipeline.CreateShaderModule(MSDFTextShader);
        const renderStageVisibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;

        this.#FontBindGroupLayout = this.#Pipeline.CreateBindGroupLayout([
            this.#Renderer.CreateSamplerBindingLayout(), this.#Renderer.CreateTextureBindingLayout(),
            this.#Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, GPUShaderStage.VERTEX),
            this.#Renderer.CreateBufferBindingLayout(void 0, false, 0, GPUShaderStage.VERTEX)
        ]);

        this.#TextBindGroupLayout = this.#Pipeline.CreateBindGroupLayout(
            this.#Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, renderStageVisibility)
        );

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

    /** @param {string} url */
    async #LoadTexture(url)
    {
        return this.#Texture && this.#Texture.CopyImageToTexture(
            await this.#Texture.CreateImageBitmap(url),
            { mipmaps: false, create: { label: `${this.#Label} Font Texture` } }
        );
    }

    /**
     * @param {string} string
     * @param {MSDFFont} font
     * @param {Function} [callback]
     * @returns {Measurements}
     */
    #Measure(string, font, callback)
    {
        let width = 0, instances = 0, nextCode = string.charCodeAt(0);
        const offset = [0, 0], lineWidths = [], { LineHeight } = font;

        for (let c = 0, line = 0, code = nextCode, l = string.length, last = l - 1; c < l; code = nextCode, ++c)
        {
            nextCode = c < last && string.charCodeAt(c + 1) || -1;

            switch (code)
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
                    offset[0] += font.GetXAdvance(code);
                break;

                default:
                    callback?.(offset, line, font.GetCharacter(code).c);
                    offset[0] += font.GetXAdvance(code, nextCode);
                    instances++;
            }
        }

        lineWidths.push(offset[0]);
        width = Math.max(width, offset[0]);

        const height = LineHeight * lineWidths.length;
        return { lineWidths, instances, height, width };
    }

    /**
     * @param {string} url
     * @param {boolean} [generated = false]
     * @param {RequestInit} [requestOptions]
     */
    async LoadFont(url, generated = false, requestOptions)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before loading a font file.`
        );

        this.#GeneratedFont = generated;
        const dir = url.lastIndexOf("/") + 1;

        this.#Texture = new (await Device.Texture());
        const baseUrl = dir && url.substring(0, dir) || "";

        const font = /** @type {import("./MSDFFont").Font} */ (await (await fetch(url, requestOptions)).json());
        const pages = font.pages.map(page => this.#LoadTexture(baseUrl + page));

        const { buffer: CharactersBuffer } = /** @type {RenderPipeline} */
            (this.#Pipeline).CreateStorageBuffer("Characters",
            {
                label: `${this.#Label} Characters Buffer`,
                length: font.chars.length,
                mappedAtCreation: true
            }
        );

        this.#CameraBuffer = /** @type {RenderPipeline} */ (this.#Pipeline).CreateUniformBuffer(
            "Camera", { label: `${this.#Label} Camera Buffer` }
        ).buffer;

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

            characters.set(char.id, Object.assign({ c }, char));
        }

        const sampler = this.#Texture.CreateSampler({
            label: `${this.#Label} Sampler`,
            maxAnisotropy: 16,
            filter: "linear"
        });

        CharactersBuffer.unmap();

        this.#PageTextures = /** @type {GPUTexture[]} */ (await Promise.all(pages));

        /**
         * @todo Add multi-page fonts support
         * @see https://github.com/UstymUkhman/uwal/issues/9
         */
        /** @type {RenderPipeline} */ (this.#Pipeline).SetBindGroupFromResources([
            sampler, this.#PageTextures[0].createView(),
            CharactersBuffer, this.#CameraBuffer
        ], 0, this.#FontBindGroupLayout);

        return new MSDFFont(font, characters);
    }

    /**
     * @todo Add `SetFont` method to use an already loaded font in another `MSDFText` instance
     * @todo Remove `font` argument once the `SetFont` method is added
     * @todo Allow to rewrite the `string` argument on the same `MSDFText` instance
     *
     * @param {string} string
     * @param {MSDFFont} font
     * @param {ColorValue} [color = 0x000000]
     * @param {number} [scale = 0.01]
     * @param {boolean} [centered = false]
     */
    Write(string, font, color = 0x000000, scale = 0.01, centered = false)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before writing a string.`
        );

        const textBuffer = /** @type {RenderPipeline} */
            (this.#Pipeline).CreateStorageBuffer("Text",
            {
                label: `${this.#Label} Storage Buffer`,
                size: string.length * 16 + 96,
                mappedAtCreation: true
            }
        ).buffer;

        const text = new Float32Array(textBuffer.getMappedRange());
        let offset = 24; // Skip scale, color and transform.
        /** @type {Measurements} */ let measurements;

        if (centered)
        {
            measurements = this.#Measure(string, font);

            this.#Measure(string, font,
                /**
                 * @param {[number, number]} offset
                 * @param {number} line
                 * @param {number} index
                 */
                ([x, y], line, index) =>
                {
                    const { lineWidths, width, height } = measurements;
                    const lineOffset = width * -0.5 - (width - lineWidths[line]) * -0.5;

                    text[offset + 0] = x + lineOffset;
                    text[offset + 1] = y + height * 0.5;
                    text[offset + 2] = index;
                    offset += 4;
                }
            );
        }
        else
            measurements = this.#Measure(string, font,
                /**
                 * @param {[number, number]} offset
                 * @param {number} line
                 * @param {number} c
                 */
                ([x, y], line, c) =>
                {
                    text[offset + 0] = x;
                    text[offset + 1] = y;
                    text[offset + 2] = c;
                    offset += 4;
                }
            );

        textBuffer.unmap();

        const Pipeline = /** @type {RenderPipeline} */ (this.#Pipeline);

        if (Pipeline.BindGroups.length === 1)
            Pipeline.AddBindGroupFromResources(textBuffer, 0, this.#TextBindGroupLayout);

        else
            Pipeline.BindGroups[1].bindGroup = Pipeline.CreateBindGroup(
                Pipeline.CreateBindGroupEntries(textBuffer), this.#TextBindGroupLayout
            );

        Pipeline.SetDrawParams(4, measurements.instances);
        Pipeline.EncodeRenderBundle(/** @type {Renderer} */ (this.#Renderer).CreateRenderBundleEncoder());

        this.#TextData.set([-this.#GeneratedFont + 0.5, scale]);

        // Write alpha and scale as two elements (f32) at the beginning of the buffer:
        Pipeline.WriteBuffer(textBuffer, /** @type {GPUAllowSharedBufferSource} */ (this.#TextData), 0, 0, 2);

        this.SetColor(color, textBuffer);

        return textBuffer;
    }

    /**
     * @param {Float32Array} transform
     * @param {GPUBuffer} textBuffer
     */
    SetTransform(transform, textBuffer)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before setting transform matrix.`
        );

        // Write transform as 16 elements (mat4x4f) starting at the 8th index of the buffer:
        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            textBuffer, /** @type {GPUAllowSharedBufferSource} */ (transform), 32, 0, 16
        );
    }

    /**
     * @param {ColorValue} color
     * @param {GPUBuffer} textBuffer
     */
    SetColor(color, textBuffer)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before setting text color.`
        );

        this.#TextData.set(typeof color === "number" && GetColorArray(color) ||
            GetGPUColorValue(/** @type {ColorParam} */ (color)), 4);

        // Write color as 4 elements (vec4f) starting at the 4th index of the buffer:
        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            textBuffer, /** @type {GPUAllowSharedBufferSource} */ (this.#TextData), 16, 4, 4
        );
    }

    /**
     * @param {number} scale
     * @param {GPUBuffer} textBuffer
     */
    SetScale(scale, textBuffer)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before setting text scale.`
        );

        this.#TextData[1] = scale;

        // Write scale as one element (f32) starting at the 2nd index of the buffer:
        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            textBuffer, /** @type {GPUAllowSharedBufferSource} */ (this.#TextData), 4, 1, 1
        );
    }

    /**
     * @see https://github.com/UstymUkhman/uwal/issues/9
     * @param {import("../cameras").PerspectiveCamera} Camera
     */
    UpdatePerspective(Camera)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before updating projection matrix.`
        );

        !this.#CameraBuffer && ThrowError(ERROR.CAMERA_BUFFER_NOT_FOUND,
            `Call \`MSDFText.LoadFont\` method before updating projection matrix.`
        );

        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#CameraBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (Camera.LocalMatrix), 0
        );

        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#CameraBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (Camera.ProjectionMatrix), 64
        );
    }

    get Pipeline()
    {
        return this.#Pipeline;
    }

    Destroy()
    {
        this.#PageTextures?.forEach(texture => texture?.destroy());
        this.#CameraBuffer?.destroy();
        this.#Pipeline?.Destroy();
        this.#Texture?.Destroy();
    }
}
