import{D as a}from"./index-CTlcc_oC.js";import{Q as S}from"./Quad-CxPJkP3V.js";var x=`struct Screen\r
{\r
    color: vec3f,\r
    time: f32\r
};

struct VertexOutput\r
{\r
    @location(0) coord: vec2f,\r
    @builtin(position) position: vec4f\r
};

@group(0) @binding(0) var<uniform> screen: Screen;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput\r
{\r
    var output: VertexOutput;\r
    let coord = GetQuadCoord(index);

    output.position = vec4f(coord, 0, 1);\r
    output.coord = coord;

    return output;\r
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f\r
{\r
    return vec4f(cos(coord.xyx + screen.time) * 0.2 + screen.color + 0.4, 1);\r
}`;/**
 * @example Screen Shader
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by OGL's "Triangle Screen Shader"
 * {@link https://oframe.github.io/ogl/examples/?src=triangle-screen-shader.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */let r,o,c,e;async function y(f){try{e=new(await a.RenderPipeline(f,"Screen Shader"))}catch(t){alert(t)}const l=e.CreatePassDescriptor(e.CreateColorAttachment()),u=e.CreateShaderModule([S,x]);e.CreatePipeline({vertex:e.CreateVertexState(u),fragment:e.CreateFragmentState(u)});const s=Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*3;r=e.CreateBuffer({size:s,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const m=e.CreateBindGroup(e.CreateBindGroupEntries({buffer:r}));e.SetBindGroups(m);const i=new Float32Array(s/Float32Array.BYTES_PER_ELEMENT);i.set([0,.3515625,.609375]);function d(t){o=requestAnimationFrame(d),i.set([t*.001],3),l.colorAttachments[0].view=e.CurrentTextureView,e.WriteBuffer(r,i),e.Render(6)}c=new ResizeObserver(t=>{for(const p of t){let{inlineSize:n,blockSize:v}=p.contentBoxSize[0];n=n<=960&&n||n-240,e.SetCanvasSize(n,v)}cancelAnimationFrame(o),o=requestAnimationFrame(d)}),c.observe(document.body)}function B(){a.OnDeviceLost=()=>{},r==null||r.destroy(),cancelAnimationFrame(o),c.disconnect(),e.Destroy(),a.Destroy()}export{B as destroy,y as run};
