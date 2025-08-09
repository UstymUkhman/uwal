import{D as b,C as s}from"./index-BEuvW3M9.js";import{T as m}from"./Triangle.vert-Y1l3LntC.js";var y="@fragment fn fragment(@builtin(position)position: vec4f)->@location(0)vec4f {let cyan=vec4f(0,1,1,1);let grid=vec2u(position.xy)/8;let checker=(grid.x+grid.y)% 2==1;if(checker){discard;}return cyan;}";/**
 * @module Transparency and Blending
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Transparency and Blending
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */(async function(r){let e;r.style.backgroundPosition="0 0, 0 16px, 16px -16px, -16px 0px",r.style.backgroundSize="32px 32px",r.style.backgroundColor="#404040",r.style.backgroundImage=`
        linear-gradient( 45deg,     #808080 25%, transparent 25%),
        linear-gradient(-45deg,     #808080 25%, transparent 25%),
        linear-gradient( 45deg, transparent 75%,     #808080 75%),
        linear-gradient(-45deg, transparent 75%,     #808080 75%)
    `;try{e=new(await b.RenderPipeline(r,"Transparency",{alphaMode:"premultiplied"}))}catch(n){alert(n)}const p=new s,t=new s(0,0,0,0),a=e.CreateColorAttachment(),g=e.CreateShaderModule([m,y]);a.clearValue=t.rgba,e.CreatePassDescriptor(a),e.CreatePipeline({module:g});const o={color:t.rgb,premultiply:!0,alpha:0},l=new GUI().onChange(d);l.add(o,"premultiply"),l.add(o,"alpha",0,1),l.addColor(o,"color");function d(){const{color:n,premultiply:i,alpha:c}=o;t.rgb=n,a.clearValue=i?t.Premultiply(c,p).rgba:t.rgba,e.Render(3)}new ResizeObserver(n=>{for(const i of n){const{inlineSize:c,blockSize:u}=i.contentBoxSize[0];e.SetCanvasSize(c,u)}d()}).observe(document.body)})(document.getElementById("lesson"));
