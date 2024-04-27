import{U as r}from"./UWAL--isRfizI.js";var h="struct VertexOutput{@builtin(position)position: vec4f};@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {let position=array(vec2f(0.0,0.5),vec2f(-0.5,-0.5),vec2f(0.5,-0.5));var output: VertexOutput;output.position=vec4f(position[index],0.0,1.0);return output;}",g="@fragment fn fragment(@builtin(position)position: vec4f)->@location(0)vec4f {let red=vec4f(1,0,0,1);let cyan=vec4f(0,1,1,1);let grid=vec2u(position.xy)/8;let checker=(grid.x+grid.y)% 2==1;return select(red,cyan,checker);}";/**
 * @module Inter-stage Variables
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Inter-stage Variables
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.2
 * @license MIT
 */(async function(t){let e;try{e=new(await r.RenderPipeline(t,"Checkerboard Triangle Encoder"))}catch(n){alert(n)}const i=e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1]),o=e.CreateRenderPassDescriptor([i],"Checkerboard Triangle Render Pass"),a=e.CreateShaderModule(h,"Triangle Shader"),c=e.CreateShaderModule(g,"Checkerboard Shader"),d=e.CreateVertexState(a),l=e.CreateFragmentState(c),s=e.CreateRenderPipeline({label:"Checkerboard Triangle Pipeline",vertex:d,fragment:l});function u(){r.SetCanvasSize(t.width,t.height),o.colorAttachments[0].view=r.CurrentTextureView,e.Render(o,s,3)}new ResizeObserver(n=>{for(const f of n){const{inlineSize:v,blockSize:p}=f.contentBoxSize[0];r.SetCanvasSize(v,p)}u()}).observe(t)})(document.getElementById("lesson"));
