import { Node } from "#/index";

export default class NodeHelper
{
    #Node = new Node();

    set Node(node) { this.#Node = node; }

    set PositionX(x) { this.#Node.Position[0] = x; }
    get PositionX() { return this.#Node.Position[0]; }
    set PositionY(x) { this.#Node.Position[1] = x; }
    get PositionY() { return this.#Node.Position[1]; }
    set PositionZ(x) { this.#Node.Position[2] = x; }
    get PositionZ() { return this.#Node.Position[2]; }

    set RotationX(x) { this.#Node.Rotation[0] = x; }
    get RotationX() { return this.#Node.Rotation[0]; }
    set RotationY(x) { this.#Node.Rotation[1] = x; }
    get RotationY() { return this.#Node.Rotation[1]; }
    set RotationZ(x) { this.#Node.Rotation[2] = x; }
    get RotationZ() { return this.#Node.Rotation[2]; }

    set ScaleX(x) { this.#Node.Scaling[0] = x; }
    get ScaleX() { return this.#Node.Scaling[0]; }
    set ScaleY(x) { this.#Node.Scaling[1] = x; }
    get ScaleY() { return this.#Node.Scaling[1]; }
    set ScaleZ(x) { this.#Node.Scaling[2] = x; }
    get ScaleZ() { return this.#Node.Scaling[2]; }
}
