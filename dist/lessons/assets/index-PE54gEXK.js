var q=Object.defineProperty;var W=(s,e,t)=>e in s?q(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var V=(s,e,t)=>(W(s,typeof e!="symbol"?e+"":e,t),t),x=(s,e,t)=>{if(!e.has(s))throw TypeError("Cannot "+t)};var r=(s,e,t)=>(x(s,e,"read from private field"),t?t.call(s):e.get(s)),u=(s,e,t)=>{if(e.has(s))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(s):e.set(s,t)},C=(s,e,t,a)=>(x(s,e,"write to private field"),a?a.call(s,t):e.set(s,t),t);var g=(s,e,t)=>(x(s,e,"access private method"),t);function G(s){const e={};for(let t in s)e[t]={value:s[t]};return Object.freeze(Object.create(null,e))}const z=G({DEVICE_LOST:"Device::Lost"}),D=G({WEBGPU_NOT_SUPPORTED:"WEBGPU_NOT_SUPPORTED",ADAPTER_NOT_FOUND:"ADAPTER_NOT_FOUND",DEVICE_NOT_FOUND:"DEVICE_NOT_FOUND",DEVICE_NOT_REQUESTED:"DEVICE_NOT_REQUESTED",DEVICE_LOST:"DEVICE_LOST",CANVAS_NOT_FOUND:"CANVAS_NOT_FOUND",CONTEXT_NOT_FOUND:"CONTEXT_NOT_FOUND",COMMAND_ENCODER_NOT_FOUND:"COMMAND_ENCODER_NOT_FOUND"}),$=G({WEBGPU_NOT_SUPPORTED:"WebGPU is not supported in this browser.",ADAPTER_NOT_FOUND:"Failed to get a GPUAdapter.",DEVICE_NOT_FOUND:"Failed to get a GPUDevice.",DEVICE_NOT_REQUESTED:"GPUDevice was not requested.",DEVICE_LOST:"WebGPU device was lost.",CANVAS_NOT_FOUND:"Failed to get a WebGPU canvas.",CONTEXT_NOT_FOUND:"Failed to get a WebGPU context.",COMMAND_ENCODER_NOT_FOUND:"Failed to get a GPUCommandEncoder."}),H=G({WEBGPU_NOT_SUPPORTED:0,ADAPTER_NOT_FOUND:1,DEVICE_NOT_FOUND:2,DEVICE_NOT_REQUESTED:3,DEVICE_LOST:4,CANVAS_NOT_FOUND:5,CONTEXT_NOT_FOUND:6,COMMAND_ENCODER_NOT_FOUND:7});function J(s,e){console.warn($[s]+(e??""))}function N(s,e){throw new Error($[s]+(e??""),{cause:H[s]})}var P,T,f;class Q{constructor(e,t){u(this,P,void 0);u(this,T,void 0);V(this,"Device");V(this,"BindGroups",[]);u(this,f,void 0);!e&&N(D.DEVICE_NOT_REQUESTED),this.Device=e,C(this,P,t),C(this,T,this.CreateProgramLabel("Command Encoder"))}CreateProgramLabel(e){return r(this,P)&&e&&`${r(this,P)} ${e}`||""}CreateBuffer(e){const t=e.label??this.CreateProgramLabel("Buffer");return this.Device.createBuffer({...e,label:t})}WriteBuffer(e,t,a=0,n,c){this.Device.queue.writeBuffer(e,a,t,n,c)}CopyBufferToBuffer(e,t,a,n=0,c=0){this.CommandEncoder.copyBufferToBuffer(e,n,t,c,a)}CreateShaderModule(e,t,a,n){t??(t=this.CreateProgramLabel("Shader Module"));const c=Array.isArray(e)&&e.join(`

`)||e;return this.Device.createShaderModule({label:t,code:c,sourceMap:a,compilationHints:n})}CreateBindGroupEntries(e){return Array.isArray(e)&&e.map((t,a)=>({binding:a,resource:t}))||[{binding:0,resource:e}]}CreateBindGroup(e){const t=e.label??this.CreateProgramLabel("Bind Group");return this.Device.createBindGroup({...e,label:t})}SetBindGroups(e){this.BindGroups=Array.isArray(e)&&e||[e]}CreateCommandEncoder(){return C(this,f,this.Device.createCommandEncoder({label:r(this,T)}))}SubmitCommandBuffer(){this.Device.queue.submit([this.CommandEncoder.finish()])}set CommandEncoderLabel(e){C(this,T,e)}get CommandEncoder(){if(!r(this,f)){const e=` ${r(this,T)&&`Label: "${r(this,T)}". `}`;return J(D.COMMAND_ENCODER_NOT_FOUND,e+"Creating a new one."),this.CreateCommandEncoder()}return r(this,f)}get ProgramName(){return r(this,P)}}P=new WeakMap,T=new WeakMap,f=new WeakMap;var R,A,U,O,E;class K extends Q{constructor(t,a,n){super(t,a);u(this,R,void 0);u(this,A,[]);u(this,U,void 0);u(this,O,void 0);u(this,E,void 0);C(this,U,n)}CreateColorAttachment(t,a="load",n="store",c,o,l){return{view:t,loadOp:a,storeOp:n,clearValue:c,resolveTarget:o,depthSlice:l}}CreateRenderPassDescriptor(t,a,n,c,o,l){const I=Array.isArray(t)&&t||[t];return a??(a=this.CreateProgramLabel("Render Pass")),{colorAttachments:I,depthStencilAttachment:n,occlusionQuerySet:c,timestampWrites:o,maxDrawCount:l,label:a}}CreateVertexBufferAttribute(t,a=0,n=0){return{format:t,shaderLocation:a,offset:n}}CreateVertexState(t,a="vertex",n,c){return n=Array.isArray(n)?n:[n],{module:t,entryPoint:a,buffers:n,constants:c}}CreateFragmentColorTarget(t=r(this,U),a,n){return{format:t,blend:a,writeMask:n}}CreateFragmentState(t,a="fragment",n,c){return n??(n=[this.CreateFragmentColorTarget()]),n=Array.isArray(n)?n:[n],{module:t,entryPoint:a,targets:n,constants:c}}CreateRenderPipeline(t){const a=t.layout??"auto",n=t.label??this.CreateProgramLabel("Render Pipeline");return this.Device.createRenderPipeline({...t,label:n,layout:a})}SetVertexBuffers(t){C(this,A,Array.isArray(t)&&t||[t])}SetIndexBuffer(t,a="uint32",n,c){C(this,O,{buffer:t,format:a,offset:n,size:c})}Render(t,a,n,c=!0){if(!r(this,E)){const o=this.CreateCommandEncoder();C(this,E,o.beginRenderPass(t)),r(this,E).setPipeline(a),C(this,R,r(this,O)?r(this,E).drawIndexed.bind(r(this,E)):r(this,E).draw.bind(r(this,E)))}for(let o=0,l=r(this,A).length;o<l;++o)r(this,E).setVertexBuffer(o,r(this,A)[o]);r(this,O)&&r(this,E).setIndexBuffer(r(this,O).buffer,r(this,O).format,r(this,O).offset,r(this,O).size);for(let o=0,l=this.BindGroups.length;o<l;++o)r(this,E).setBindGroup(o,this.BindGroups[o]);r(this,R).call(this,...Array.isArray(n)&&n||[n]),c&&(r(this,E).end(),C(this,E,void 0),this.SubmitCommandBuffer())}get CurrentPass(){return r(this,E)}}R=new WeakMap,A=new WeakMap,U=new WeakMap,O=new WeakMap,E=new WeakMap;var y;class Y extends Q{constructor(t,a){super(t,a);u(this,y,[1])}CreateComputePassDescriptor(t,a,n,c){return t??(t=this.CreateProgramLabel("Compute Pass")),{label:t,timestampWrites:a?{querySet:a,beginningOfPassWriteIndex:n,endOfPassWriteIndex:c}:void 0}}CreateComputePipeline(t){const a=t.layout??"auto",n=t.label??this.CreateProgramLabel("Compute Pipeline");return this.Device.createComputePipeline({label:n,layout:a,compute:t})}Compute(t,a){const n=this.CommandEncoder.beginComputePass(a);n.setPipeline(t);for(let c=0,o=this.BindGroups.length;c<o;++c)n.setBindGroup(c,this.BindGroups[c]);n.dispatchWorkgroups(...r(this,y)),n.end()}set Workgroups(t){C(this,y,Array.isArray(t)&&t||[t])}}y=new WeakMap;/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.2
 * @license MIT
 */var B,m,d,p,v,F,h,S,M,b,X,_,j,w,k;const i=class i{static SetAdapterOptions(e,t=!1){r(i,F).powerPreference=e,r(i,F).forceFallbackAdapter=t}static SetDeviceDescriptor(e,t=[],a={}){r(i,h).label=e,r(i,h).requiredFeatures=t,r(i,h).requiredLimits=a}static SetCanvasSize(e=innerWidth,t=innerHeight){!r(i,d)&&N(D.CANVAS_NOT_FOUND),!r(i,m)&&N(D.DEVICE_NOT_FOUND);const{maxTextureDimension2D:a}=r(i,m).limits;e=Math.max(1,Math.min(e,a)),t=Math.max(1,Math.min(t,a)),(r(i,d).width!==e||r(i,d).height!==t)&&(r(i,d).height=t,r(i,d).width=e)}static RenderPipeline(e,t="",a={}){return r(i,h).label=g(this,S,M).call(this,t),(async()=>{const n=await i.Device,c=e.getContext("webgpu");!c&&N(D.CONTEXT_NOT_FOUND);const o=a.format??r(i,v),l={...a,format:o};return c.configure({device:n,...l}),C(i,d,e),C(i,p,c),new Proxy(K,{construct(I){return new I(n,t,o)}})})()}static ComputePipeline(e=""){return r(i,h).label=g(this,S,M).call(this,e),(async()=>{const t=await i.Device;return new Proxy(Y,{construct(a){return new a(t,e)}})})()}static Destroy(e,t,a){var n,c;e=Array.isArray(e)&&e||[e],e.forEach(o=>o==null?void 0:o.destroy()),t=Array.isArray(t)&&t||[t],t.forEach(o=>o==null?void 0:o.destroy()),a=Array.isArray(a)&&a||[a],a.forEach(o=>o==null?void 0:o.destroy()),(n=r(i,p))==null||n.unconfigure(),(c=r(i,m))==null||c.destroy()}static get Adapter(){return(async()=>{var e;return r(i,B)??await g(e=i,b,X).call(e)()})()}static get Device(){return(async()=>{var e;return r(i,m)??await g(e=i,_,j).call(e)()})()}static get Canvas(){return r(i,d)}static get Context(){return r(i,p)}static get AspectRatio(){return!r(i,d)&&N(D.CANVAS_NOT_FOUND),r(i,d).width/r(i,d).height}static get CurrentTexture(){return r(i,p).getCurrentTexture()}static get CurrentTextureView(){return i.CurrentTexture.createView()}static get PreferredCanvasFormat(){return r(i,v)}static get VERSION(){return"0.0.2"}};B=new WeakMap,m=new WeakMap,d=new WeakMap,p=new WeakMap,v=new WeakMap,F=new WeakMap,h=new WeakMap,S=new WeakSet,M=function(e){return r(i,h).label??(e&&`${e} Device`||"")},b=new WeakSet,X=function(){return!navigator.gpu&&N(D.WEBGPU_NOT_SUPPORTED),C(i,v,navigator.gpu.getPreferredCanvasFormat()),async()=>{const e=await navigator.gpu.requestAdapter(r(i,F));return!e&&N(D.ADAPTER_NOT_FOUND),C(i,B,e)}},_=new WeakSet,j=function(){return async()=>{const{requiredFeatures:e,requiredLimits:t,label:a}=r(i,h),n=await(await i.Adapter).requestDevice({requiredFeatures:e,requiredLimits:t,defaultQueue:{label:a}});return!n&&N(D.DEVICE_NOT_FOUND),n.lost.then(g(i,w,k)),C(i,m,n)}},w=new WeakSet,k=function(e){if(i.OnDeviceLost)return i.OnDeviceLost(e);r(i,d).dispatchEvent(new CustomEvent(z.DEVICE_LOST,{detail:e}));const t=(e.message&&` | Message: ${e.message}`)??".";N(D.DEVICE_LOST,` Reason: ${e.reason}`+t)},u(i,S),u(i,b),u(i,_),u(i,w),u(i,B,null),u(i,m,null),u(i,d,void 0),u(i,p,void 0),u(i,v,void 0),u(i,F,{powerPreference:void 0,forceFallbackAdapter:!1}),u(i,h,{label:void 0,requiredFeatures:[],requiredLimits:{}}),V(i,"OnDeviceLost");let L=i;console.info("%cUWAL v0.0.2","background:#005a9c;padding:3px;color:#fff;");export{L as U};