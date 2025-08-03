import DEMOS from "./demos.json";
import "/assets/css/preview.scss";
import "/assets/css/examples.scss";
import EXAMPLES from "./examples.json";

/** @type {string} */
let runningType = null;

/** @type {HTMLAnchorElement} */
let currentAnchor = null;

let mobile = innerWidth <= 960;

/** @type {() => void} */
let destroyCurrent = () => void 0;

const examplesTitle = document.title;

const aside = (
    /** @type {HTMLElement} */
    (document.getElementsByClassName("examples")[0])
);

const canvas = (
    /** @type {HTMLCanvasElement} */
    (document.getElementById("preview"))
);

const iframe = (
    /** @type {HTMLIFrameElement} */
    (document.getElementById("demo"))
);

const listButton = (
    /** @type {HTMLButtonElement} */
    (document.getElementById("list"))
);

const codeButton = (
    /** @type {HTMLButtonElement} */
    (document.getElementById("code"))
);

/**
 * @param {string} name
 * @param {HTMLAnchorElement} anchor
 */
function updateAnchor(name, anchor)
{
    document.title = `${examplesTitle} | ${name}`;
    currentAnchor?.classList.remove("active");
    anchor?.classList.add("active");
    currentAnchor = anchor || null;
    showComponents();
}

/** @param {"examples" | "demos"} type */
function createExamples(type)
{
    const dataType = type.slice(0, -1);
    const JSON = (type === "examples" && EXAMPLES) || DEMOS;
    const baseHref = import.meta.env.PROD && "examples.html" || "";

    const examples = /** @type {Array<{ name: string, slug: string }>} */
    (/** @type {unknown} */ (JSON)).map(({ name, slug }) =>
    {
        const example = document.createElement("li");
        const link = document.createElement("a");

        link.href = `${baseHref}#${slug}`;
        link.dataset[dataType] = slug;
        example.appendChild(link);

        link.textContent = name;
        link.title = name;
        return example;
    });

    document.getElementById(type).append(...examples);
}

function cleanExample()
{
    runningType = null;
    iframe.title = "Demo";
    document.title = examplesTitle;
    listButton.innerHTML = '&#60;';
    aside.classList.remove("hidden");
    listButton.classList.add("hidden");
    codeButton.classList.add("hidden");
    currentAnchor?.classList.remove("active");
}

function showComponents()
{
    listButton.innerHTML = '&#62;';
    listButton.classList.remove("hidden");
    codeButton.classList.remove("hidden");
    return mobile && aside.classList.add("hidden");
}

/**
 * @param {string} example
 * @param {"example" | "demo"} type
 */
function runUpdates(example, type)
{
    if (example === currentAnchor?.dataset[type])
    {
        currentAnchor?.classList.add("active");
        return showComponents();
    }

    return !example
        ? cleanExample()
        : ~destroyCurrent() && true;
}

async function runExample()
{
    const example = location.hash.slice(1);

    if (runUpdates(example, "example"))
    {
        const currentExample = /** @type {Array<{ name: string, slug: string }>} */
            (/** @type {unknown} */ (EXAMPLES)).find(({ slug }) => example === slug);

        if (!currentExample) return true;

        const anchor = document.querySelector(`a[data-example="${example}"]`);
        const { run, destroy } = await import(`./${example}/index.js`);
        updateAnchor(currentExample.name, anchor);

        destroyCurrent = destroy;
        runningType = "example";
        run(canvas);
    }
};

async function runDemo()
{
    const demo = location.hash.slice(1);

    if (runUpdates(demo, "demo"))
    {
        const currentDemo = /** @type {Array<{ name: string, slug: string }>} */
            (/** @type {unknown} */ (DEMOS)).find(({ slug }) => demo === slug);

        if (!currentDemo) return cleanExample();

        setTimeout(() => iframe.src = `https://ustymukhman.github.io/${demo}/dist`);
        destroyCurrent = () => iframe.style.display = "none" && (iframe.src = "");
        const anchor = document.querySelector(`a[data-demo="${demo}"]`);

        updateAnchor(currentDemo.name, anchor);
        iframe.title = currentDemo.name;
        iframe.style.display = "block";
        runningType = "demo";
    }
};

codeButton.addEventListener("click", () =>
    open("https://github.com/UstymUkhman/" +
        (runningType === "demo" && "#" || "uwal/blob/main/src/examples/#/index.js")
        .replace("#", location.hash.slice(1)), "_blank")
, false);

listButton.addEventListener("click", () =>
    listButton.innerHTML = `&#6${+(aside.classList.toggle("hidden")) * 2};`
, false);

addEventListener("hashchange", () =>
    runExample() && runDemo()
, false);

addEventListener("resize", () =>
{
    mobile = innerWidth <= 960;
    if (!location.hash.slice(1)) return;

    if (innerWidth > 960)
        aside.classList.remove("hidden");
    else
    {
        listButton.innerHTML = '&#62;';
        aside.classList.add("hidden");
    }
}, false);

createExamples("demos");
createExamples("examples");
runExample() && runDemo();
