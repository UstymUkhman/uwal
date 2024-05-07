var W=Object.defineProperty;var H=(o,e,t)=>e in o?W(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var B=(o,e,t)=>(H(o,typeof e!="symbol"?e+"":e,t),t),M=(o,e,t)=>{if(!e.has(o))throw TypeError("Cannot "+t)};var a=(o,e,t)=>(M(o,e,"read from private field"),t?t.call(o):e.get(o)),d=(o,e,t)=>{if(e.has(o))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(o):e.set(o,t)},u=(o,e,t,r)=>(M(o,e,"write to private field"),r?r.call(o,t):e.set(o,t),t);var F=(o,e,t)=>(M(o,e,"access private method"),t);function w(o){const e={};for(let t in o)e[t]={value:o[t]};return Object.freeze(Object.create(null,e))}const J=w({DEVICE_LOST:"Device::Lost"}),D=w({WEBGPU_NOT_SUPPORTED:"WEBGPU_NOT_SUPPORTED",ADAPTER_NOT_FOUND:"ADAPTER_NOT_FOUND",DEVICE_NOT_FOUND:"DEVICE_NOT_FOUND",DEVICE_NOT_REQUESTED:"DEVICE_NOT_REQUESTED",DEVICE_LOST:"DEVICE_LOST",CANVAS_NOT_FOUND:"CANVAS_NOT_FOUND",CONTEXT_NOT_FOUND:"CONTEXT_NOT_FOUND",COMMAND_ENCODER_NOT_FOUND:"COMMAND_ENCODER_NOT_FOUND",PIPELINE_NOT_FOUND:"PIPELINE_NOT_FOUND"}),Q=w({WEBGPU_NOT_SUPPORTED:"WebGPU is not supported in this browser.",ADAPTER_NOT_FOUND:"Failed to get a GPUAdapter.",DEVICE_NOT_FOUND:"Failed to get a GPUDevice.",DEVICE_NOT_REQUESTED:"GPUDevice was not requested.",DEVICE_LOST:"WebGPU device was lost.",CANVAS_NOT_FOUND:"Failed to get a WebGPU canvas.",CONTEXT_NOT_FOUND:"Failed to get a WebGPU context.",COMMAND_ENCODER_NOT_FOUND:"Failed to get a GPUCommandEncoder.",PIPELINE_NOT_FOUND:"Failed to get a GPU"}),K=w({WEBGPU_NOT_SUPPORTED:0,ADAPTER_NOT_FOUND:1,DEVICE_NOT_FOUND:2,DEVICE_NOT_REQUESTED:3,DEVICE_LOST:4,CANVAS_NOT_FOUND:5,CONTEXT_NOT_FOUND:6,COMMAND_ENCODER_NOT_FOUND:7,PIPELINE_NOT_FOUND:8});function Y(o,e){console.warn(Q[o]+(e??""))}function h(o,e){throw new Error(Q[o]+(e??""),{cause:K[o]})}var v,g,p,P;class k{constructor(e,t,r){d(this,v,void 0);d(this,g,void 0);d(this,p,void 0);B(this,"Device");B(this,"BindGroups",[]);d(this,P,void 0);B(this,"Pipeline");!e&&h(D.DEVICE_NOT_REQUESTED),u(this,v,r),this.Device=e,u(this,g,t),u(this,p,this.CreateProgramLabel("Command Encoder"))}CreateProgramLabel(e){return a(this,g)&&e&&`${a(this,g)} ${e}`||""}CreateBuffer(e){const t=e.label??this.CreateProgramLabel("Buffer");return this.Device.createBuffer({...e,label:t})}WriteBuffer(e,t,r=0,n,s){this.Device.queue.writeBuffer(e,r,t,n,s)}CopyBufferToBuffer(e,t,r,n=0,s=0){this.GetCommandEncoder(!0).copyBufferToBuffer(e,n,t,s,r)}CreateShaderModule(e,t,r,n){t??(t=this.CreateProgramLabel("Shader Module"));const s=Array.isArray(e)&&e.join(`

`)||e;return this.Device.createShaderModule({label:t,code:s,sourceMap:r,compilationHints:n})}CreatePipelineLayout(e,t){const r=Array.isArray(e)&&e||[e];return t??(t=this.CreateProgramLabel(`${a(this,v)} Pipeline Layout`)),this.Device.createPipelineLayout({label:t,bindGroupLayouts:r})}CreateBindGroupLayout(e,t){t??(t=this.CreateProgramLabel("Bind Group Layout")),e=Array.isArray(e)&&e.map((n,s)=>({...n,binding:n.binding??s}))||[{...e,binding:e.binding??0}];const r=e;return this.Device.createBindGroupLayout({entries:r,label:t})}CreateBindGroupEntries(e){return Array.isArray(e)&&e.map((t,r)=>({binding:r,resource:t}))||[{binding:0,resource:e}]}CreateBindGroup(e,t,r){return t??(t=0),r??(r=this.CreateProgramLabel("Bind Group")),typeof t=="number"&&(t=this.Pipeline?this.Pipeline.getBindGroupLayout(t):h(D.PIPELINE_NOT_FOUND,`${a(this,v)}Pipeline.`)),this.Device.createBindGroup({entries:e,label:r,layout:t})}SetBindGroups(e){this.BindGroups=Array.isArray(e)&&e||[e]}CreateCommandEncoder(){return u(this,P,this.Device.createCommandEncoder({label:a(this,p)}))}SubmitCommandBuffer(){this.Device.queue.submit([a(this,P).finish()])}set CommandEncoderLabel(e){u(this,p,e)}SetCommandEncoder(e){u(this,P,e)}GetCommandEncoder(e=!1){if(!a(this,P)){if(e){const t=` ${a(this,p)&&`Label: "${a(this,p)}". `}`;Y(D.COMMAND_ENCODER_NOT_FOUND,t+"Creating a new one.")}return this.CreateCommandEncoder()}return a(this,P)}DestroyCommandEncoder(){u(this,P,void 0)}get ProgramName(){return a(this,g)}}v=new WeakMap,g=new WeakMap,p=new WeakMap,P=new WeakMap;var b,U,S,N,C;class Z extends k{constructor(t,r,n){super(t,r,"Render");d(this,b,void 0);d(this,U,[]);d(this,S,void 0);d(this,N,void 0);d(this,C,void 0);u(this,S,n)}CreateColorAttachment(t,r="load",n="store",s,c,l){return{view:t,loadOp:r,storeOp:n,clearValue:s,resolveTarget:c,depthSlice:l}}CreateRenderPassDescriptor(t,r,n,s,c,l){const x=Array.isArray(t)&&t||[t];return r??(r=this.CreateProgramLabel("Render Pass")),{colorAttachments:x,depthStencilAttachment:n,occlusionQuerySet:s,timestampWrites:c,maxDrawCount:l,label:r}}CreateVertexBufferAttribute(t,r=0,n=0){return{format:t,shaderLocation:r,offset:n}}CreateVertexState(t,r="vertex",n,s){return n=Array.isArray(n)&&n||[n],{module:t,entryPoint:r,buffers:n,constants:s}}CreateFragmentColorTarget(t=a(this,S),r,n){return{format:t,blend:r,writeMask:n}}CreateFragmentState(t,r="fragment",n,s){return n??(n=[this.CreateFragmentColorTarget()]),n=Array.isArray(n)&&n||[n],{module:t,entryPoint:r,targets:n,constants:s}}CreateRenderPipeline(t){const r=t.layout??"auto",n=t.label??this.CreateProgramLabel("Render Pipeline");return this.Pipeline=this.Device.createRenderPipeline({...t,label:n,layout:r})}SetVertexBuffers(t){u(this,U,Array.isArray(t)&&t||[t])}SetIndexBuffer(t,r="uint32",n,s){u(this,N,{buffer:t,format:r,offset:n,size:s})}Render(t,r,n,s=!0){a(this,C)||(u(this,C,this.GetCommandEncoder().beginRenderPass(t)),a(this,C).setPipeline(r),u(this,b,a(this,N)?a(this,C).drawIndexed.bind(a(this,C)):a(this,C).draw.bind(a(this,C))));for(let c=0,l=a(this,U).length;c<l;++c)a(this,C).setVertexBuffer(c,a(this,U)[c]);a(this,N)&&a(this,C).setIndexBuffer(a(this,N).buffer,a(this,N).format,a(this,N).offset,a(this,N).size);for(let c=0,l=this.BindGroups.length;c<l;++c)a(this,C).setBindGroup(c,this.BindGroups[c]);a(this,b).call(this,...Array.isArray(n)&&n||[n]),s&&(a(this,C).end(),this.SubmitCommandBuffer(),this.DestroyCommandEncoder(),u(this,C,void 0))}get CurrentPass(){return a(this,C)}}b=new WeakMap,U=new WeakMap,S=new WeakMap,N=new WeakMap,C=new WeakMap;var G;class ee extends k{constructor(t,r){super(t,r,"Compute");d(this,G,[1])}CreateComputePassDescriptor(t,r,n,s){return t??(t=this.CreateProgramLabel("Compute Pass")),{label:t,timestampWrites:r?{querySet:r,beginningOfPassWriteIndex:n,endOfPassWriteIndex:s}:void 0}}CreateComputePipeline(t){const r=t.layout??"auto",n=t.label??this.CreateProgramLabel("Compute Pipeline");return this.Pipeline=this.Device.createComputePipeline({label:n,layout:r,compute:t})}Compute(t,r){const n=this.GetCommandEncoder().beginComputePass(r);n.setPipeline(t);for(let s=0,c=this.BindGroups.length;s<c;++s)n.setBindGroup(s,this.BindGroups[s]);n.dispatchWorkgroups(...a(this,G)),n.end()}set Workgroups(t){u(this,G,Array.isArray(t)&&t||[t])}}G=new WeakMap;/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.3
 * @license MIT
 */var R,m,E,T,y,f,A,O,I,$,L,X,V,j,_,z;const i=class i{static SetAdapterOptions(e,t=!1){a(i,A).powerPreference=e,a(i,A).forceFallbackAdapter=t}static SetDeviceDescriptor(e,t=[],r={}){a(i,O).label=e,a(i,O).requiredFeatures=t,a(i,O).requiredLimits=r}static SetCanvasSize(e=innerWidth,t=innerHeight){!a(i,E)&&h(D.CANVAS_NOT_FOUND),!a(i,m)&&h(D.DEVICE_NOT_FOUND);const{maxTextureDimension2D:r}=a(i,m).limits;e=Math.max(1,Math.min(e,r)),t=Math.max(1,Math.min(t,r)),(a(i,E).width!==e||a(i,E).height!==t)&&(a(i,E).height=t,a(i,E).width=e)}static RenderPipeline(e,t="",r={}){return a(i,O).label=F(this,I,$).call(this,t),(async()=>{const n=await i.Device,s=e.getContext("webgpu");!s&&h(D.CONTEXT_NOT_FOUND);const c=r.format??a(i,f),l={...r,format:c};return s.configure({device:n,...l}),u(i,E,e),u(i,T,s),new Proxy(Z,{construct(x){return new x(n,t,c)}})})()}static ComputePipeline(e=""){return a(i,O).label=F(this,I,$).call(this,e),(async()=>{const t=await i.Device;return new Proxy(ee,{construct(r){return new r(t,e)}})})()}static Destroy(e,t,r){var n,s;e=Array.isArray(e)&&e||[e],e.forEach(c=>c==null?void 0:c.destroy()),t=Array.isArray(t)&&t||[t],t.forEach(c=>c==null?void 0:c.destroy()),r=Array.isArray(r)&&r||[r],r.forEach(c=>c==null?void 0:c.destroy()),(n=a(i,T))==null||n.unconfigure(),(s=a(i,m))==null||s.destroy(),u(i,R,u(i,m,null)),u(i,E,u(i,T,void 0)),u(i,y,u(i,f,void 0)),u(i,A,{powerPreference:void 0,forceFallbackAdapter:!1}),u(i,O,{label:void 0,requiredFeatures:[],requiredLimits:{}})}static get Adapter(){return(async()=>{var e;return a(i,R)??await F(e=i,L,X).call(e)()})()}static get Device(){return(async()=>{var e;return a(i,m)??await F(e=i,V,j).call(e)()})()}static get Canvas(){return a(i,E)}static get Context(){return a(i,T)}static get AspectRatio(){return!a(i,E)&&h(D.CANVAS_NOT_FOUND),a(i,E).width/a(i,E).height}static get CurrentTexture(){return a(i,T).getCurrentTexture()}static get CurrentTextureView(){return i.CurrentTexture.createView()}static get PreferredCanvasFormat(){return a(i,f)}static get SupportedLimits(){return a(this,y)}static get VERSION(){return"0.0.3"}};R=new WeakMap,m=new WeakMap,E=new WeakMap,T=new WeakMap,y=new WeakMap,f=new WeakMap,A=new WeakMap,O=new WeakMap,I=new WeakSet,$=function(e){return a(i,O).label??(e&&`${e} Device`||"")},L=new WeakSet,X=function(){return!navigator.gpu&&h(D.WEBGPU_NOT_SUPPORTED),u(i,f,navigator.gpu.getPreferredCanvasFormat()),async()=>{const e=await navigator.gpu.requestAdapter(a(i,A));return!e&&h(D.ADAPTER_NOT_FOUND),u(this,y,e.limits),u(i,R,e)}},V=new WeakSet,j=function(){return async()=>{const{requiredFeatures:e,requiredLimits:t,label:r}=a(i,O),n=await(await i.Adapter).requestDevice({requiredFeatures:e,requiredLimits:t,defaultQueue:{label:r}});return!n&&h(D.DEVICE_NOT_FOUND),n.lost.then(F(i,_,z)),u(i,m,n)}},_=new WeakSet,z=function(e){var r;if(i.OnDeviceLost)return i.OnDeviceLost(e);(r=a(i,E))==null||r.dispatchEvent(new CustomEvent(J.DEVICE_LOST,{detail:e}));const t=(e.message&&` | Message: ${e.message}`)??".";h(D.DEVICE_LOST,` Reason: ${e.reason}`+t)},d(i,I),d(i,L),d(i,V),d(i,_),d(i,R,null),d(i,m,null),d(i,E,void 0),d(i,T,void 0),d(i,y,void 0),d(i,f,void 0),d(i,A,{powerPreference:void 0,forceFallbackAdapter:!1}),d(i,O,{label:void 0,requiredFeatures:[],requiredLimits:{}}),B(i,"OnDeviceLost");let q=i;console.info("%cUWAL v0.0.3","background:#005a9c;padding:3px;color:#fff;");export{q as U};