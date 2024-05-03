/** @param {Record<string, unknown>} values */
export function CreateConstantObject(values)
{
    /** @type {object} */ const constants = {};

    for (let value in values)
        constants[value] = { value: values[value] };

    return Object.freeze(Object.create(null, constants));
}
