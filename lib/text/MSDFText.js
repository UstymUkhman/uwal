/** @module MSDFText */

import { MSDFFont } from "./MSDFFont";
import { ERROR, ThrowError } from "#/Errors";
import { BLEND_STATE } from "#/pipelines/Constants";
import { MSDFText as MSDFTextShader } from "#/shaders";
import { GetColorArray, GetGPUColorValue } from "#/utils";

/**
 * Utility class to write some text into a storage `GPUBuffer`. When combined with the `MSDFText` shader,
 * the buffer content can be outputted to a screen or into a `GPUTexture`. **Note:** This class will
 * probably be deprecated once [HTML in Canvas](https://html-in-canvas.dev/) gets widely adopted.
 *
 * @see [MSDF Text](https://ustymukhman.github.io/uwal/dist/examples/examples.html#msdf-text) and
 * [Curtains](https://ustymukhman.github.io/uwal/dist/examples/examples.html#curtains) for reference.
 */
export class MSDFText
{
    /**
     * @import {RenderPipelineDescriptor} from "../pipelines/RenderPipeline"
     * @typedef {import("../utils/Color").ColorParam} ColorParam
     * @typedef {ColorParam | number} ColorValue
     *
     * @typedef {Object} RenderBundleDescriptor
     * @property {GPUTextureFormat | GPUTextureFormat[]} [colorFormats]
     * @property {GPUTextureFormat} [depthStencilFormat]
     * @property {boolean} [stencilReadOnly]
     * @property {boolean} [depthReadOnly]
     * @property {GPUSize32} [sampleCount]
     * @property {string} [label]
     *
     * @typedef {Object} Measurements
     * @property {number[]} lineWidths
     * @property {number} instances
     * @property {number} height
     * @property {number} width
     */

    /** @type {string} */ #Label;

    /** @type {MSDFFont | undefined} */ #Font;
    /** @type {Renderer | undefined} */ #Renderer;

    /** @type {GPUBuffer | undefined} */ #CameraBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;

    /** @type {Float32Array} */ #TextData = new Float32Array(8);
    /** @type {GPUBindGroupLayout | undefined} */ #BindGroupLayout;
    /** @type {RenderBundleDescriptor} */ #RenderBundleDescriptor = {};

    /**
     * @param {string} [label = "MSDFText"] - Text label.
     */
    constructor(label = "MSDFText")
    {
        this.#Label = label;
    }

    /**
     * @param {string} text
     * @param {MSDFFont} Font
     * @param {(offset: number[], line: number, index: number) => void} [callback]
     */
    #Measure(text, Font, callback)
    {
        let width = 0, instances = 0, nextCode = text.charCodeAt(0);
        const offset = [0, 0], lineWidths = [], { LineHeight } = Font;

        for (let c = 0, line = 0, code = nextCode, l = text.length, last = l - 1; c < l; code = nextCode, ++c)
        {
            nextCode = c < last && text.charCodeAt(c + 1) || -1;

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
                    offset[0] += Font.GetXAdvance(code);
                break;

                default:
                    callback?.(offset, line, Font.GetCharacter(code).c);
                    offset[0] += Font.GetXAdvance(code, nextCode);
                    instances++;
            }
        }

        lineWidths.push(offset[0]);
        width = Math.max(width, offset[0]);

