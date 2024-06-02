import EXAMPLES from "./examples.json";

/** @type {HTMLAnchorElement} */
let currentAnchor = null;

/** @type {() => void} */
let destroyCurrent = () => void 0;

const aside = (
    /** @type {HTMLElement} */
    (document.getElementsByClassName("examples")[0])
);

const canvas = (
    /** @type {HTMLCanvasElement} */
    (document.getElementById("example"))
);

const examplesButton = (
    /** @type {HTMLButtonElement} */
    (document.getElementById("examples"))
);

const codeButton = (
    /** @type {HTMLButtonElement} */
    (document.getElementById("code"))
);

function createExamples()
{
    const baseHref = import.meta.env.PROD && "examples.html" || "";

    const examples = /** @type {Array<{ name: string, slug: string }>} */
    (/** @type {unknown} */ (EXAMPLES)).map(({ name, slug }) =>
    {
        const example = document.createElement("a");

        example.href = `${baseHref}#${slug}`;
        example.dataset.example = slug;
        example.textContent = name;
        example.title = name;

        return example;
    });

    document.getElementById("list").append(...examples);
}

async function runExample()
{
    const mobile = innerWidth <= 960;
    const example = location.hash.slice(1);

    if (example === currentAnchor?.dataset.example)
    {
        examplesButton.innerHTML = '&#62;';
        codeButton.classList.remove("hidden");
        currentAnchor?.classList.add("active");
        examplesButton.classList.remove("hidden");
        return mobile && aside.classList.add("hidden");
    }

    if (!example)
    {
        aside.classList.remove("hidden");
        examplesButton.innerHTML = '&#60;';
        examplesButton.classList.add("hidden");
        currentAnchor?.classList.remove("active");
        return codeButton.classList.add("hidden");
    }

    destroyCurrent();

    /** @type {HTMLAnchorElement} */
    const anchor = document.querySelector(`a[data-example="${example}"]`);

    examplesButton.classList.remove("hidden");
    currentAnchor?.classList.remove("active");
    codeButton.classList.remove("hidden");

    examplesButton.innerHTML = '&#62;';
    anchor?.classList.add("active");
    currentAnchor = anchor || null;

    const { run, destroy } = await import(`./${example}/index.js`);
    mobile && aside.classList.add("hidden");
    destroyCurrent = destroy;
    run(canvas);
};

examplesButton.addEventListener("click", () =>
{
    const hidden = aside.classList.toggle("hidden");
    examplesButton.innerHTML = `&#6${+hidden * 2};`;
}, false);

codeButton.addEventListener("click", () =>
{
    open(`https://github.com/UstymUkhman/uwal/blob/main/src/examples/${
        location.hash.slice(1)
    }/index.js`, "_blank");
}, false);

addEventListener("resize", () =>
{
    if (!location.hash.slice(1)) return;

    if (innerWidth > 960)
        aside.classList.remove("hidden");

    else
    {
        examplesButton.innerHTML = '&#62;';
        aside.classList.add("hidden");
    }
}, false);

addEventListener("hashchange", runExample, false);
createExamples();
runExample();
