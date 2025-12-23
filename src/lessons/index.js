document.getElementById("code").addEventListener("click", () =>
{
    window.open(`https://github.com/UstymUkhman/uwal/blob/main/src/lessons/${
        location.hash.slice(1)
    }/index.js`, "_blank");
}, false);

function runLesson()
{
    const name = location.hash.slice(1);

    const title = name.split("-").map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");

    import(`./${name}/index.js`);
    document.title = `${document.title} | ${title}`;
};

addEventListener("hashchange", runLesson, false);
runLesson();
