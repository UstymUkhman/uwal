import UWAL from "#/UWAL";
import Color from "#/Color";
import * as Shaders from "#/shaders";
import { vec2, mat3 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";
import { CreateConstantObject } from "#/utils";

export default class SDFText
{
    /**
     * @typedef {Object} Char
     * @property {number} flags
     * @property {number[]} rect
     * @property {number} codepoint
     * @property {number} advance_x
     * @property {number} bearing_x
     * @property {number} bearing_y
     */

    /**
     * @typedef {Object} Font
     * @property {number} ix
     * @property {number} iy
     * @property {number} aspect
     * @property {number} ascent
     * @property {number} descent
     * @property {number} line_gap
     * @property {number} x_height
     * @property {number} row_height
     * @property {number} cap_height
     * @property {number} space_advance
     * @property {Record<string, Char>} chars
     * @property {Object} [kern]
     */

    /**
     * @typedef {Object} FontMetrics
     * @property {number} ascent
     * @property {number} lowScale
     * @property {number} capScale
     * @property {number} lineHeight
     */

    static #Label = "SDFText";
    /** @type {Font} */ #Font;
    /** @type {string} */ #Text;
    /** @type {number} */ #Size;
    /** @type {number} */ #LineGap;

    /** @type {boolean} */ #Hinting;
    /** @type {boolean} */ #Subpixel;
    /** @type {Renderer} */ #Renderer;
    /** @type {Float32Array} */ #Back;
    /** @type {Float32Array} */ #Color;

    /** @type {GPUBuffer} */ #TextBuffer;
    /** @type {GPUBuffer} */ #FontBuffer;
    /** @type {Float32Array} */ #Vertices;
    /** @type {GPUBuffer} */ #VertexBuffer;
    /** @type {Float32Array} */ #TexureSize;

    /** @type {Float32Array} */ #TextMatrix = mat3.create();
    /** @type {GPUBindGroup[]} */ #BindGroups = [undefined];
    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create(), size: vec2.create() });

    /**
     * @typedef {Object} TextDescriptor
     * @property {import("../Color").ColorParam} [background = [1, 1, 1, 1]]
     * @property {import("../Color").ColorParam} [color = [0, 0, 0, 1]]
     * @property {string} [label = "SDFText"]
     * @property {boolean} [subpixel = true]
     * @property {boolean} [hinting = true]
     * @property {number} [lineGap = 0]
     * @property {number} [size = 16]
     * @property {Renderer} renderer
     * @property {Font} font
     * @param {TextDescriptor} descriptor
     */
    constructor(descriptor)
    {
        const {
            font,
            color,
            renderer,
            size = 16,
            background,
            lineGap = 0,
            hinting = true,
            subpixel = true,
            label = "SDFText"
        } = descriptor;

        this.#Font = font;
        SDFText.#Label = label;
        this.#Hinting = hinting;
        this.#Subpixel = subpixel;
        this.#Renderer = renderer;

        this.Size = size ?? 0x10;
        this.#CreateUniformBuffer();
        this.Color = color ?? [0, 0, 0, 1];
        this.#LineGap = this.#Size * lineGap;
        this.Background = background ?? [1, 1, 1, 1];
    }

    #CreateUniformBuffer()
    {
        const { buffer: textBuffer, Text: { matrix: textMatrix, texureSize } } = this.#Renderer.CreateUniformBuffer(
            "Text", { label: `${SDFText.#Label} Uniform Buffer` }
        );

        const { buffer: fontBuffer, Font: { color, back, subpx, hint } } = this.#Renderer.CreateUniformBuffer(
            "Font", { label: `${SDFText.#Label} Font Uniform Buffer` }
        );

        this.#TextBuffer = textBuffer;
        this.#TextMatrix = textMatrix;
        this.#TexureSize = texureSize;
        this.#FontBuffer = fontBuffer;

        subpx[0] = +this.#Subpixel;
        hint[0] = +this.#Hinting;
        this.#Color = color;
        this.#Back = back;
    }

    #CreateVertexBuffer()
    {
        this.#VertexBuffer?.destroy();
        this.#Vertices = new Float32Array(this.#Text.length * 6 * 5);
        this.#VertexBuffer = this.#Renderer.CreateVertexBuffer(this.#Vertices);
    }

    #GetFontMetrics()
    {
        const { cap_height, ascent, x_height, descent, line_gap } = this.#Font;
        const capScale = this.#Size / cap_height;

        return {
            capScale, ascent: Math.round(ascent * capScale),
            lowScale: Math.round(x_height * capScale) / x_height,
            lineHeight: Math.round((ascent + descent + line_gap) * capScale + this.#LineGap)
        };
    }

    /**
     * @param {[number, number]} position
     * @param {FontMetrics} metrics
     * @param {Char} character
     * @param {number} [kern = 0]
     */
    #GetCharacterRectangle([x, y], metrics, character, kern = 0)
    {
        const { aspect, ix, descent, iy, row_height } = this.#Font;
        const { flags, bearing_x, rect, advance_x } = character;
        const { lowScale, capScale, ascent } = metrics;
        const scale = flags & 1 ? lowScale : capScale;
        const scaledAspect = aspect * scale;

        const left = x + scaledAspect * (bearing_x + kern - ix);
        const right = left + scaledAspect * (rect[2] - rect[0]);
        const bottom = (y - ascent) - scale * (descent + iy);
        const top = bottom + scale * (row_height);

        x += advance_x * scaledAspect;
        const size = scale * iy * 2;

        return {
            position: [x, y],
            vertices: [
                left , top,    rect[0], rect[1], size,
                right, top,    rect[2], rect[1], size,
                left , bottom, rect[0], rect[3], size,

                left , bottom, rect[0], rect[3], size,
                right, top,    rect[2], rect[1], size,
                right, bottom, rect[2], rect[3], size
            ]
        };
    }

    #UpdateMatrix()
    {
        const [width, height] = this.#Renderer.CanvasSize;

        const rx = Math.round(this.#BBox.size[0] * -0.5);
        const ry = Math.round(this.#BBox.size[1] *  0.5);

        const sx = 2 / (Math.round(width  * 0.5) * 2);
        const sy = 2 / (Math.round(height * 0.5) * 2);

        mat3.set(sx, 0, 0, 0, sy, 0, rx * sx, ry * sy, 1, this.#TextMatrix);
        this.#Renderer.WriteBuffer(this.#TextBuffer, this.#TextMatrix.buffer);
    }

    /**
     * @param {Float32Array} vertices
     * @param {[number, number]} origin
     */
    #SetTextRectangle(vertices, origin)
    {
        let maxWidth = 0;
		let prevChar = " ";
		let current = origin;
		let textPosition = 0;
		let arrayPosition = 0;

        const metrics = this.#GetFontMetrics();
        const { lineHeight, capScale } = metrics;
        const { space_advance, chars, kern } = this.#Font;

        while (true)
        {
            if ((textPosition === this.#Text.length) || (vertices.length <= arrayPosition)) break;

            let char = this.#Text[textPosition++];

            if (char === "\n")
            {
                maxWidth = Math.max(maxWidth, current[0]);
                current[1] -= lineHeight;
                current[0] = origin[0];
                prevChar = " ";
                continue;
            }

            if (char === " ")
            {
                current[0] += space_advance * capScale;
                prevChar = " ";
                continue;
            }

			let fontChar = chars[char];
            // Replace unavailable chars with "?":
			if (!fontChar) fontChar = chars[char = "?"];

            const rect = this.#GetCharacterRectangle(current, metrics, fontChar, kern[prevChar + char]);
            for (let v = 0, l = rect.vertices.length; v < l; ++v) vertices[arrayPosition++] = rect.vertices[v];

            current = rect.position;
            prevChar = char;
        }

        this.#BBox.min[0] = origin[0];
        this.#BBox.min[1] = origin[1];

        this.#BBox.max[0] = maxWidth || current[0];
        this.#BBox.max[1] = current[1] + lineHeight;

        this.#BBox.size[0] = this.#BBox.max[0] - this.#BBox.min[0];
        this.#BBox.size[1] = this.#BBox.max[1] - this.#BBox.min[1];

        this.#Renderer.WriteBuffer(this.#VertexBuffer, vertices);

        this.#UpdateMatrix();
    }

    /**
     * @param {Renderer} Renderer
     * @param {string | string[]} [shader = ""]
     * @param {GPUBlendOperation} [operation = "add"]
     * @param {GPUBlendFactor} [srcFactor = "src1"]
     * @param {GPUBlendFactor} [dstFactor = "one-minus-src1"]
     */
    static async GetFragmentStateParams(Renderer, shader = "", operation, srcFactor, dstFactor)
    {
        const color = Renderer.CreateBlendComponent(operation, srcFactor ?? "src1", dstFactor ?? "one-minus-src1");
        let code = (/** @type {string} */ (Array.isArray(shader) && shader.join("\n\n") || shader));
        const enabled = (await UWAL.Device).features.has("dual-source-blending");

        code = `${Shaders.SDFText}\n\n${code}`;
        enabled && (code = `${Shaders.SDFTextDSB}\n\n${code}`);

        return {
            target: Renderer.CreateTargetState(undefined, enabled && { color } || undefined),
            module: Renderer.CreateShaderModule(code, `${SDFText.#Label} Shader Module`),
            entry: (enabled && "dsbTextFragment") || "textFragment",
            constants: { TRIPLET_FACTOR: 0.6 },
            shader: code
        };
    }

    /**
     * @param {GPUImageCopyExternalImageSource} source
     * @param {"r8unorm" | "r16float"} [format = "r8unorm"]
     */
    async SetFontTexture(source, format = "r8unorm")
    {
        const Texture = new (await UWAL.Texture());

        const texture = Texture.CopyImageToTexture(source, {
            create: { format }, mipmaps: false
        });

        this.#TexureSize.set([texture.width, texture.height]);
        this.#Renderer.WriteBuffer(this.#TextBuffer, this.#TexureSize);

        this.#BindGroups[0] = this.#Renderer.CreateBindGroup(
            this.#Renderer.CreateBindGroupEntries([
                Texture.CreateSampler({ filter: "linear" }),
                { buffer: this.#TextBuffer },
                { buffer: this.#FontBuffer },
                texture.createView()
            ]), 0, `${SDFText.#Label} Bind Group`
        );
    }

    /** @param {GPUBindGroup | GPUBindGroup[]} bindGroups */
    AddBindGroups(bindGroups)
    {
        this.#BindGroups.push(...(Array.isArray(bindGroups) && bindGroups || [bindGroups]));
    }

    /**
     * @param {string} text
     * @param {[number, number]} [origin = [0, 0]]
     */
    Write(text, origin = [0, 0])
    {
        !this.#BindGroups[0] && ThrowError(ERROR.FONT_TEXTURE_NOT_FOUND,
            `\`SDFText.Write\` method. Call \`SDFText.SetFontTexture\` method before writing any string.`
        );

        this.#Text = text;
        this.#CreateVertexBuffer();
        origin = origin.map(coord => -coord);
        this.#SetTextRectangle(this.#Vertices, origin);
    }

    /** @param {boolean} [submit = true] */
    Render(submit = true)
    {
        this.#Renderer.SavePipelineState();
        this.#Renderer.SetBindGroups(this.#BindGroups);
        this.#Renderer.SetVertexBuffers(this.#VertexBuffer);
        this.#Renderer.Render(this.#Vertices.length / 5, submit);
        this.#Renderer.RestorePipelineState();
    }

    Resize()
    {
        this.#UpdateMatrix();
    }

    Destroy()
    {
        this.#BindGroups.length = 1;
        this.#TextBuffer = this.#TextBuffer.destroy();
        this.#FontBuffer = this.#FontBuffer.destroy();
        this.#VertexBuffer = this.#VertexBuffer.destroy();
    }

    /** @param {[number, number]} position */
    set Position([x, y])
    {
        this.#BBox.min[0] = x;
        this.#BBox.min[1] = y;

        this.#BBox.size[0] = this.#BBox.max[0] - x;
        this.#BBox.size[1] = this.#BBox.max[1] - y;

        this.#BBox.max[0] += x;
        this.#BBox.max[1] += y;

        this.#UpdateMatrix();
    }

    /** @param {import("../Color").ColorParam} color */
    set Background(color)
    {
        this.#Back.set(color instanceof Color ? color.rgba : color);
        this.#Renderer.WriteBuffer(this.#FontBuffer, this.#Back.buffer);
    }

    /** @param {import("../Color").ColorParam} color */
    set Color(color)
    {
        this.#Color.set(color instanceof Color ? color.rgba : color);
        this.#Renderer.WriteBuffer(this.#FontBuffer, this.#Color.buffer);
    }

    /** @param {number} size */
    set Size(size)
    {
        const lineGap = this.#LineGap / this.#Size;
        this.#Size = Math.round(this.#Renderer.DevicePixelRatio * size);

        if (!this.#VertexBuffer) return;
        this.#LineGap = this.#Size * lineGap;

        const origin = this.#BBox.min.map((coord, c) => coord * (c * -1 + 0.5));
        this.#SetTextRectangle(this.#Vertices, origin);
    }

    get BoundingBox()
    {
        return this.#BBox;
    }
}
