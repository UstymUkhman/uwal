import{U as p}from"./index-Dlk0Bfe3.js";import{S as P,a as b}from"./Shape-B5XPSsSu.js";var v="@fragment fn fragment()->@location(0)vec4f {return shape.color;}";const E=`${P}

${v}`;/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */let d,m;async function z(s){let t;try{t=new(await p.RenderPipeline(s,"2D Shapes"))}catch(e){alert(e)}const u=[],f=[],c=[],h=[],g=t.CreatePassDescriptor(t.CreateColorAttachment(void 0,"clear","store",[.2,.1,.3,1])),S=t.CreateShaderModule(E);t.CreatePipeline({fragment:t.CreateFragmentState(S),vertex:t.CreateVertexState(S,"vertex",[{arrayStride:Float32Array.BYTES_PER_ELEMENT*2,attributes:[t.CreateVertexBufferAttribute("float32x2")]}])});function A(){u.splice(0),f.splice(0),c.splice(0),h.splice(0),cancelAnimationFrame(d)}function R(){w(),d=requestAnimationFrame(C)}function w(){for(let e=3;e<=12;e++){const o=e===11&&64||e;for(let i=0;i<2;i++){const r=n(50,100),l=r*n(.75,.95),a=new b({innerRadius:l*i,renderer:t,segments:o,radius:r});a.Position=[n(r,s.width-r),n(r,s.height-r)],a.Rotation=n(Math.PI*2),f.push(n(1,10)),u.push(n(.1)),c.push(a),h.push([n(-1,1),n(-1,1)]),a.Color=[n(.3,1),n(.2,1),n(.4,1),1]}}}function n(e,o){return e===void 0?(e=0,o=1):o===void 0&&(o=e,e=0),Math.random()*(o-e)+e}function C(){d=requestAnimationFrame(C),g.colorAttachments[0].view=t.CurrentTextureView,c.forEach(e=>t.Render(e.Update().Vertices,!1));for(let e=0,o=c.length;e<o;e++){const i=c[e],r=h[e],{min:l,max:a}=i.BoundingBox,[x,y]=i.Position;(l[0]<=0||a[0]>=s.width)&&(r[0]*=-1),(l[1]<=0||a[1]>=s.height)&&(r[1]*=-1),i.Rotation+=u[e],i.Position=[x+r[0]*f[e],y+r[1]*f[e]]}t.Submit()}m=new ResizeObserver(e=>{for(const o of e){const{inlineSize:i,blockSize:r}=o.contentBoxSize[0];t.SetCanvasSize(i,r)}A(),R()}),m.observe(s)}function B(){p.OnDeviceLost=()=>{},cancelAnimationFrame(d),m.disconnect(),p.Destroy()}export{B as destroy,z as run};
