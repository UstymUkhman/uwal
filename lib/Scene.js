import { GetParamArray } from "#/utils";

export default class Scene
{
    /** @type {string} */ #Label;
    /** @type {Node[]} */ Children = [];

    /** @param {string} [label = "Scene"] */
    constructor(label = "Scene")
    {
        this.#Label = label;
    }

    /** @param {Node | Node[]} children */
    Add(children)
    {
        children = /** @type {Node[]} */ (GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /** @param {Node | Node[]} children */
    Remove(children)
    {
        children = /** @type {Node[]} */ (GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /**
     * @param {string} label
     * @returns {Node | null}
     */
    Find(label)
    {
        for (const c = 0, l = this.Children.length; c < l; c++)
        {
            const child = this.Children[c].Find(label);
            if (child) return child;
        }

        return null;
    }
}
