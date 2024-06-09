var ne=Object.defineProperty;var oe=(o,t,e)=>t in o?ne(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var G=(o,t,e)=>(oe(o,typeof t!="symbol"?t+"":t,e),e),k=(o,t,e)=>{if(!t.has(o))throw TypeError("Cannot "+e)};var a=(o,t,e)=>(k(o,t,"read from private field"),e?e.call(o):t.get(o)),h=(o,t,e)=>{if(t.has(o))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(o):t.set(o,e)},E=(o,t,e,r)=>(k(o,t,"write to private field"),r?r.call(o,e):t.set(o,e),e);var T=(o,t,e)=>(k(o,t,"access private method"),e);function C(o){for(let t in o)o[t]={value:o[t]};return Object.freeze(Object.create(null,o))}const he={CANVAS_NOT_FOUND:"CANVAS_NOT_FOUND",CONTEXT_NOT_FOUND:"CONTEXT_NOT_FOUND",COMMAND_ENCODER_NOT_FOUND:"COMMAND_ENCODER_NOT_FOUND",VERTEX_STATE_NOT_FOUND:"VERTEX_STATE_NOT_FOUND",PIPELINE_NOT_FOUND:"PIPELINE_NOT_FOUND"},ue={CANVAS_NOT_FOUND:"Failed to get a WebGPU canvas.",CONTEXT_NOT_FOUND:"Failed to get a WebGPU context.",COMMAND_ENCODER_NOT_FOUND:"Failed to get a GPUCommandEncoder.",VERTEX_STATE_NOT_FOUND:"Failed to get a GPUVertexState.",PIPELINE_NOT_FOUND:"Failed to get a GPU"},Ee={CANVAS_NOT_FOUND:5,CONTEXT_NOT_FOUND:6,COMMAND_ENCODER_NOT_FOUND:7,VERTEX_STATE_NOT_FOUND:8,PIPELINE_NOT_FOUND:9},ce={TEXTURE_SIZE_NOT_FOUND:"TEXTURE_SIZE_NOT_FOUND"},le={TEXTURE_SIZE_NOT_FOUND:"WriteTexture `options` is required to have a `size` array or a `width` value."},Te={REQUIRED_SEGMENTS:"REQUIRED_SEGMENTS"},De={REQUIRED_SEGMENTS:"Shape `segments` is required to be an integer value."};C({DEVICE_LOST:"Device::Lost"});const p=C({WEBGPU_NOT_SUPPORTED:"WEBGPU_NOT_SUPPORTED",ADAPTER_NOT_FOUND:"ADAPTER_NOT_FOUND",DEVICE_NOT_FOUND:"DEVICE_NOT_FOUND",DEVICE_NOT_REQUESTED:"DEVICE_NOT_REQUESTED",DEVICE_LOST:"DEVICE_LOST",...he,...ce,...Te}),ee=C({WEBGPU_NOT_SUPPORTED:"WebGPU is not supported in this browser.",ADAPTER_NOT_FOUND:"Failed to get a GPUAdapter.",DEVICE_NOT_FOUND:"Failed to get a GPUDevice.",DEVICE_NOT_REQUESTED:"GPUDevice was not requested.",DEVICE_LOST:"WebGPU device was lost.",...ue,...le,...De}),pe=C({WEBGPU_NOT_SUPPORTED:0,ADAPTER_NOT_FOUND:1,DEVICE_NOT_FOUND:2,DEVICE_NOT_REQUESTED:3,DEVICE_LOST:4,...Ee});function Oe(o,t){console.warn(ee[o]+(t??""))}function O(o,t){throw new Error(ee[o]+(t??""),{cause:pe[o]})}var y,R,P,A;class te{constructor(t,e,r){h(this,y,void 0);h(this,R,void 0);h(this,P,void 0);G(this,"Device");G(this,"BindGroups",[]);h(this,A,void 0);G(this,"Pipeline");G(this,"Descriptor");!t&&O(p.DEVICE_NOT_REQUESTED),E(this,y,r),this.Device=t,E(this,R,e),E(this,P,this.CreatePipelineLabel("Command Encoder"))}CreatePipelineLabel(t){return a(this,R)&&t&&`${a(this,R)} ${t}`||""}CreatePipelineLayout(t,e){const r=Array.isArray(t)&&t||[t];return e??(e=this.CreatePipelineLabel(`${a(this,y)} Pipeline Layout`)),this.Device.createPipelineLayout({label:e,bindGroupLayouts:r})}CreateShaderModule(t,e,r,i){e??(e=this.CreatePipelineLabel("Shader Module"));const s=Array.isArray(t)&&t.join(`

`)||t;return this.Device.createShaderModule({label:e,code:s,sourceMap:r,compilationHints:i})}CreateBuffer(t){const e=t.label??this.CreatePipelineLabel("Buffer");return this.Device.createBuffer({...t,label:e})}WriteBuffer(t,e,r=0,i,s){this.Device.queue.writeBuffer(t,r,e,i,s)}CopyBufferToBuffer(t,e,r,i=0,s=0){this.GetCommandEncoder(!0).copyBufferToBuffer(t,i,e,s,r)}CreateBindGroupLayout(t,e){e??(e=this.CreatePipelineLabel("Bind Group Layout")),t=Array.isArray(t)&&t.map((i,s)=>({...i,binding:i.binding??s}))||[{...t,binding:t.binding??0}];const r=t;return this.Device.createBindGroupLayout({entries:r,label:e})}CreateBindGroupEntries(t,e=0){return Array.isArray(t)&&t.map((r,i)=>({binding:(e==null?void 0:e[i])??i,resource:r}))||[{binding:e,resource:t}]}CreateBindGroup(t,e=0,r){return r??(r=this.CreatePipelineLabel("Bind Group")),typeof e=="number"&&(e=this.Pipeline?this.Pipeline.getBindGroupLayout(e):O(p.PIPELINE_NOT_FOUND,`${a(this,y)}Pipeline.`)),this.Device.createBindGroup({entries:t,label:r,layout:e})}SetBindGroups(t,e){Array.isArray(e)?e[0].length||(e=e.map(r=>[r])):e=[e],this.BindGroups=Array.isArray(t)&&t.map((r,i)=>({bindGroup:r,dynamicOffsets:e[i],active:!0}))||[{bindGroup:t,dynamicOffsets:e[0],active:!0}]}AddBindGroups(t,e){Array.isArray(e)?e[0].length||(e=e.map(r=>[r])):e=[e],this.BindGroups.push(...Array.isArray(t)&&t.map((r,i)=>({bindGroup:r,dynamicOffsets:e[i],active:!0}))||[{bindGroup:t,dynamicOffsets:e[0],active:!0}])}SetActiveBindGroups(t){t=Array.isArray(t)&&t||[t];for(let e=this.BindGroups.length;e--;)this.BindGroups[e].active=t.includes(e)}ClearBindGroups(){this.BindGroups.splice(0)}CreateCommandEncoder(){return E(this,A,this.Device.createCommandEncoder({label:a(this,P)}))}SetCommandEncoder(t){E(this,A,t)}GetCommandEncoder(t=!1){if(!a(this,A)){if(t){const e=` ${a(this,P)&&`Label: "${a(this,P)}". `}`;Oe(p.COMMAND_ENCODER_NOT_FOUND,e+"Creating a new one.")}return this.CreateCommandEncoder()}return a(this,A)}DestroyCommandEncoder(){E(this,A,void 0)}SubmitCommandBuffer(){this.Device.queue.submit([a(this,A).finish()])}set CommandEncoderLabel(t){E(this,P,t)}get ProgramName(){return a(this,R)}GetDescriptor(){return this.Descriptor}GetPipeline(){return this.Pipeline}}y=new WeakMap,R=new WeakMap,P=new WeakMap,A=new WeakMap;var M,F,D,S,v,g,f,N,c,$,Z;class de extends te{constructor(e,r,i,s){super(e,r,"Render");h(this,$);h(this,M,void 0);h(this,F,new Float32Array(2));h(this,D,void 0);h(this,S,void 0);h(this,v,void 0);h(this,g,[]);h(this,f,void 0);h(this,N,void 0);h(this,c,void 0);!i&&O(p.CANVAS_NOT_FOUND);const u=i.getContext("webgpu");!u&&O(p.CONTEXT_NOT_FOUND),E(this,f,s.format??navigator.gpu.getPreferredCanvasFormat()),u.configure({device:e,...s,format:a(this,f)}),E(this,v,this.CreateBuffer({size:a(this,F).length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:"Render Pipeline Resolution Buffer"})),E(this,D,i),E(this,S,u),T(this,$,Z).call(this)}SetCanvasSize(e,r){!this.Device&&O(p.DEVICE_NOT_FOUND),!a(this,D)&&O(p.CANVAS_NOT_FOUND);const{maxTextureDimension2D:i}=this.Device.limits;e=Math.max(1,Math.min(e,i)),r=Math.max(1,Math.min(r,i)),(a(this,D).width!==e||a(this,D).height!==r)&&(a(this,D).width=e,a(this,D).height=r,T(this,$,Z).call(this))}CreateColorAttachment(e,r="load",i="store",s,u,l){return{view:e,loadOp:r,storeOp:i,clearValue:s,resolveTarget:u,depthSlice:l}}CreatePassDescriptor(e,r,i,s,u,l){const d=Array.isArray(e)&&e||[e];return r??(r=this.CreatePipelineLabel("Render Pass")),this.Descriptor={colorAttachments:d,depthStencilAttachment:i,occlusionQuerySet:s,timestampWrites:u,maxDrawCount:l,label:r}}SetPassDescriptor(e){this.Descriptor=e}CreateVertexBufferAttribute(e,r=0,i=0){return{format:e,shaderLocation:r,offset:i}}CreateVertexState(e,r="vertex",i,s){return i=Array.isArray(i)&&i||[i],{module:e,entryPoint:r,buffers:i,constants:s}}CreateFragmentColorTarget(e=a(this,f),r,i){return{format:e,blend:r,writeMask:i}}CreateFragmentState(e,r="fragment",i,s){return i??(i=[this.CreateFragmentColorTarget()]),i=Array.isArray(i)&&i||[i],{module:e,entryPoint:r,targets:i,constants:s}}CreatePipeline(e){const r=e.layout??"auto";let{module:i,vertex:s,fragment:u}=e;i&&(s??(s=this.CreateVertexState(i)),u??(u=this.CreateFragmentState(i))),!i&&!s&&O(p.VERTEX_STATE_NOT_FOUND);const l=e.label??this.CreatePipelineLabel("Render Pipeline");return this.Pipeline=this.Device.createRenderPipeline({...e,vertex:s,fragment:u,label:l,layout:r})}SetPipeline(e){this.Pipeline=e}SetVertexBuffers(e,r,i){r=Array.isArray(r)&&r||[r],i=Array.isArray(i)&&i||[i],E(this,g,Array.isArray(e)&&e.map((s,u)=>({buffer:s,offset:r[u],size:i[u]}))||[{buffer:e,offset:r[0],size:i[0]}])}AddVertexBuffers(e,r,i){r=Array.isArray(r)&&r||[r],i=Array.isArray(i)&&i||[i],a(this,g).push(...Array.isArray(e)&&e.map((s,u)=>({buffer:s,offset:r[u],size:i[u]}))||[{buffer:e,offset:r[0],size:i[0]}])}SetIndexBuffer(e,r="uint32",i,s){E(this,N,{buffer:e,format:r,offset:i,size:s})}Render(e,r=!0){a(this,c)||(E(this,c,this.GetCommandEncoder().beginRenderPass(this.Descriptor)),a(this,c).setPipeline(this.Pipeline),E(this,M,a(this,N)?a(this,c).drawIndexed.bind(a(this,c)):a(this,c).draw.bind(a(this,c))));for(let i=0,s=a(this,g).length;i<s;++i){const{buffer:u,offset:l,size:d}=a(this,g)[i];a(this,c).setVertexBuffer(i,u,l,d)}a(this,N)&&a(this,c).setIndexBuffer(a(this,N).buffer,a(this,N).format,a(this,N).offset,a(this,N).size);for(let i=0,s=0,u=this.BindGroups.length;i<u;++i){const{bindGroup:l,dynamicOffsets:d,active:x}=this.BindGroups[i];x&&a(this,c).setBindGroup(s++,l,d)}a(this,M).call(this,...Array.isArray(e)&&e||[e]),r&&this.Submit()}Submit(){a(this,c).end(),this.SubmitCommandBuffer(),this.DestroyCommandEncoder(),E(this,c,void 0)}Destroy(){var e;E(this,c,void 0),(e=a(this,S))==null||e.unconfigure()}get Canvas(){return a(this,D)}get Context(){return a(this,S)}get AspectRatio(){return!a(this,D)&&O(p.CANVAS_NOT_FOUND),a(this,D).width/a(this,D).height}get CurrentTexture(){return a(this,S).getCurrentTexture()}get CurrentTextureView(){return this.CurrentTexture.createView()}get ResolutionBuffer(){return a(this,v)}get CurrentPass(){return a(this,c)}}M=new WeakMap,F=new WeakMap,D=new WeakMap,S=new WeakMap,v=new WeakMap,g=new WeakMap,f=new WeakMap,N=new WeakMap,c=new WeakMap,$=new WeakSet,Z=function(){a(this,F).set([a(this,D).width,a(this,D).height]),this.WriteBuffer(a(this,v),a(this,F))};var Q;class Ne extends te{constructor(e,r){super(e,r,"Compute");h(this,Q,[1])}CreatePassDescriptor(e,r,i,s){return e??(e=this.CreatePipelineLabel("Compute Pass")),this.Descriptor={label:e,timestampWrites:r?{querySet:r,beginningOfPassWriteIndex:i,endOfPassWriteIndex:s}:void 0}}SetPassDescriptor(e){this.Descriptor=e}CreatePipeline(e){const r=e.layout??"auto",i=e.label??this.CreatePipelineLabel("Compute Pipeline");return this.Pipeline=this.Device.createComputePipeline({label:i,layout:r,compute:e})}SetPipeline(e){this.Pipeline=e}Compute(){const e=this.GetCommandEncoder().beginComputePass(this.Descriptor);e.setPipeline(this.Pipeline);for(let r=0,i=0,s=this.BindGroups.length;r<s;++r){const{bindGroup:u,dynamicOffsets:l,active:d}=this.BindGroups[r];d&&e.setBindGroup(i++,u,l)}e.dispatchWorkgroups(...a(this,Q)),e.end()}set Workgroups(e){E(this,Q,Array.isArray(e)&&e||[e])}}Q=new WeakMap;var _,L,W,re,X,J,B,q;class Ce{constructor(t,e){h(this,W);h(this,X);h(this,B);h(this,_,void 0);h(this,L,void 0);!t&&O(p.DEVICE_NOT_REQUESTED),E(this,L,e),E(this,_,t)}CreateTexture(t){const e=t.label??T(this,W,re).call(this,"Texture");return a(this,_).createTexture({...t,label:e})}WriteTexture(t,e){const{texture:r,mipLevel:i,origin:s,aspect:u,offset:l,bytesPerRow:d,rowsPerImage:x}=e;a(this,_).queue.writeTexture({texture:r,mipLevel:i,origin:s,aspect:u},t,{offset:l,bytesPerRow:d,rowsPerImage:x},T(this,X,J).call(this,e))}CopyImageToTexture(t,e){const[r,i]=T(this,B,q).call(this,t),{texture:s,mipLevel:u,aspect:l,colorSpace:d,premultipliedAlpha:x}=e;a(this,_).queue.copyExternalImageToTexture({source:t,origin:e.sourceOrigin,flipY:e.flipY},{texture:s,mipLevel:u,origin:e.destinationOrigin,aspect:l,colorSpace:d,premultipliedAlpha:x},T(this,X,J).call(this,{width:r,height:i,...e}))}CreateBitmapImage(t,e){return createImageBitmap(t,e)}CreateTextureFromSource(t,e){const r=e.mipLevelCount??(e.mipmaps&&this.GetMipmapLevels(t)||void 0),i=e.size,s=e.size,u=Array.isArray(e.size)||!e.size?i??T(this,B,q).call(this,t):[s.width,s.height];return this.CreateTexture({mipLevelCount:r,size:u,...e})}CreateSampler(t){return a(this,_).createSampler(t)}GetMipmapLevels(t){const[e,r]=T(this,B,q).call(this,t);return(Math.log2(Math.max(e,r))|0)+1}}_=new WeakMap,L=new WeakMap,W=new WeakSet,re=function(t){return a(this,L)&&t&&`${a(this,L)} ${t}`||""},X=new WeakSet,J=function(t){const{size:e,width:r,height:i,depthOrArrayLayers:s}=t;return!e&&!r&&O(p.TEXTURE_SIZE_NOT_FOUND),e??{width:r,height:i,depthOrArrayLayers:s}},B=new WeakSet,q=function(t){return t instanceof VideoFrame?[t.codedWidth,t.codedHeight]:[t.width,t.height]};C({STENCIL:"stencil-only",DEPTH:"depth-only",ALL:"all"});const Pe=C({MIRROR:"mirror-repeat",CLAMP:"clamp-to-edge",REPEAT:"repeat"}),_e=C({NEAREST:"nearest",LINEAR:"linear"});C({GREATER_EQUAL:"greater-equal",LESS_EQUAL:"less-equal",NOT_EQUAL:"not-equal",GREATER:"greater",ALWAYS:"always",NEVER:"never",EQUAL:"equal",LESS:"less"});/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.4
 * @license MIT
 */var I,V,U,m,w,b,z,H,ie,j,ae,Y,se;const n=class n{static SetAdapterOptions(t,e=!1){a(n,V).powerPreference=t,a(n,V).forceFallbackAdapter=e}static SetDeviceDescriptor(t,e=[],r={}){a(n,m).label=t,a(n,m).requiredFeatures=e,a(n,m).requiredLimits=r}static RenderPipeline(t,e="",r={}){return T(this,b,z).call(this,e),(async()=>{const i=await n.Device;return new Proxy(de,{construct(s){return new s(i,e,t,r)}})})()}static ComputePipeline(t=""){return T(this,b,z).call(this,t),(async()=>{const e=await n.Device;return new Proxy(Ne,{construct(r){return new r(e,t)}})})()}static Texture(t=""){return T(this,b,z).call(this,t),(async()=>{const e=await n.Device;return new Proxy(Ce,{construct(r){return new r(e,t)}})})()}static Destroy(t,e,r){var i;t=Array.isArray(t)&&t||[t],t.forEach(s=>s==null?void 0:s.destroy()),e=Array.isArray(e)&&e||[e],e.forEach(s=>s==null?void 0:s.destroy()),r=Array.isArray(r)&&r||[r],r.forEach(s=>s==null?void 0:s.destroy()),(i=a(n,U))==null||i.destroy(),n.SetAdapterOptions(),n.SetDeviceDescriptor(),E(n,w,void 0),E(n,I,E(n,U,null))}static get AdapterLimits(){return a(this,w)}static get Adapter(){return(async()=>{var t;return a(n,I)??await T(t=n,j,ae).call(t)()})()}static get Device(){return(async()=>{var t;return a(n,U)??await T(t=n,Y,se).call(t)()})()}static get VERSION(){return"0.0.4"}};I=new WeakMap,V=new WeakMap,U=new WeakMap,m=new WeakMap,w=new WeakMap,b=new WeakSet,z=function(t){var e;(e=a(n,m)).label??(e.label=t&&`${t} Device`||"")},H=new WeakSet,ie=function(t){if(n.OnDeviceLost)return n.OnDeviceLost(t);const e=(t.message&&` | Message: ${t.message}`)??".";O(p.DEVICE_LOST,` Reason: ${t.reason}`+e)},j=new WeakSet,ae=function(){return!navigator.gpu&&O(p.WEBGPU_NOT_SUPPORTED),async()=>{const t=await navigator.gpu.requestAdapter(a(n,V));return!t&&O(p.ADAPTER_NOT_FOUND),E(this,w,t.limits),E(n,I,t)}},Y=new WeakSet,se=function(){return async()=>{const{requiredFeatures:t,requiredLimits:e,label:r}=a(n,m),i=await(await n.Adapter).requestDevice({requiredFeatures:t,requiredLimits:e,defaultQueue:{label:r}});return!i&&O(p.DEVICE_NOT_FOUND),i.lost.then(T(n,H,ie)),E(n,U,i)}},h(n,b),h(n,H),h(n,j),h(n,Y),h(n,I,null),h(n,V,{powerPreference:void 0,forceFallbackAdapter:!1}),h(n,U,null),h(n,m,{label:void 0,requiredFeatures:[],requiredLimits:{}}),h(n,w,void 0),G(n,"OnDeviceLost");let K=n;C({HPI:Math.PI/2,TAU:Math.PI*2});C({TRIANGLE:3,SQUARE:4,PENTAGON:5,HEXAGON:6,HEPTAGON:7,OCTAGON:8,NONAGON:9,DECAGON:10,DODECAGON:12});console.info("%cUWAL v0.0.4","background:#005a9c;padding:3px;color:#fff;");export{Pe as A,_e as F,K as U};