        const height = LineHeight * lineWidths.length;
        return { instances, lineWidths, width, height };
    }

    /**
     * Create an internal render pipeline to output the text.
     *
     * @param {Renderer} Renderer - `Renderer` instance to create the pipeline.
     * @param {RenderPipelineDescriptor & Record<"renderBundleDescriptor", RenderBundleDescriptor | undefined> &
           Record<"colorTargets", GPUColorTargetState | GPUColorTargetState[] | undefined>
     * } [descriptor] - Optional pipeline descriptor.
     */
    CreatePipeline(Renderer, descriptor)
    {
        let {
            layout,
            module,
            vertex,
            fragment,
            primitive,
            multisample,
            colorTargets,
            depthStencil,
            renderBundleDescriptor
        } = descriptor ?? {};

        this.#Renderer = Renderer;
        this.#Pipeline = new this.#Renderer.Pipeline();

        this.#BindGroupLayout = this.#Pipeline.CreateBindGroupLayout(
            MSDFFont.GetBindGroupLayoutEntries(Renderer).toSpliced(
                0, 0, this.#Renderer.CreateBufferBindingLayout(
                    "read-only-storage", false, 0, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
                )
            )
        );

        layout       ??= this.#Pipeline.CreatePipelineLayout(this.#BindGroupLayout);
        module       ??= this.#Pipeline.CreateShaderModule(MSDFTextShader);

        vertex       ??= this.#Pipeline.CreateVertexState(module);
        colorTargets ??= this.#Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE);
        fragment     ??= this.#Pipeline.CreateFragmentState(module, "fragment", colorTargets);

        primitive    ??= this.#Pipeline.CreatePrimitiveState("triangle-strip", void 0, "uint32");
        depthStencil ??= this.#Pipeline.CreateDepthStencilState(void 0, false);

        if (this.#Renderer.MultisampleTexture && !multisample)
            multisample = this.#Pipeline.CreateMultisampleState();

        this.#RenderBundleDescriptor = renderBundleDescriptor ?? {};
        this.#RenderBundleDescriptor.sampleCount ??= multisample?.count ?? 1;

        return this.#Renderer.AddPipeline(this.#Pipeline,
        {
            layout, vertex, fragment, primitive, depthStencil, multisample
        });
    }

    /**
     * Load and use an [MSDFFont](./MSDFFont).
     * @see {@link https://github.com/UstymUkhman/uwal/issues/9}
     * @throws `ERROR.PIPELINE_NOT_FOUND` if called before [CreatePipeline](#createpipeline).
     *
     * @param {string} source - Font source path.
     * @param {boolean} [generated = false] - Whether the font was generated [here](https://msdf-bmfont.donmccurdy.com/).
     * @param {RequestInit} [requestOptions] - `fetch` request options.
     */
    async LoadFont(source, generated = false, requestOptions)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreatePipeline\` method before loading a font file.`
        );

        await (this.#Font = new MSDFFont("MSDFFont", generated)).CreateBindGroupResources(
            /** @type {RenderPipeline} */ (this.#Pipeline), source, requestOptions
        );
    }

    /**
     * Write a text string into a storage `GPUBuffer`.
     * @throws `ERROR.PIPELINE_NOT_FOUND` if called before [CreatePipeline](#createpipeline),
     * `ERROR.FONT_NOT_FOUND` if called before [LoadFont](#loadfont), and `ERROR.CAMERA_BUFFER_NOT_FOUND`
     * if a `PerspectiveCamera` buffer hasn't been set yet with [CameraMatrixBuffer](#cameramatrixbuffer).
     *
     * @param {string} text - Text to write.
     * @param {ColorValue} [color = 0x000000] - Text color.
     * @param {number} [scale = 0.01] - Text scale.
     * @param {boolean} [centered = false] - Whether the text should be centered.
     */
    Write(text, color = 0x000000, scale = 0.01, centered = false)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreatePipeline\` method before writing the text.`
        );

        !this.#Font && ThrowError(ERROR.FONT_NOT_FOUND, `\`MSDFText.Write\` method.
            Call \`MSDFText.LoadFont\` method or \`MSDFText.Font\` setter before writing the text.`
        );

        !this.#CameraBuffer && ThrowError(ERROR.CAMERA_BUFFER_NOT_FOUND, `\`MSDFText.Write\` method.
            Call \`MSDFText.CameraMatrixBuffer\` setter before writing the text.`
        );

        const textBuffer = /** @type {RenderPipeline} */ (this.#Pipeline).CreateStorageBuffer("Text",
        {
            label: `${this.#Label} Storage Buffer`,
            size: text.length * 16 + 96,
            mappedAtCreation: true
        }).buffer;

        const f32 = new Float32Array(textBuffer.getMappedRange());
        let offset = 24; // Skip scale, color and translation.
        const Font = /** @type {MSDFFont} */ (this.#Font);
        /** @type {Measurements} */ let measurements;

        if (centered)
        {
            measurements = this.#Measure(text, Font);

            this.#Measure(text, Font, ([x, y], line, index) =>
            {
                const { lineWidths, width, height } = measurements;
                const lineOffset = width * -0.5 - (width - lineWidths[line]) * -0.5;

                f32[offset + 0] = x + lineOffset;
                f32[offset + 1] = y + height * 0.5;
                f32[offset + 2] = index;
                offset += 4;
            });
        }
        else
            measurements = this.#Measure(text, Font, ([x, y], _line, c) =>
            {
                f32[offset + 0] = x;
                f32[offset + 1] = y;
                f32[offset + 2] = c;
                offset += 4;
            });

        textBuffer.unmap();

        const Pipeline = /** @type {RenderPipeline} */ (this.#Pipeline);

        Pipeline.SetBindGroupFromResources(
            [/** @type {GPUBuffer} */ (this.#CameraBuffer), ...Object.values(Font.BindGroupResources), textBuffer],
            [10, 3, 2, 1, 0],
            this.#BindGroupLayout
        );

        Pipeline.SetDrawParams(4, measurements.instances);

        Pipeline.EncodeRenderBundle(/** @type {Renderer} */ (this.#Renderer).CreateRenderBundleEncoder(
            this.#RenderBundleDescriptor.colorFormats,
            this.#RenderBundleDescriptor.depthStencilFormat,
            this.#RenderBundleDescriptor.label,
            this.#RenderBundleDescriptor.sampleCount,
            this.#RenderBundleDescriptor.depthReadOnly,
            this.#RenderBundleDescriptor.stencilReadOnly
        ));

        /**
         * When a font is generated here {@link https://msdf-bmfont.donmccurdy.com/},
         * alpha values to test against the pixel distance need to range from -0.5 to 0.5, and
         * from 0.5 to -0.5 if it's an A-Frame font {@link https://github.com/etiennepinchon/aframe-fonts}.
         */
        this.#TextData.set([-Font.Generated + 0.5, scale]);

        // Write alpha and scale as two f32 elements at the beginning of the buffer.
        Pipeline.WriteBuffer(textBuffer, /** @type {GPUAllowSharedBufferSource} */ (this.#TextData), 0, 0, 2);

        this.SetColor(color, textBuffer);

        return textBuffer;
    }

    /**
     * Set the text translation.
     *
     * @param {Float32Array} translation - Translation matrix.
     * @param {GPUBuffer} buffer - Text buffer to update.
     */
    SetTranslation(translation, buffer)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreatePipeline\` method before setting the translation matrix.`
        );

        // Write translation as 16 elements (mat4x4f) starting at the 8th index of the buffer.
        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            buffer, /** @type {GPUAllowSharedBufferSource} */ (translation), 32, 0, 16
        );
    }

    /**
     * Set the text color.
     *
     * @param {ColorValue} color - Color value.
     * @param {GPUBuffer} buffer - Text buffer to update.
     */
    SetColor(color, buffer)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreatePipeline\` method before setting text color.`
        );

        this.#TextData.set(typeof color === "number" && GetColorArray(color) ||
            GetGPUColorValue(/** @type {ColorParam} */ (color)), 4);

        // Write color as 4 elements (vec4f) starting at the 4th index of the buffer.
        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            buffer, /** @type {GPUAllowSharedBufferSource} */ (this.#TextData), 16, 4, 4
        );
    }

    /**
     * Set the text scale.
     *
     * @param {number} scale - Scale value.
     * @param {GPUBuffer} buffer - Text buffer to update.
     */
    SetScale(scale, buffer)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreatePipeline\` method before setting text scale.`
        );

        this.#TextData[1] = scale;

        // Write scale as one f32 element starting at the 2nd index of the buffer.
        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            buffer, /** @type {GPUAllowSharedBufferSource} */ (this.#TextData), 4, 1, 1
        );
    }

    /**
     * Destroy the text buffer and reset its color and scale values.
     * Remove pipeline's bind groups and reset its render bundles.
     *
     * @param {GPUBuffer} [buffer] - Text buffer to remove.
     */
    Clear(buffer)
    {
        buffer?.destroy();
        this.#TextData.set([0, 0]);
        this.#Pipeline?.BindGroups.splice(1);
        this.#Pipeline?.ClearRenderBundles();
    }

    /**
     * Set a `PerspectiveCamera` buffer to render the text.
     * @see {@link https://github.com/UstymUkhman/uwal/issues/9}
     *
     * @param {GPUBuffer} buffer - Camera buffer.
     */
    set CameraMatrixBuffer(buffer)
    {
        this.#CameraBuffer = buffer;
    }

    /**
     * @returns Internal pipeline used to render the text.
     */
    get Pipeline()
    {
        return this.#Pipeline;
    }

    /**
     * Destroy and remove the render pipeline, destroy the font, and reset the internal state.
     */
    Destroy()
    {
        if (this.#Pipeline)
        {
            this.#Pipeline.Destroy();
            this.#Renderer?.RemovePipeline(this.#Pipeline);
        }

        this.#Font = /** @type {undefined} */ (this.#Font?.Destroy());
        this.#Renderer = this.#CameraBuffer = undefined;
    }
}
