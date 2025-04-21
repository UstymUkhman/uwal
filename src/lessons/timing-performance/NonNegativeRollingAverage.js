/**
 * @module NonNegativeRollingAverage
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description We disallow negative values as this is used for timestamp queries
 * where it's possible for a query to return a beginning time greater than
 * the end time. {@link https://gpuweb.github.io/gpuweb/#timestamp}
 * @version 0.0.11
 * @license MIT
 */
export default class NonNegativeRollingAverage
{
    #count = 0;
    #total = 0;
    #cursor = 0;
    #samples = [];

    constructor(samples = 30)
    {
        this.#count = samples;
    }

    addSample(value)
    {
        if (Number.isFinite(value) && !Number.isNaN(value) && 0 <= value)
        {
            const current = this.#samples[this.#cursor] || 0;

            this.#total += value - current;
            this.#samples[this.#cursor] = value;
            this.#cursor = (this.#cursor + 1) % this.#count;
        }
    }

    get() {
        return this.#total / this.#samples.length;
    }
}
