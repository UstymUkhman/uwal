const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-DYqp5RaQ.js","./index-D5rMI4n5.js","./wgpu-matrix.module-BCZfl02X.js","./index-DDtEo07s.js","./index-D3GVEpAp.js","./GPUMipmaps-Sf4roZHW.js","./f-CdSZvatx.js","./Quad-BFiS1mN9.js","./index-DuoewIxJ.js","./index-uVn9dOVn.js","./index-DkvuAiEM.js","./index-D7-zdXXP.js","./index-Dpqu4Me-.js","./mipmaps-kMQ0t0FP.js","./index-pbTX62_f.js","./index-CKGzpzLm.js","./index-DnPbjst5.js","./index-BbwLl1Aw.js","./index-Bgcgx8l6.js"])))=>i.map(i=>d[i]);
(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function u(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=u(e);fetch(e.href,t)}})();const v="modulepreload",h=function(a,o){return new URL(a,o).href},f={},i=function(o,u,n){let e=Promise.resolve();if(u&&u.length>0){const t=document.getElementsByTagName("link"),r=document.querySelector("meta[property=csp-nonce]"),_=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));e=Promise.all(u.map(s=>{if(s=h(s,n),s in f)return;f[s]=!0;const c=s.endsWith(".css"),E=c?'[rel="stylesheet"]':"";if(!!n)for(let m=t.length-1;m>=0;m--){const d=t[m];if(d.href===s&&(!c||d.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${s}"]${E}`))return;const l=document.createElement("link");if(l.rel=c?"stylesheet":v,c||(l.as="script",l.crossOrigin=""),l.href=s,_&&l.setAttribute("nonce",_),document.head.appendChild(l),c)return new Promise((m,d)=>{l.addEventListener("load",m),l.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${s}`)))})}))}return e.then(()=>o()).catch(t=>{const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=t,window.dispatchEvent(r),!r.defaultPrevented)throw t})},g=(a,o,u)=>{const n=a[o];return n?typeof n=="function"?n():Promise.resolve(n):new Promise((e,t)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(t.bind(null,new Error("Unknown variable dynamic import: "+o+(o.split("/").length!==u?". Note that variables only represent file names one level deep.":""))))})};document.getElementById("code").addEventListener("click",()=>{window.open(`https://github.com/UstymUkhman/uwal/blob/main/src/lessons/${location.hash.slice(1)}/index.js`,"_blank")},!1);const p=()=>g(Object.assign({"./cubemaps/index.js":()=>i(()=>import("./index-DYqp5RaQ.js"),__vite__mapDeps([0,1,2]),import.meta.url),"./fundamentals/index.js":()=>i(()=>import("./index-DDtEo07s.js"),__vite__mapDeps([3,1]),import.meta.url),"./gpu-mipmaps/index.js":()=>i(()=>import("./index-D3GVEpAp.js"),__vite__mapDeps([4,1,5,2,6,7]),import.meta.url),"./inter-stage-variables/index.js":()=>i(()=>import("./index-DuoewIxJ.js"),__vite__mapDeps([8,1]),import.meta.url),"./loading-canvas/index.js":()=>i(()=>import("./index-uVn9dOVn.js"),__vite__mapDeps([9,1,5,2,7]),import.meta.url),"./loading-images/index.js":()=>i(()=>import("./index-DkvuAiEM.js"),__vite__mapDeps([10,1,6,7]),import.meta.url),"./loading-video/index.js":()=>i(()=>import("./index-D7-zdXXP.js"),__vite__mapDeps([11,1,5,2,7]),import.meta.url),"./mipmap-filter/index.js":()=>i(()=>import("./index-Dpqu4Me-.js"),__vite__mapDeps([12,13,1,2,7]),import.meta.url),"./storage-buffers/index.js":()=>i(()=>import("./index-pbTX62_f.js"),__vite__mapDeps([14,1]),import.meta.url),"./textures/index.js":()=>i(()=>import("./index-CKGzpzLm.js"),__vite__mapDeps([15,1,13,7]),import.meta.url),"./uniforms/index.js":()=>i(()=>import("./index-DnPbjst5.js"),__vite__mapDeps([16,1]),import.meta.url),"./using-video/index.js":()=>i(()=>import("./index-BbwLl1Aw.js"),__vite__mapDeps([17,1,2,7]),import.meta.url),"./vertex-buffers/index.js":()=>i(()=>import("./index-Bgcgx8l6.js"),__vite__mapDeps([18,1]),import.meta.url)}),`./${location.hash.slice(1)}/index.js`,3);addEventListener("hashchange",p,!1);p();