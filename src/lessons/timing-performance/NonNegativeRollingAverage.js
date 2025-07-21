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
