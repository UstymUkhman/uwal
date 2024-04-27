const runLesson = () => import(`./${location.hash.slice(1)}/index.js`);

document.getElementById("code").addEventListener("click", () =>
{
    window.open(`https://github.com/UstymUkhman/uwal/blob/main/src/lessons/${
        location.hash.slice(1)
    }/index.js`, "_blank");
}, false);

addEventListener("hashchange", runLesson, false);
runLesson();
