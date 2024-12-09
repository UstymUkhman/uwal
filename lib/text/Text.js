import { CreateConstantObject } from "@/utils";
import { vec2, mat3 } from "wgpu-matrix";
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
    /** @type {string} */ #Text;
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
    /** @type {Float32Array} */ #TexureSize;
    /** @type {GPUTextureView} */ #TextureView;

    /** @type {Float32Array} */ #Color = new Color();
    /** @type {Float32Array} */ #Back = new Color(0xffffff);
    /** @type {Float32Array} */ #TextMatrix = mat3.create();

    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create(), size: vec2.create() });

    /**
     * @typedef {Object} TextDescriptor
     * @property {import("../Color").ColorParam} [background = 0xffffff]
     * @property {import("../Color").ColorParam} [color = 0x000000]
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
            color = this.#Color,
            background = this.#Back
        } = descriptor;

        this.Background = background;
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
        const { buffer: fontBuffer, Font: { color, back, subpx, hint } } = this.#Renderer.CreateUniformBuffer("Font", {
            label: `${this.#Label} Font Uniform Buffer`
        });

        const { buffer: textBuffer, Text: { matrix: textMatrix, texureSize } } = this.#Renderer.CreateUniformBuffer(
            "Text", { label: `${this.#Label} Uniform Buffer` }
        );

        hint[0] = +this.#Hinting;
        back.set(this.#Back.rgba);
        subpx[0] = +this.#Subpixel;
        color.set(this.#Color.rgba);

        this.#TextMatrix = textMatrix;
        this.#TexureSize = texureSize;
        this.#TextBuffer = textBuffer;
        this.#FontBuffer = fontBuffer;

        this.#Renderer.WriteBuffer(fontBuffer, color.buffer);
    }

    #CreateVertexBuffer()
    {
        this.#VertexBuffer?.destroy();
        this.#Vertices = this.#Text.length * 6;
        const attributes = new Float32Array(this.#Vertices * 5);
        this.#VertexBuffer = this.#Renderer.CreateVertexBuffer(attributes);

        return attributes;
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
     * @param {[number, number]} position
     */
    #SetTextRectangle(vertices, position)
    {
        let maxWidth = 0;
		let prevChar = " ";
		let textPosition = 0;
		let arrayPosition = 0;
		let current = position;

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

        this.#BBox.min[0] = position[0];
        this.#BBox.min[1] = position[1];

        this.#BBox.max[0] = maxWidth;
        this.#BBox.max[1] = current[1] + lineHeight;

        this.#BBox.size[0] = this.#BBox.max[0] - this.#BBox.min[0];
        this.#BBox.size[1] = this.#BBox.max[1] - this.#BBox.min[1];

        this.#UpdateMatrix();
    }

    /**
     * @param {GPUImageCopyExternalImageSource} source
     * @param {"r8unorm" | "r16float"} [format = "r8unorm"]
     */
    async SetFontTexture(source, format = "r8unorm")
    {
        const Texture = new (await UWAL.Texture());

        const texture = Texture.CopyImageToTexture(source, {
            generateMipmaps: false,
            create: { format }
        });

        this.#TextureView = texture.createView();
        this.#TexureSize.set([texture.width, texture.height]);
        this.#Sampler = Texture.CreateSampler({ filter: "linear" });
        this.#Renderer.WriteBuffer(this.#TextBuffer, this.#TexureSize.buffer);
    }

    /**
     * @param {string} text
     * @param {[number, number]} position
     * @todo Throw error if `Text.SetFontTexture` hasn't been called.
     */
    Write(text, position)
    {
        this.#Text = text;
        const attributes = this.#CreateVertexBuffer();
        this.#Renderer.WriteBuffer(this.#VertexBuffer, attributes);

        this.#SetTextRectangle(attributes, position);

        this.#BindGroup = this.#Renderer.CreateBindGroup(
            this.#Renderer.CreateBindGroupEntries([
                { buffer: this.#TextBuffer },
                { buffer: this.#FontBuffer },
                this.#TextureView,
                this.#Sampler
            ]), 0, `${this.#Label} Bind Group`
        );
    }

    /** @param {boolean} [submit = true] */
    Render(submit = true)
    {
        this.#Renderer.SavePipelineState();
        this.#Renderer.SetBindGroups(this.#BindGroup);
        this.#Renderer.SetVertexBuffers(this.#VertexBuffer);
        this.#Renderer.Render(this.#Vertices, submit);
        this.#Renderer.RestorePipelineState();
    }

    Resize()
    {
        this.#UpdateMatrix();
    }

    Destroy()
    {
        this.#TextBuffer = this.#TextBuffer.destroy();
        this.#FontBuffer = this.#FontBuffer.destroy();
        this.#VertexBuffer = this.#VertexBuffer.destroy();
    }

    /** @param {import("../Color").ColorParam} color */
    set Background(color)
    {
        this.#Back.rgba = color instanceof Color ? color.rgba : color;
    }

    /** @param {import("../Color").ColorParam} color */
    set Color(color)
    {
        this.#Color.rgba = color instanceof Color ? color.rgba : color;
    }

    /** @param {number} size */
    set Size(size)
    {
        const lineGap = this.#LineGap / this.#Size;
        this.#Size = Math.round(this.#Renderer.DevicePixelRatio * size);

        if (!this.#VertexBuffer) return;
        this.#LineGap = this.#Size * lineGap;
        this.#SetTextRectangle(this.#VertexBuffer.size / Float32Array.BYTES_PER_ELEMENT, this.#BBox.min);
    }

    get BoundingBox()
    {
        return this.#BBox;
    }
}
