import { GetColorArray, GetGPUColorValue } from "#/utils";
import { MSDFText as MSDFTextShader } from "#/shaders";
import { BLEND_STATE } from "#/pipelines/Constants";
import { ERROR, ThrowError } from "#/Errors";
import MSDFFont from "./MSDFFont";

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

    /** @type {MSDFFont | undefined} */ #Font;
    /** @type {Renderer | undefined} */ #Renderer;
    /** @type {GPUBuffer | undefined} */ #CameraBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;

    /** @type {Float32Array} */ #TextData = new Float32Array(8);
    /** @type {GPUBindGroupLayout | undefined} */ #TextBindGroupLayout;

    /** @param {string} [label = "MSDFText"] */
    constructor(label = "MSDFText")
    {
        this.#Label = label;
    }

    /**
     * @param {Renderer} Renderer
     * @param {import("../pipelines/RenderPipeline").RenderPipelineDescriptor & {
           colorTargets?: GPUColorTargetState | GPUColorTargetState[],
           fontBindGroupLayout?: GPUBindGroupLayout,
           textBindGroupLayout?: GPUBindGroupLayout
     * }} [descriptor]
     */
    CreateRenderPipeline(Renderer, descriptor)
    {
        let {
            fontBindGroupLayout,
            textBindGroupLayout,
            layout,
            module,
            vertex,
            colorTargets,
            fragment,
            primitive,
            depthStencil,
            multisample
        } = descriptor ?? {};

        this.#Renderer = Renderer;
        this.#Pipeline = new this.#Renderer.Pipeline();

        fontBindGroupLayout ??= MSDFFont.CreateBindGroupLayout(this.#Renderer, this.#Pipeline);
        const renderStageVisibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;

        this.#TextBindGroupLayout = textBindGroupLayout ?? this.#Pipeline.CreateBindGroupLayout(
            this.#Renderer.CreateBufferBindingLayout("read-only-storage", false, 0, renderStageVisibility)
        );

        layout       ??= this.#Pipeline.CreatePipelineLayout([fontBindGroupLayout, this.#TextBindGroupLayout]);
        module       ??= this.#Pipeline.CreateShaderModule(MSDFTextShader);

        vertex       ??= this.#Pipeline.CreateVertexState(module);
        colorTargets ??= this.#Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE);
        fragment     ??= this.#Pipeline.CreateFragmentState(module, colorTargets);

        primitive    ??= this.#Pipeline.CreatePrimitiveState("triangle-strip", void 0, "uint32");
        depthStencil ??= this.#Pipeline.CreateDepthStencilState(void 0, false);

        return this.#Renderer.AddPipeline(this.#Pipeline, {
            layout, vertex, fragment, primitive, depthStencil, multisample
        });
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

        const font = new MSDFFont("MSDFFont", generated);

        await font.CreateBindGroupResources(/** @type {RenderPipeline} */ (this.#Pipeline), url, requestOptions);

        this.SetFont(font);

        return font;
    }

    /** @param {MSDFFont} font */
    SetFont(font)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before loading a font file.`
        );

        this.#CameraBuffer = /** @type {RenderPipeline} */ (this.#Pipeline).CreateUniformBuffer(
            "Camera", { label: `${this.#Label} Camera Buffer` }
        ).buffer;

        /** @type {RenderPipeline} */ (this.#Pipeline).SetBindGroupFromResources(
            [...Object.values((this.#Font = font).BindGroupResources), this.#CameraBuffer], 0, MSDFFont.BindGroupLayout
        );
    }

    /**
     * @param {string} string
     * @param {ColorValue} [color = 0x000000]
     * @param {number} [scale = 0.01]
     * @param {boolean} [centered = false]
     */
    Write(string, color = 0x000000, scale = 0.01, centered = false)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`MSDFText.CreateRenderPipeline\` method before writing a string.`
        );

        !this.#Font && ThrowError(ERROR.FONT_NOT_FOUND, `\`MSDFText.Write\` method.
            Call \`MSDFText.LoadFont\` or \`MSDFText.SetFont\` method before writing a string.`
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
            measurements = this.#Measure(string, /** @type {MSDFFont} */ (this.#Font));

            this.#Measure(string, /** @type {MSDFFont} */ (this.#Font),
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
            measurements = this.#Measure(string, /** @type {MSDFFont} */ (this.#Font),
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

        Pipeline.ClearRenderBundles();
        Pipeline.SetDrawParams(4, measurements.instances);
        Pipeline.EncodeRenderBundle(/** @type {Renderer} */ (this.#Renderer).CreateRenderBundleEncoder());

        /**
         * When a font is generated in here {@link https://msdf-bmfont.donmccurdy.com/},
         * in the shader alpha values to test against the pixel distance need to range from -0.5 to 0.5
         * and from 0.5 to -0.5 if it's an A-Frame font {@link https://github.com/etiennepinchon/aframe-fonts}.
         */
        this.#TextData.set([- /** @type {MSDFFont} */ (this.#Font).Generated + 0.5, scale]);

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

    get Font()
    {
        return this.#Font;
    }

    Destroy()
    {
        this.#CameraBuffer?.destroy();
        this.#Pipeline?.Destroy();
        this.#Font?.Destroy();
    }
}
