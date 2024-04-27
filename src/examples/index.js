/** @type {HTMLAnchorElement} */
let currentAnchor = null;

/** @type {() => void} */
let destroyCurrent = () => void 0;

const canvas = (
    /** @type {HTMLCanvasElement} */
    (document.getElementById("example"))
);

const codeButton = (
    /** @type {HTMLButtonElement} */
    (document.getElementById("code"))
);

const runExample = async () =>
{
    const example = location.hash.slice(1);
    const same = example === currentAnchor?.dataset.example;

    if (same || !example) return;
    destroyCurrent();

    /** @type {HTMLAnchorElement} */
    const anchor = document.querySelector(`a[data-example="${example}"]`);

    currentAnchor?.classList.remove("active");
    codeButton.classList.remove("hidden");

    anchor?.classList.add("active");
    currentAnchor = anchor || null;

    const { run, destroy } = await import(`./${example}/index.js`);
    destroyCurrent = destroy;
    run(canvas);
};

codeButton.addEventListener("click", () =>
{
    window.open(`https://github.com/UstymUkhman/uwal/blob/main/src/examples/${
        location.hash.slice(1)
    }/index.js`, "_blank");
}, false);

addEventListener("hashchange", runExample, false);
runExample();
