import "/assets/css/preview.scss";

document.getElementById("code").addEventListener("click", () =>
{
    window.open(`https://github.com/UstymUkhman/uwal/blob/main/src/lessons/${
        location.hash.slice(1)
    }/index.js`, "_blank");
}, false);

const runLesson = () => import(`./${location.hash.slice(1)}/index.js`);
addEventListener("hashchange", runLesson, false);
runLesson();
