import{U as p}from"./index-C-mw7MEB.js";import{S as x,a as F}from"./Shape-BaLWF4xF.js";var P="@fragment fn shapeFragment()->@location(0)vec4f {return shape.color;}";const v=`${x}

${P}`;/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */let f,m;async function z(s){let r;try{r=new(await p.RenderPipeline(s,"2D Shapes"))}catch(e){alert(e)}const u=[],d=[],c=[],h=[],C=r.CreatePassDescriptor(r.CreateColorAttachment(void 0,"clear","store",[.2,.1,.3,1])),S=r.CreateShaderModule(v);r.CreatePipeline({fragment:r.CreateFragmentState(S,"shapeFragment"),vertex:r.CreateVertexState(S,"shapeVertex",[{arrayStride:Float32Array.BYTES_PER_ELEMENT*2,attributes:[r.CreateVertexBufferAttribute("float32x2")]}])});function w(){u.splice(0),d.splice(0),c.splice(0),h.splice(0),cancelAnimationFrame(f)}function y(){A(),f=requestAnimationFrame(g)}function A(){for(let e=3;e<=12;e++){const i=e===11&&64||e;for(let t=0;t<2;t++){const n=o(50,100),l=n*o(.75,.95),a=new F({innerRadius:l*t,renderer:r,segments:i,radius:n});a.Position=[o(n,s.width-n),o(n,s.height-n)],a.Rotation=o(Math.PI*2),d.push(o(1,10)),u.push(o(.1)),c.push(a),h.push([o(-1,1),o(-1,1)]),a.Color=[o(.3,1),o(.2,1),o(.4,1),1]}}}function o(e,i){return e===void 0?(e=0,i=1):i===void 0&&(i=e,e=0),Math.random()*(i-e)+e}function g(){f=requestAnimationFrame(g),C.colorAttachments[0].view=r.CurrentTextureView,c.forEach(e=>r.Render(e.Update().Vertices,!1));for(let e=0,i=c.length;e<i;e++){const t=c[e],n=h[e],{min:l,max:a}=t.BoundingBox,[R,b]=t.Position;(l[0]<=0||a[0]>=s.width)&&(n[0]*=-1),(l[1]<=0||a[1]>=s.height)&&(n[1]*=-1),t.Rotation+=u[e],t.Position=[R+n[0]*d[e],b+n[1]*d[e]]}r.Submit()}m=new ResizeObserver(e=>{for(const i of e){let{inlineSize:t,blockSize:n}=i.contentBoxSize[0];t=t<=960&&t||t-240,r.SetCanvasSize(t,n)}w(),y()}),m.observe(document.body)}function B(){p.OnDeviceLost=()=>{},cancelAnimationFrame(f),m.disconnect(),p.Destroy()}export{B as destroy,z as run};
