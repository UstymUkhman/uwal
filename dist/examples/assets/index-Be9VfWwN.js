import{D as g}from"./index-CTlcc_oC.js";var D=`struct VertexOutput\r
{\r
    @location(0) cell: vec2f,\r
    @builtin(position) position: vec4f\r
};

@group(0) @binding(0) var<uniform> grid: vec2f;\r
@group(0) @binding(1) var<storage> state: array<u32>;

@vertex fn vertex(\r
    @location(0) position: vec2f,\r
    @builtin(instance_index) instance: u32\r
) -> VertexOutput\r
{\r
    let fInstance = f32(instance);\r
    let state = f32(state[instance]);\r
    let cell = vec2f(fInstance % grid.x, floor(fInstance / grid.x));

    var output: VertexOutput;

    output.position = vec4f(\r
        (position * state + 1) / grid - 1 +\r
        cell / grid * 2,\r
        0, 1\r
    );

    output.cell = cell;\r
    return output;\r
}

@fragment fn fragment(@location(0) cell: vec2f) -> @location(0) vec4f\r
{\r
    let rg = cell / grid;\r
    return vec4f(rg, 1 - rg.g, 1);\r
}`,M=`@group(0) @binding(0) var<uniform> grid: vec2f;\r
@group(0) @binding(1) var<storage> cellStateIn: array<u32>;\r
@group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

fn cellIndex(cell: vec2u) -> u32\r
{\r
    return (cell.x % u32(grid.x)) + (cell.y % u32(grid.y)) * u32(grid.x);\r
}

fn cellActive(x: u32, y: u32) -> u32\r
{\r
    return cellStateIn[cellIndex(vec2(x, y))];\r
}

@compute @workgroup_size(8, 8)\r
fn compute(@builtin(global_invocation_id) cell: vec3u)\r
{\r
    let activeNeighbors =\r
        cellActive(cell.x + 1, cell.y + 1) +\r
        cellActive(cell.x + 1, cell.y    ) +\r
        cellActive(cell.x + 1, cell.y - 1) +\r
        cellActive(cell.x    , cell.y - 1) +\r
        cellActive(cell.x - 1, cell.y - 1) +\r
        cellActive(cell.x - 1, cell.y    ) +\r
        cellActive(cell.x - 1, cell.y + 1) +\r
        cellActive(cell.x    , cell.y + 1);

    let i = cellIndex(cell.xy);

    switch activeNeighbors\r
    {\r
        case 2: { cellStateOut[i] = cellStateIn[i]; }\r
        case 3: { cellStateOut[i] = 1; }\r
        default: { cellStateOut[i] = 0; }\r
    }\r
}`;/**
 * @example Game Of Life
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by Google Codelabs "Your first WebGPU app"
 * {@link https://codelabs.developers.google.com/your-first-webgpu-app}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */let s,h,d,l,o,u,e,r;async function V(U){try{e=new(await g.RenderPipeline(U,"Game Of Life Render")),r=new(await g.ComputePipeline("Game Of Life Compute"))}catch(t){alert(t)}const f=[],B=8,p=250;let v,y=0,S=performance.now()-p;const O=e.CreatePassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[0,0,.4,1])),C=r.CreateBindGroupLayout([{buffer:{type:"uniform"},visibility:GPUShaderStage.COMPUTE|GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT},{buffer:{type:"read-only-storage"},visibility:GPUShaderStage.COMPUTE|GPUShaderStage.VERTEX},{buffer:{type:"storage"},visibility:GPUShaderStage.COMPUTE}]),G=e.CreateShaderModule(D),E=e.CreateFragmentState(G),R=e.CreateVertexState(G,"vertex",{attributes:[e.CreateVertexBufferAttribute("float32x2")],arrayStride:8}),P=r.CreatePipelineLayout(C),w=r.CreateShaderModule(M);e.CreatePipeline({layout:P,vertex:R,fragment:E}),r.CreatePipeline({layout:P,module:w});const m=new Float32Array([-.8,-.8,.8,-.8,.8,.8,.8,.8,-.8,.8,-.8,-.8]),T=m.length/2;d=e.CreateBuffer({size:m.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),e.WriteBuffer(d,m),e.SetVertexBuffers(d);function I(){cancelAnimationFrame(s),f.splice(y=0),S=performance.now()-p,[l,o,u].forEach(t=>t==null?void 0:t.destroy())}function _(t=48){const a=e.AspectRatio,{width:n,height:x}=e.Canvas,i=n<x?new Float32Array([t,Math.round(t/a)]):new Float32Array([Math.round(t*a),t]);l=e.CreateBuffer({size:i.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),e.WriteBuffer(l,i),v=i[0]*i[1];const c=new Uint32Array(v);o=r.CreateBuffer({size:c.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),u=r.CreateBuffer({size:c.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});for(let b=0;b<c.length;b++)c[b]=+(Math.random()>.6);r.WriteBuffer(o,c),r.Workgroups=[Math.ceil(i[0]/B),Math.ceil(i[1]/B)],f.push(r.CreateBindGroup(r.CreateBindGroupEntries([{buffer:l},{buffer:o},{buffer:u}]),C),r.CreateBindGroup(r.CreateBindGroupEntries([{buffer:l},{buffer:u},{buffer:o}]),C)),s=requestAnimationFrame(A)}function A(t){if(s=requestAnimationFrame(A),t-S<p)return;const a=r.CreateCommandEncoder();r.SetBindGroups(f[y%2]),r.Compute(),e.SetCommandEncoder(a),e.SetBindGroups(f[++y%2]),O.colorAttachments[0].view=e.CurrentTextureView,e.Render([T,v]),S=t}h=new ResizeObserver(t=>{for(const a of t){let{inlineSize:n,blockSize:x}=a.contentBoxSize[0];n=n<=960&&n||n-240,e.SetCanvasSize(n,x)}I(),_()}),h.observe(document.body)}function F(){g.OnDeviceLost=()=>{},cancelAnimationFrame(s),h.disconnect(),r.Destroy(),e.Destroy(),g.Destroy([d,l,o,u])}export{F as destroy,V as run};
