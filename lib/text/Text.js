import { CreateConstantObject } from "@/utils";
import Color from "@/Color";

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
     * @property {number} pixelSize
     * @property {number} lineHeight
     */

    /** @type {Font} */ #Font;
    /** @type {string} */ #Label;
    /** @type {number} */ #Vertices;
    /** @type {Renderer} */ #Renderer;

    /** @type {Float32Array} */ #Transform;
    /** @type {Float32Array} */ #TexureSize;
    /** @type {Float32Array} */ #BorderSize;
    /** @type {GPUBuffer} */ #UniformBuffer;

    /** @type {Float32Array} */ #BackgroundColor = new Color();
    /** @type {Float32Array} */ #TextColor = new Color(0xffffff);
    /** @type {{ [K in "transform" | "texureSize" | "borderSize"]: number }} */ #Offset;

    /**
     * @typedef {Object} TextDescriptor
     * @property {import("../Color").ColorParam} [background = 0x000000]
     * @property {import("../Color").ColorParam} [color = 0xffffff]
     * @property {boolean} [subpixel = true]
     * @property {boolean} [hinting = true]
     * @property {string} [label = "Text"]
     * @property {number} [size = 16]
     * @property {Renderer} renderer
     * @property {string} texture
     * @property {Font} font
     * @param {TextDescriptor} descriptor
     */
    constructor(descriptor)
    {
        this.#Label = descriptor.label ?? "Text";
        this.#Renderer = descriptor.renderer;
        this.#CreateUniformBuffer();
    }

    #CreateUniformBuffer()
    {
        const { buffer, text: { transform, texureSize, borderSize } } = this.#Renderer.CreateUniformBuffer("text", {
            label: `${this.#Label} Uniform Buffer`
        });

        this.#Offset = CreateConstantObject({ transform: 0, texureSize: 48, borderSize: 56 });

        this.#UniformBuffer = buffer;
        this.#Transform = transform;
        this.#TexureSize = texureSize;
        this.#BorderSize = borderSize;
    }

    /**
     * @param {number} pixelSize
     * @param {number} [lineGap = 0]
     * @returns {FontMetrics}
     */
    #GetFontMetrics(pixelSize, lineGap = 0)
    {
        const { cap_height, ascent, x_height, descent, line_gap } = this.#Font;
        const capScale = pixelSize / cap_height;

        return {
            capScale,
            pixelSize,
            ascent: Math.round(ascent * capScale),
            lowScale: Math.round(x_height * capScale) / x_height,
            lineHeight: Math.round((ascent + descent + line_gap) * capScale + lineGap)
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
        x += (advance_x + kern) * scaledAspect;

        return {
            position: [x, y],
            vertices: [
                left , top,    rect[0], rect[1], scale,
                right, top,    rect[2], rect[1], scale,
                left , bottom, rect[0], rect[3], scale,

                left , bottom, rect[0], rect[3], scale,
                right, top,    rect[2], rect[1], scale,
                right, bottom, rect[2], rect[3], scale
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
            if ((textPosition === text.length) || (vertices.length <= arrayPosition + 30)) break;

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
        this.#Vertices = arrayPosition / 5; // 5 = 20 / 4 =
        // VertexBufferLayout.arrayStride / Float32Array.BYTES_PER_ELEMENT

        return {
            rectangle: [x, y, width, height],
            textPosition, arrayPosition
        };
    }

    Destroy()
    {
        // this.#VertexBuffer = this.#VertexBuffer.destroy();
        this.#UniformBuffer = this.#UniformBuffer.destroy();
    }
}
