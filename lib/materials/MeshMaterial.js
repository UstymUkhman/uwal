import BaseMaterial from "./BaseMaterial";

export default class MeshMaterial extends BaseMaterial
{
    /**
     * @param {import("../utils/Color").ColorParam | number} [color = 0xffffff]
     * @param {string} [label = "MeshMaterial"]
     */
    constructor(color = 0xffffff, label = "MeshMaterial")
    {
        super(color, label);
    }
}
