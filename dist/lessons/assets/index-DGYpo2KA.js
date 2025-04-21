import{U as v,C as l}from"./index-DEQUc6k7.js";var f=`override RED: f32;             
@id(123) override GREEN = 0.0; 
override BLUE = 1.0;           

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f
{
    let position = array(
        vec2f( 0.0,  0.5), 
        vec2f(-0.5, -0.5), 
        vec2f( 0.5, -0.5)  
    );

    return vec4f(position[index], 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(RED, GREEN, BLUE, 1.0);
}`;/**
 * @module Shader Constants
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Shader Constants
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-constants.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */(async function(o){let e;try{e=new(await v.RenderPipeline(o,"Shader Constants"))}catch(n){alert(n)}const r=e.CreateShaderModule(f),a=e.CreateVertexState(r),i=e.CreateFragmentState(r,void 0,void 0,{RED:1,123:.5});e.CreatePipeline({vertex:a,fragment:i});const t=e.CreateColorAttachment();t.clearValue=new l(5000268).rgba,e.CreatePassDescriptor(t),new ResizeObserver(n=>{for(const c of n){const{inlineSize:s,blockSize:d}=c.contentBoxSize[0];e.SetCanvasSize(s,d)}e.Render(3)}).observe(document.body)})(document.getElementById("lesson"));
