import{U as i,C as d}from"./index-DEQUc6k7.js";var p=`struct VertexOutput\r
{\r
    @builtin(position) position: vec4f,\r
    @location(0) @interpolate(perspective, centroid) baryCoord: vec3f\r
};

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput\r
{\r
    let position = array(\r
        vec2f( 0.0,  0.5), 
        vec2f(-0.5, -0.5), 
        vec2f( 0.5, -0.5)  
    );

    let baryCoords = array(\r
        vec3f(1, 0, 0),\r
        vec3f(0, 1, 0),\r
        vec3f(0, 0, 1)\r
    );

    var output: VertexOutput;

    output.position = vec4f(position[index], 0.0, 1.0);\r
    output.baryCoord = baryCoords[index];

    return output;\r
}

@fragment fn fragment(\r
    
    @location(0) @interpolate(perspective, centroid) baryCoord: vec3f\r
) -> @location(0) vec4f\r
{\r
    return select(\r
        vec4f(1, 1, 0, 1),\r
        vec4f(1, 0, 0, 1),\r
        all(baryCoord >= vec3f(0)) &&\r
        all(baryCoord <= vec3f(1))\r
    );\r
}`;/**
 * @module Multisampling
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Multisampling
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-multisampling.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */(async function(r){let e;r.style.imageRendering="pixelated",r.style.imageRendering="crisp-edges";try{e=new(await i.RenderPipeline(r,"Multisampling"))}catch(n){alert(n)}const a=e.CreateMultisampleState(),c=e.CreateShaderModule(p);e.CreatePipeline({module:c,multisample:a});const t=e.CreateColorAttachment();t.clearValue=new d(5000268).rgba,e.CreatePassDescriptor(t);const o=new(await i.Texture());o.Renderer=e,new ResizeObserver(n=>{for(const l of n){const{inlineSize:s,blockSize:u}=l.contentBoxSize[0];e.SetCanvasSize(s/16|0,u/16|0,!1)}e.MultisampleTexture=o.CreateMultisampleTexture(),e.Render(3)}).observe(document.body)})(document.getElementById("lesson"));
