import{U as d,C as l}from"./index-CDSOL_j-.js";var f="override RED: f32;@id(123)override GREEN=0.0;override BLUE=1.0;@vertex fn vertex(@builtin(vertex_index)index: u32)->@builtin(position)vec4f {let position=array(vec2f(0.0,0.5),vec2f(-0.5,-0.5),vec2f(0.5,-0.5));return vec4f(position[index],0.0,1.0);}@fragment fn fragment()->@location(0)vec4f {return vec4f(RED,GREEN,BLUE,1.0);}";/**
 * @module Shader Constants
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Shader Constants
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-constants.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */(async function(t){let e;try{e=new(await d.RenderPipeline(t,"Shader Constants"))}catch(r){alert(r)}const n=e.CreateShaderModule(f),i=e.CreateVertexState(n),a=e.CreateFragmentState(n,void 0,void 0,{RED:1,123:.5});e.CreatePipeline({vertex:i,fragment:a});const o=e.CreateColorAttachment();o.clearValue=new l(5000268).rgba,e.CreatePassDescriptor(o),new ResizeObserver(r=>{for(const c of r){const{inlineSize:s,blockSize:v}=c.contentBoxSize[0];e.SetCanvasSize(s,v)}e.Render(3)}).observe(t)})(document.getElementById("lesson"));
