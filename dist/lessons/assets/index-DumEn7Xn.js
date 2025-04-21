import{U as q,F as ne,B as i}from"./index-DEQUc6k7.js";import{m as H}from"./wgpu-matrix.module-CrC5GWIH.js";import{Q as re}from"./Quad-D4MTv-Aj.js";var oe=`struct Matrix\r
{\r
    values: mat4x4f\r
};

struct VertexOutput\r
{\r
    @builtin(position) position: vec4f,\r
    @location(0) textureCoord: vec2f\r
};

@group(0) @binding(0) var Sampler: sampler;\r
@group(0) @binding(1) var<uniform> matrix: Matrix;\r
@group(0) @binding(2) var Texture: texture_2d<f32>;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput\r
{\r
    var output: VertexOutput;\r
    var position = GetQuadCoord(index);

    
    position = (position + 1) * 0.5;

    output.position = matrix.values * vec4f(position, 0.0, 1.0);\r
    output.textureCoord = position;

    return output;\r
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f\r
{\r
    return textureSample(Texture, Sampler, textureCoord);\r
}`;/**
 * @module Blend Settings
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Transparency and Blending
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html#blend-settings}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */(async function(C){let n;C.style.backgroundPosition="0 0, 0 16px, 16px -16px, -16px 0px",C.style.backgroundSize="32px 32px",C.style.backgroundColor="#404040",C.style.backgroundImage=`
        linear-gradient( 45deg,     #808080 25%, transparent 25%),
        linear-gradient(-45deg,     #808080 25%, transparent 25%),
        linear-gradient( 45deg, transparent 75%,     #808080 75%),
        linear-gradient(-45deg, transparent 75%,     #808080 75%)
    `;try{n=new(await q.RenderPipeline(C,"Blend Settings",{alphaMode:"premultiplied"}))}catch(e){alert(e)}const I=(e,t,r)=>`hsl(${e*360|0}, ${t*100}%, ${r*100|0}%)`,A=(e,t,r,o)=>`hsla${I(e,t,r).slice(3,-1)}, ${o})`;function J(e){const t=document.createElement("canvas");t.width=t.height=e;const r=t.getContext("2d");r.translate(e/2,e/2),r.globalCompositeOperation="screen";const o=Math.PI*2,a=3;for(let l=0;l<a;++l){r.rotate(o/a),r.save(),r.translate(e/6,0),r.beginPath();const u=e/3,X=l/a;r.arc(0,0,u,0,o);const E=r.createRadialGradient(0,0,u/2,0,0,u);E.addColorStop(.5,A(X,1,.5,1)),E.addColorStop(1,A(X,1,.5,0)),r.fillStyle=E,r.fill(),r.restore()}return t.style.position="absolute",t.style.height=`${e}px`,t.style.width=`${e}px`,t.style.left="8px",t.style.top="8px",t}function K(e){const t=document.createElement("canvas");t.width=t.height=e;const r=t.getContext("2d"),o=r.createLinearGradient(0,0,e,e);for(let a=0;a<=6;++a)o.addColorStop(a/6,I(a/-6,1,.5));r.fillStyle=o,r.fillRect(0,0,e,e),r.fillStyle="rgba(0, 0, 0, 255)",r.globalCompositeOperation="destination-out",r.rotate(Math.PI/-4);for(let a=0;a<e*2;a+=32)r.fillRect(-300,a,e*2,16);return t.style.position="absolute",t.style.height=`${e}px`,t.style.width=`${e}px`,t.style.left="8px",t.style.top="8px",t}function F(){const{values:e}=n.CreateUniformBufferLayout("matrix"),t=n.CreateBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:e.buffer.byteLength});return{values:e,buffer:t}}function h(e,t=!0){return N.CopyImageToTexture(e,{premultipliedAlpha:t,create:{usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,format:"rgba8unorm",mipmaps:!1}})}function c(e){typeof e=="string"&&!["constant","one-minus-constant"].includes(e)||(n.BlendConstant=[...b.color,b.alpha])}function y(){const{premultiply:e,alpha:t,color:r}=m,o=e&&t||1,[a,l,u]=r;f.clearValue[0]=a*o,f.clearValue[1]=l*o,f.clearValue[2]=u*o,f.clearValue[3]=t}function R(e){const{operation:t}=e;(t==="min"||t==="max")&&(e.srcFactor=e.dstFactor="one")}function D(e,t,r){const o=H.ortho(0,t.width,t.height,0,-1,1);H.scale(o,[r.width,r.height,1],e.values),n.WriteBuffer(e.buffer,e.values)}const N=new(await q.Texture(n)),B=n.CreateShaderModule([re,oe]),x=N.CreateSampler({filter:ne.LINEAR}),V=J(300),_=K(300),v=F(),G=F(),w=h(V),M=h(_),L=h(V,!1),$=h(_,!1),g=n.CreateBindGroupLayout([{visibility:GPUShaderStage.FRAGMENT,sampler:{}},{visibility:GPUShaderStage.VERTEX,buffer:{}},{visibility:GPUShaderStage.FRAGMENT,texture:{}}]);n.SetBindGroups([n.CreateBindGroup(n.CreateBindGroupEntries([x,{buffer:v.buffer},w.createView()]),g),n.CreateBindGroup(n.CreateBindGroupEntries([x,{buffer:G.buffer},M.createView()]),g),n.CreateBindGroup(n.CreateBindGroupEntries([x,{buffer:v.buffer},L.createView()]),g),n.CreateBindGroup(n.CreateBindGroupEntries([x,{buffer:G.buffer},$.createView()]),g)]);const Z=[{sourceBindGroup:0,destinationBindGroup:1,sourceTexture:w,destinationTexture:M},{sourceBindGroup:2,destinationBindGroup:3,sourceTexture:L,destinationTexture:$}],s=new GUI().onChange(W),S={textureSet:0,alphaMode:"premultiplied",preset:"Copy (Default)"};s.add(S,"alphaMode",["opaque","premultiplied"]).name("Canvas Alpha Mode").onChange(e=>n.ConfigureContext({alphaMode:e})),s.add(S,"textureSet",["premultiplied alpha","un-premultiplied alpha"]).name("Texture Set");const z=n.CreateBlendComponent("add","src-alpha","one-minus-src-alpha"),ee=n.CreateBlendComponent("add","src-alpha","one-minus-src-alpha"),k={"Copy (Default)":i.COPY,"Additive (Lighten)":i.ADDITIVE,"Un-premultiplied Blend":{color:z,alpha:ee},"Source Over (Premultiplied Blend)":i.SOURCE_OVER,"Destination Over":i.DESTINATION_OVER,"Source In":i.SOURCE_IN,"Destination In":i.DESTINATION_IN,"Source Out":i.SOURCE_OUT,"Destination Out":i.DESTINATION_OUT,"Source Atop":i.SOURCE_ATOP,"Destination Atop":i.DESTINATION_ATOP};s.add(S,"preset",Object.keys(k)).name("Blending Preset").onChange(e=>{const t=k[e];Object.assign(d,t.color),Object.assign(p,t.alpha)});const O=s.addFolder("Color"),d=n.CreateBlendComponent(),j=["add","subtract","reverse-subtract","min","max"],T=["zero","one","src","one-minus-src","src-alpha","one-minus-src-alpha","dst","one-minus-dst","dst-alpha","one-minus-dst-alpha","src-alpha-saturated","constant","one-minus-constant"];O.add(d,"operation",j).name("Operation"),O.add(d,"srcFactor",T).name("Source Factor").onChange(c),O.add(d,"dstFactor",T).name("Destination Factor").onChange(c);const P=s.addFolder("Alpha"),p=n.CreateBlendComponent();P.add(p,"operation",j).name("Operation"),P.add(p,"srcFactor",T).name("Source Factor").onChange(c),P.add(p,"dstFactor",T).name("Destination Factor").onChange(c);const Q=s.addFolder("Constant"),b={color:[1,.5,.25],alpha:1};Q.addColor(b,"color").name("Color").onChange(c),Q.add(b,"alpha",0,1).name("Alpha").onChange(c);const U=s.addFolder("Canvas Clear Color"),m={color:[0,0,0],alpha:0,premultiply:!0};U.addColor(m,"color").name("Color").onChange(y),U.add(m,"alpha",0,1).name("Alpha").onChange(y),U.add(m,"premultiply").name("Premultiply").onChange(y);const f=n.CreateColorAttachment();f.clearValue=[...m.color,m.alpha];const Y=n.CreatePipelineLayout(g);n.CreatePassDescriptor(f),n.CreatePipeline({module:B,layout:Y});const te=n.CreateVertexState(B);function W(){R(d),R(p),s.updateDisplay();const{sourceTexture:e,destinationTexture:t,destinationBindGroup:r,sourceBindGroup:o}=Z[S.textureSet],a=n.CurrentTexture;D(v,a,e),D(G,a,t),n.SetActiveBindGroups(r),n.Render(6,!1),n.SavePipelineState();const l=n.CreateTargetState(void 0,{color:d,alpha:p}),u=n.CreateFragmentState(B,void 0,l);n.CreatePipeline({vertex:te,fragment:u,layout:Y},!0),n.SetActiveBindGroups(o),n.Render(6),n.RestorePipelineState()}new ResizeObserver(e=>{for(const t of e){const{inlineSize:r,blockSize:o}=t.contentBoxSize[0];n.SetCanvasSize(r,o)}W()}).observe(document.body)})(document.getElementById("lesson"));
