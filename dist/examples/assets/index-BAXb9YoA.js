import{U as i}from"./index-B6aSTZ5l.js";import{Q as S}from"./Quad-D4MTv-Aj.js";var x=`struct Screen
{
    color: vec3f,
    time: f32
};

struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> screen: Screen;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    let coord = GetQuadCoord(index);

    output.position = vec4f(coord, 0, 1);
    output.coord = coord;

    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    return vec4f(cos(coord.xyx + screen.time) * 0.2 + screen.color + 0.4, 1);
}`;/**
 * @example Screen Shader
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by OGL's "Triangle Screen Shader"
 * {@link https://oframe.github.io/ogl/examples/?src=triangle-screen-shader.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */let r,o,c,e;async function y(f){try{e=new(await i.RenderPipeline(f,"Screen Shader"))}catch(t){alert(t)}const l=e.CreatePassDescriptor(e.CreateColorAttachment()),u=e.CreateShaderModule([S,x]);e.CreatePipeline({vertex:e.CreateVertexState(u),fragment:e.CreateFragmentState(u)});const s=Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*3;r=e.CreateBuffer({size:s,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const m=e.CreateBindGroup(e.CreateBindGroupEntries({buffer:r}));e.SetBindGroups(m);const a=new Float32Array(s/Float32Array.BYTES_PER_ELEMENT);a.set([0,.3515625,.609375]);function d(t){o=requestAnimationFrame(d),a.set([t*.001],3),l.colorAttachments[0].view=e.CurrentTextureView,e.WriteBuffer(r,a),e.Render(6)}c=new ResizeObserver(t=>{for(const p of t){let{inlineSize:n,blockSize:v}=p.contentBoxSize[0];n=n<=960&&n||n-240,e.SetCanvasSize(n,v)}cancelAnimationFrame(o),o=requestAnimationFrame(d)}),c.observe(document.body)}function A(){i.OnDeviceLost=()=>{},r==null||r.destroy(),cancelAnimationFrame(o),c.disconnect(),e.Destroy(),i.Destroy()}export{A as destroy,y as run};
