import { mat4 } from "wgpu-matrix";

export default class MatrixStack
{
    #Matrix = mat4.identity();
    #Stack = [];

    Push()
    {
        this.#Stack.push(this.#Matrix);
        this.#Matrix = mat4.copy(this.#Matrix);
        return this;
    }

    Pop()
    {
        this.#Matrix = this.#Stack.pop();
        return this;
    }

    Translate(translation)
    {
        mat4.translate(this.#Matrix, translation, this.#Matrix);
        return this;
    }

    RotateX(angle)
    {
        mat4.rotateX(this.#Matrix, angle, this.#Matrix);
        return this;
    }

    RotateY(angle)
    {
        mat4.rotateY(this.#Matrix, angle, this.#Matrix);
        return this;
    }

    RotateZ(angle)
    {
        mat4.rotateZ(this.#Matrix, angle, this.#Matrix);
        return this;
    }

    Scale(scale)
    {
        mat4.scale(this.#Matrix, scale, this.#Matrix);
        return this;
    }

    Set(matrix)
    {
        return this.#Matrix.set(matrix);
    }

    Get()
    {
        return this.#Matrix;
    }

    Reset()
    {
        this.#Matrix = mat4.identity();
        this.#Stack = [];
        return this;
    }
}
