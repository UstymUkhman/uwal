import { CreateConstantObject } from "@/utils";
import Color from "@/Color";
import UWAL from "@/UWAL";

export default class Text
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

    /** @type {Font} */ #Font;
    /** @type {number} */ #Size;
    /** @type {string} */ #Label;
    /** @type {number} */ #LineGap;

    /** @type {number} */ #Vertices;
    /** @type {boolean} */ #Hinting;
    /** @type {boolean} */ #Subpixel;
    /** @type {Renderer} */ #Renderer;
    /** @type {GPUSampler} */ #Sampler;

    /** @type {GPUBuffer} */ #TextBuffer;
    /** @type {GPUBuffer} */ #FontBuffer;
    /** @type {GPUBuffer} */ #VertexBuffer;
    /** @type {GPUBindGroup} */ #BindGroup;

    /** @type {Float32Array} */ #Transform;
    /** @type {Float32Array} */ #TexureSize;
    /** @type {GPUTextureView} */ #TextureView;
    /** @type {Float32Array} */ #Color = new Color();

    /**
     * @typedef {Object} TextDescriptor
     * @property {import("../Color").ColorParam} [color = 0x0]
     * @property {boolean} [subpixel = true]
     * @property {boolean} [hinting = true]
     * @property {string} [label = "Text"]
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
            renderer,
            size = 16,
            lineGap = 0,
            label = "Text",
            hinting = true,
            subpixel = true,
            color = this.#Color
        } = descriptor;

        this.#Renderer = renderer;
        this.#Subpixel = subpixel;
        this.#Hinting = hinting;

        this.#Label = label;
        this.Color = color;
        this.#Font = font;
        this.Size = size;

        this.#CreateUniformBuffer();
        this.#LineGap = this.#Size * lineGap;
    }

    #CreateUniformBuffer()
    {
        const { buffer: textBuffer, Text: { transform, texureSize } } = this.#Renderer.CreateUniformBuffer(
            "Text", { label: `${this.#Label} Uniform Buffer` }
        );

        const { buffer: fontBuffer, Font: { color, back, subpx, hint } } = this.#Renderer.CreateUniformBuffer("Font", {
            label: `${this.#Label} Font Uniform Buffer`
        });

        back.set([1, 1, 1, 1]);
        hint[0] = +this.#Hinting;
        subpx[0] = +this.#Subpixel;
        color.set(this.#Color.rgba);

        this.#Transform  = transform;
        this.#TexureSize = texureSize;

        this.#TextBuffer = textBuffer;
        this.#FontBuffer = fontBuffer;

        this.#Renderer.WriteBuffer(fontBuffer, color.buffer);
    }

    /** @returns {FontMetrics} */
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

    /**
     * @param {string} text
     * @param {FontMetrics} metrics
     * @param {Float32Array} vertices
     * @param {[number, number]} position
     */
    #SetTextRectangle(text, metrics, vertices, position)
    {
        const { space_advance, chars, kern } = this.#Font;
        const { lineHeight, capScale } = metrics;

		let current = position;
		let arrayPosition = 0;
		let textPosition = 0;
		let prevChar = " ";
		let maxWidth = 0;

        while (true)
        {
            if ((textPosition === text.length) || (vertices.length <= arrayPosition)) break;

            let char = text[textPosition++];

            if (char === "\n")
            {
                maxWidth = Math.max(maxWidth, current[0]);
                current[0] = position[0];
                current[1] -= lineHeight;
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

        const [x, y] = position;
		const width = maxWidth - x;
		const height = y - current[1] + lineHeight;

        return {
            rectangle: [x, y, width, height],
            textPosition, arrayPosition
        };
    }

    Destroy()
    {
        this.#TextBuffer = this.#TextBuffer.destroy();
        this.#FontBuffer = this.#FontBuffer.destroy();
        this.#VertexBuffer = this.#VertexBuffer.destroy();
    }
}
