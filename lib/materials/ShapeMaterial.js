import BaseMaterial from "./BaseMaterial";

export default class ShapeMaterial extends BaseMaterial
{
    /**
     * @param {import("../utils/Color").ColorParam | number} [color = 0xffffff]
     * @param {string} [label = "ShapeMaterial"]
     */
    constructor(color = 0xffffff, label = "ShapeMaterial")
    {
        super(color, label);
    }
}
