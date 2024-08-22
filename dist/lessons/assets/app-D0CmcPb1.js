const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-OkiciZLD.js","./index-CCGyEPzO.js","./wgpu-matrix.module-CNlPNSC1.js","./index-BIvw2fA2.js","./index-B8yXiJWZ.js","./GPUMipmaps-Sf4roZHW.js","./f-CdSZvatx.js","./Color-DBk-POdu.js","./Quad-VFYOTGYq.js","./index-Dv8FfOQp.js","./Triangle.vert-Y1l3LntC.js","./index-_GJPmqKX.js","./index-NOnwK-oW.js","./index-VYC4_sZl.js","./index-UGk3o3SI.js","./mipmaps-kMQ0t0FP.js","./index-BPko-tmV.js","./index-B1JpPcOc.js","./index-f2FDMmqw.js","./index-B20zwmRW.js","./index-h6Xx5q6d.js","./index-dKuxcdAn.js","./index-CPBzOnHl.js","./index-B06VYmuQ.js","./index-BUnfGKZK.js"])))=>i.map(i=>d[i]);
(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}})();const v="modulepreload",h=function(a,o){return new URL(a,o).href},p={},r=function(o,n,s){let e=Promise.resolve();if(n&&n.length>0){const t=document.getElementsByTagName("link"),i=document.querySelector("meta[property=csp-nonce]"),_=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));e=Promise.all(n.map(l=>{if(l=h(l,s),l in p)return;p[l]=!0;const m=l.endsWith(".css"),E=m?'[rel="stylesheet"]':"";if(!!s)for(let c=t.length-1;c>=0;c--){const d=t[c];if(d.href===l&&(!m||d.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${E}`))return;const u=document.createElement("link");if(u.rel=m?"stylesheet":v,m||(u.as="script",u.crossOrigin=""),u.href=l,_&&u.setAttribute("nonce",_),document.head.appendChild(u),m)return new Promise((c,d)=>{u.addEventListener("load",c),u.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${l}`)))})}))}return e.then(()=>o()).catch(t=>{const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=t,window.dispatchEvent(i),!i.defaultPrevented)throw t})},g=(a,o,n)=>{const s=a[o];return s?typeof s=="function"?s():Promise.resolve(s):new Promise((e,t)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(t.bind(null,new Error("Unknown variable dynamic import: "+o+(o.split("/").length!==n?". Note that variables only represent file names one level deep.":""))))})},L=document.title;document.getElementById("code").addEventListener("click",()=>{window.open(`https://github.com/UstymUkhman/uwal/blob/main/src/lessons/${location.hash.slice(1)}/index.js`,"_blank")},!1);function f(){const a=location.hash.slice(1),o=a.split("-").map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" ");g(Object.assign({"./cubemaps/index.js":()=>r(()=>import("./index-OkiciZLD.js"),__vite__mapDeps([0,1,2]),import.meta.url),"./fundamentals/index.js":()=>r(()=>import("./index-BIvw2fA2.js"),__vite__mapDeps([3,1]),import.meta.url),"./gpu-mipmaps/index.js":()=>r(()=>import("./index-B8yXiJWZ.js"),__vite__mapDeps([4,1,5,2,6,7,8]),import.meta.url),"./inter-stage-variables/index.js":()=>r(()=>import("./index-Dv8FfOQp.js"),__vite__mapDeps([9,1,10]),import.meta.url),"./loading-canvas/index.js":()=>r(()=>import("./index-_GJPmqKX.js"),__vite__mapDeps([11,1,5,2,7,8]),import.meta.url),"./loading-images/index.js":()=>r(()=>import("./index-NOnwK-oW.js"),__vite__mapDeps([12,1,6,7,8]),import.meta.url),"./loading-video/index.js":()=>r(()=>import("./index-VYC4_sZl.js"),__vite__mapDeps([13,1,5,2,7,8]),import.meta.url),"./mipmap-filter/index.js":()=>r(()=>import("./index-UGk3o3SI.js"),__vite__mapDeps([14,15,1,2,7,8]),import.meta.url),"./multisampling/index.js":()=>r(()=>import("./index-BPko-tmV.js"),__vite__mapDeps([16,1,7]),import.meta.url),"./shader-constants/index.js":()=>r(()=>import("./index-B1JpPcOc.js"),__vite__mapDeps([17,1,7]),import.meta.url),"./storage-buffers/index.js":()=>r(()=>import("./index-f2FDMmqw.js"),__vite__mapDeps([18,1]),import.meta.url),"./storage-textures/index.js":()=>r(()=>import("./index-B20zwmRW.js"),__vite__mapDeps([19,1]),import.meta.url),"./textures/index.js":()=>r(()=>import("./index-h6Xx5q6d.js"),__vite__mapDeps([20,1,15,7,8]),import.meta.url),"./transparency/index.js":()=>r(()=>import("./index-dKuxcdAn.js"),__vite__mapDeps([21,1,10,7]),import.meta.url),"./uniforms/index.js":()=>r(()=>import("./index-CPBzOnHl.js"),__vite__mapDeps([22,1]),import.meta.url),"./using-video/index.js":()=>r(()=>import("./index-B06VYmuQ.js"),__vite__mapDeps([23,1,2,7,8]),import.meta.url),"./vertex-buffers/index.js":()=>r(()=>import("./index-BUnfGKZK.js"),__vite__mapDeps([24,1]),import.meta.url)}),`./${a}/index.js`,3),document.title=`${L} | ${o}`}addEventListener("hashchange",f,!1);f();
