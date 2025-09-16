export default class Mesh
{
    /** @type {string} */ #Label;

    /** @param {string} [label = "Mesh"] */
    constructor(label = "Mesh")
    {
        this.#Label = label;
    }
}
