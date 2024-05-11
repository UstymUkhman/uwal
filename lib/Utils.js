/**
 * @template {string} K
 * @template V
 * @param {Record<K, V>} values
 * @returns {Readonly<Record<K, V>>}
 */
export function CreateConstantObject(values)
{
    for (let value in values)
        values[value] = /** @type {V} */ ({
            value: values[value]
        });

    return Object.freeze(Object.create(null, values));
}
