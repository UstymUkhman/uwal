import{D as i,C as d}from"./index-Dm8t6IxS.js";var p="struct VertexOutput{@builtin(position)position: vec4f,@location(0)@interpolate(perspective,centroid)baryCoord: vec3f};@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {let position=array(vec2f(0.0,0.5),vec2f(-0.5,-0.5),vec2f(0.5,-0.5));let baryCoords=array(vec3f(1,0,0),vec3f(0,1,0),vec3f(0,0,1));var output: VertexOutput;output.position=vec4f(position[index],0.0,1.0);output.baryCoord=baryCoords[index];return output;}@fragment fn fragment(@location(0)@interpolate(perspective,centroid)baryCoord: vec3f)->@location(0)vec4f{return select(vec4f(1,1,0,1),vec4f(1,0,0,1),all(baryCoord>=vec3f(0))&&all(baryCoord<=vec3f(1)));}";/**
 * @module Multisampling
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Multisampling
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-multisampling.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */(async function(t){let e;t.style.imageRendering="pixelated",t.style.imageRendering="crisp-edges";try{e=new(await i.RenderPipeline(t,"Multisampling"))}catch(r){alert(r)}const a=e.CreateMultisampleState(),c=e.CreateShaderModule(p);e.CreatePipeline({module:c,multisample:a});const o=e.CreateColorAttachment();o.clearValue=new d(5000268).rgba,e.CreatePassDescriptor(o);const n=new(await i.Texture());n.Renderer=e,new ResizeObserver(r=>{for(const l of r){const{inlineSize:s,blockSize:u}=l.contentBoxSize[0];e.SetCanvasSize(s/16|0,u/16|0,!1)}e.MultisampleTexture=n.CreateMultisampleTexture(),e.Render(3)}).observe(document.body)})(document.getElementById("lesson"));
