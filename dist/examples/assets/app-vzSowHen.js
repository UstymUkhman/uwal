const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-B29DjgcV.js","./index-DyK24pA6.js","./Shape-Cw7KHeMB.js","./index-Du8J9WAO.js","./index-BDK3aB9A.js","./Quad-VFYOTGYq.js","./index-F1i-6acR.js","./index-CcAFLfH4.js"])))=>i.map(i=>d[i]);
(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function l(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=l(e);fetch(e.href,t)}})();const P="modulepreload",O=function(o,n){return new URL(o,n).href},g={},p=function(n,l,s){let e=Promise.resolve();if(l&&l.length>0){const t=document.getElementsByTagName("link"),i=document.querySelector("meta[property=csp-nonce]"),L=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));e=Promise.all(l.map(a=>{if(a=O(a,s),a in g)return;g[a]=!0;const u=a.endsWith(".css"),b=u?'[rel="stylesheet"]':"";if(!!s)for(let f=t.length-1;f>=0;f--){const h=t[f];if(h.href===a&&(!u||h.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${a}"]${b}`))return;const c=document.createElement("link");if(c.rel=u?"stylesheet":P,u||(c.as="script",c.crossOrigin=""),c.href=a,L&&c.setAttribute("nonce",L),document.head.appendChild(c),u)return new Promise((f,h)=>{c.addEventListener("load",f),c.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${a}`)))})}))}return e.then(()=>n()).catch(t=>{const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=t,window.dispatchEvent(i),!i.defaultPrevented)throw t})},T=(o,n,l)=>{const s=o[n];return s?typeof s=="function"?s():Promise.resolve(s):new Promise((e,t)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(t.bind(null,new Error("Unknown variable dynamic import: "+n+(n.split("/").length!==l?". Note that variables only represent file names one level deep.":""))))})},_=[{name:"Screen Shader",slug:"screen-shader"},{name:"Game Of Life",slug:"game-of-life"},{name:"2D Shapes",slug:"2d-shapes"},{name:"Textures / Instancing",slug:"textures-instancing"},{name:"Video Color Grading",slug:"video-color-grading"}];let r=null,E=()=>{};const y=document.title,m=document.getElementsByClassName("examples")[0],w=document.getElementById("example"),d=document.getElementById("examples"),v=document.getElementById("code");function I(){const o="examples.html",n=_.map(({name:l,slug:s})=>{const e=document.createElement("a");return e.href=`${o}#${s}`,e.dataset.example=s,e.textContent=l,e.title=l,e});document.getElementById("list").append(...n)}async function x(){const o=innerWidth<=960,n=location.hash.slice(1);if(n===(r==null?void 0:r.dataset.example))return d.innerHTML="&#62;",v.classList.remove("hidden"),r==null||r.classList.add("active"),d.classList.remove("hidden"),o&&m.classList.add("hidden");if(!n)return document.title=y,m.classList.remove("hidden"),d.innerHTML="&#60;",d.classList.add("hidden"),r==null||r.classList.remove("active"),v.classList.add("hidden");E();const{name:l}=_.find(({slug:i})=>n===i),s=document.querySelector(`a[data-example="${n}"]`),{run:e,destroy:t}=await T(Object.assign({"./2d-shapes/index.js":()=>p(()=>import("./index-B29DjgcV.js"),__vite__mapDeps([0,1,2]),import.meta.url),"./game-of-life/index.js":()=>p(()=>import("./index-Du8J9WAO.js"),__vite__mapDeps([3,1]),import.meta.url),"./screen-shader/index.js":()=>p(()=>import("./index-BDK3aB9A.js"),__vite__mapDeps([4,1,5]),import.meta.url),"./textures-instancing/index.js":()=>p(()=>import("./index-F1i-6acR.js"),__vite__mapDeps([6,1,2]),import.meta.url),"./video-color-grading/index.js":()=>p(()=>import("./index-CcAFLfH4.js"),__vite__mapDeps([7,1,5]),import.meta.url)}),`./${n}/index.js`,3);document.title=`${y} | ${l}`,d.classList.remove("hidden"),r==null||r.classList.remove("active"),o&&m.classList.add("hidden"),v.classList.remove("hidden"),d.innerHTML="&#62;",s==null||s.classList.add("active"),r=s||null,E=t,e(w)}d.addEventListener("click",()=>{const o=m.classList.toggle("hidden");d.innerHTML=`&#6${+o*2};`},!1);v.addEventListener("click",()=>{open(`https://github.com/UstymUkhman/uwal/blob/main/src/examples/${location.hash.slice(1)}/index.js`,"_blank")},!1);addEventListener("resize",()=>{location.hash.slice(1)&&(innerWidth>960?m.classList.remove("hidden"):(d.innerHTML="&#62;",m.classList.add("hidden")))},!1);addEventListener("hashchange",x,!1);I();x();
