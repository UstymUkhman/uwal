var ge=Object.defineProperty;var de=u=>{throw TypeError(u)};var Fe=(u,t,e)=>t in u?ge(u,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):u[t]=e;var q=(u,t,e)=>Fe(u,typeof t!="symbol"?t+"":t,e),ce=(u,t,e)=>t.has(u)||de("Cannot "+e);var i=(u,t,e)=>(ce(u,t,"read from private field"),e?e.call(u):t.get(u)),h=(u,t,e)=>t.has(u)?de("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(u):t.set(u,e),n=(u,t,e,r)=>(ce(u,t,"write to private field"),r?r.call(u,e):t.set(u,e),e),d=(u,t,e)=>(ce(u,t,"access private method"),e);const De=f({RAD:Math.PI/180,DEG:180/Math.PI,HPI:Math.PI/2,TAU:Math.PI*2});function f(u){for(let t in u)u[t]={value:u[t]};return Object.freeze(Object.create(null,u))}function ye(u){return De.RAD*u}function xe(u){return De.DEG*u}const Ge={CANVAS_NOT_FOUND:"CANVAS_NOT_FOUND",CONTEXT_NOT_FOUND:"CONTEXT_NOT_FOUND",COMMAND_ENCODER_NOT_FOUND:"COMMAND_ENCODER_NOT_FOUND",VERTEX_STATE_NOT_FOUND:"VERTEX_STATE_NOT_FOUND",PIPELINE_NOT_FOUND:"PIPELINE_NOT_FOUND"},Le={CANVAS_NOT_FOUND:"Failed to get a WebGPU canvas.",CONTEXT_NOT_FOUND:"Failed to get a WebGPU context.",COMMAND_ENCODER_NOT_FOUND:"Failed to get a GPUCommandEncoder.",VERTEX_STATE_NOT_FOUND:"Failed to get a GPUVertexState.",PIPELINE_NOT_FOUND:"Failed to get a GPU"},Be={CANVAS_NOT_FOUND:5,CONTEXT_NOT_FOUND:6,COMMAND_ENCODER_NOT_FOUND:7,VERTEX_STATE_NOT_FOUND:8,PIPELINE_NOT_FOUND:9},Me={RENDER_PIPELNE_NOT_FOUND:"RENDER_PIPELNE_NOT_FOUND",TEXTURE_SIZE_NOT_FOUND:"TEXTURE_SIZE_NOT_FOUND",TEXTURE_NOT_FOUND:"TEXTURE_NOT_FOUND"},we={RENDER_PIPELNE_NOT_FOUND:'"UWAL.RenderPipeline" is required in `Texture` when generating mipmaps.\n        Use `Texture.Renderer` setter before creating a ',TEXTURE_SIZE_NOT_FOUND:"`size` array or a `width` value is required in `options` parameter of ",TEXTURE_NOT_FOUND:"CopyImageToTexture `options` is required to have a `texture` value or a `create` entry."},Ie={REQUIRED_SEGMENTS:"REQUIRED_SEGMENTS"},be={REQUIRED_SEGMENTS:"Shape `segments` is required to be an integer value."};f({DEVICE_LOST:"Device::Lost"});const p=f({WEBGPU_NOT_SUPPORTED:"WEBGPU_NOT_SUPPORTED",ADAPTER_NOT_FOUND:"ADAPTER_NOT_FOUND",FEATURE_NOT_FOUND:"FEATURE_NOT_FOUND",DEVICE_NOT_FOUND:"DEVICE_NOT_FOUND",DEVICE_NOT_REQUESTED:"DEVICE_NOT_REQUESTED",DEVICE_LOST:"DEVICE_LOST",...Ge,...Me,...Ie}),me=f({WEBGPU_NOT_SUPPORTED:"WebGPU is not supported in this browser.",ADAPTER_NOT_FOUND:"Failed to get a GPUAdapter.",DEVICE_NOT_FOUND:"Failed to get a GPUDevice.",FEATURE_NOT_FOUND:"Failed to get a GPUFeature ",DEVICE_NOT_REQUESTED:"GPUDevice was not requested.",DEVICE_LOST:"WebGPU device was lost. ",...Le,...we,...be}),Ve=f({WEBGPU_NOT_SUPPORTED:0,ADAPTER_NOT_FOUND:1,DEVICE_NOT_FOUND:2,DEVICE_NOT_REQUESTED:3,DEVICE_LOST:4,...Be});function Ne(u,t){console.warn(me[u]+(t??""))}function T(u,t){throw new Error(me[u]+(t??""),{cause:Ve[u]})}var Q,w,F,y,j,Y,I,oe,Pe;class Oe{constructor(t,e,r){h(this,oe);h(this,Q);h(this,w);h(this,F);q(this,"Device");q(this,"BindGroups",[]);h(this,y);q(this,"Pipeline");q(this,"Descriptor");h(this,j);h(this,Y);h(this,I,[]);!t&&T(p.DEVICE_NOT_REQUESTED),n(this,Q,r),this.Device=t,n(this,w,e),n(this,F,this.CreatePipelineLabel("Command Encoder"))}CreatePipelineLabel(t){return i(this,w)&&t&&`${i(this,w)} ${t}`||""}CreatePipelineLayout(t,e){e??(e=this.CreatePipelineLabel(`${i(this,Q)} Pipeline Layout`));const r=Array.isArray(t)&&t||[t];return this.Device.createPipelineLayout({label:e,bindGroupLayouts:r})}CreateShaderModule(t,e,r,a){e??(e=this.CreatePipelineLabel("Shader Module"));const s=Array.isArray(t)&&t.join(`

`)||t;return this.Device.createShaderModule({label:e,code:s,sourceMap:r,compilationHints:a})}CreateBuffer(t){const e=t.label??this.CreatePipelineLabel("Buffer");return this.Device.createBuffer({...t,label:e})}WriteBuffer(t,e,r=0,a,s){this.Device.queue.writeBuffer(t,r,e,a,s)}CopyBufferToBuffer(t,e,r,a=0,s=0){this.GetCommandEncoder(!0).copyBufferToBuffer(t,a,e,s,r)}CreateBindGroupLayout(t,e){e??(e=this.CreatePipelineLabel("Bind Group Layout")),t=Array.isArray(t)&&t.map((a,s)=>({...a,binding:a.binding??s}))||[{...t,binding:t.binding??0}];const r=t;return this.Device.createBindGroupLayout({entries:r,label:e})}CreateBindGroupEntries(t,e=0){return Array.isArray(t)&&t.map((r,a)=>({binding:(e==null?void 0:e[a])??a,resource:r}))||[{binding:e,resource:t}]}CreateBindGroup(t,e=0,r){return r??(r=this.CreatePipelineLabel("Bind Group")),typeof e=="number"&&(e=this.Pipeline?this.Pipeline.getBindGroupLayout(e):T(p.PIPELINE_NOT_FOUND,`${i(this,Q)}Pipeline.`)),this.Device.createBindGroup({entries:t,label:r,layout:e})}SetBindGroups(t,e){Array.isArray(e)?e[0].length||(e=e.map(r=>[r])):e=[e],this.BindGroups=Array.isArray(t)&&t.map((r,a)=>({bindGroup:r,dynamicOffsets:e[a],active:!0}))||[{bindGroup:t,dynamicOffsets:e[0],active:!0}]}AddBindGroups(t,e){return Array.isArray(e)?e[0].length||(e=e.map(r=>[r])):e=[e],this.BindGroups.push(...Array.isArray(t)&&t.map((r,a)=>({bindGroup:r,dynamicOffsets:e[a],active:!0}))||[{bindGroup:t,dynamicOffsets:e[0],active:!0}])}SetActiveBindGroups(t){t=Array.isArray(t)&&t||[t];for(let e=this.BindGroups.length;e--;)this.BindGroups[e].active=t.includes(e)}ClearBindGroups(){this.BindGroups.splice(0)}CreateCommandEncoder(){return n(this,y,this.Device.createCommandEncoder({label:i(this,F)}))}SetCommandEncoder(t){n(this,y,t)}GetCommandEncoder(t=!1){if(!i(this,y)){if(t){const e=`${i(this,F)&&`Label: "${i(this,F)}".`}`;Ne(p.COMMAND_ENCODER_NOT_FOUND,` ${e} Creating a new one.`)}return this.CreateCommandEncoder()}return i(this,y)}SubmitCommandBuffer(){this.Device.queue.submit([i(this,y).finish()])}SavePipelineState(){n(this,Y,this.Pipeline),n(this,j,this.Descriptor),n(this,I,[...this.BindGroups])}ResetPipelineState(){this.ClearBindGroups()}RestorePipelineState(){this.Descriptor=i(this,j),this.Pipeline=i(this,Y),d(this,oe,Pe).call(this)}set CommandEncoderLabel(t){n(this,F,t)}get ProgramName(){return i(this,w)}}Q=new WeakMap,w=new WeakMap,F=new WeakMap,y=new WeakMap,j=new WeakMap,Y=new WeakMap,I=new WeakMap,oe=new WeakSet,Pe=function(){const t=i(this,I).map(({bindGroup:s})=>s),e=i(this,I).map(({dynamicOffsets:s})=>s),r=e.some(s=>typeof s=="number")&&e||void 0,a=i(this,I).map(({active:s},o)=>s&&o).filter(s=>typeof s=="number");this.SetBindGroups(t,r),this.SetActiveBindGroups(a)};f({ALL:"all",STENCIL:"stencil-only",DEPTH:"depth-only"});const We=f({CLAMP:"clamp-to-edge",REPEAT:"repeat",MIRROR:"mirror-repeat"}),Te=f({NEAREST:"nearest",LINEAR:"linear"});f({NEVER:"never",LESS:"less",EQUAL:"equal",LESS_EQUAL:"less-equal",GREATER:"greater",NOT_EQUAL:"not-equal",GREATER_EQUAL:"greater-equal",ALWAYS:"always"});var $e="const QUAD=array(vec2f(-1.0,-1.0),vec2f(1.0,-1.0),vec2f(1.0,1.0),vec2f(1.0,1.0),vec2f(-1.0,1.0),vec2f(-1.0,-1.0));fn GetQuadCoord(index: u32)->vec2f{return QUAD[index];}struct VertexOutput{@builtin(position)position: vec4f,@location(0)textureCoord: vec2f};@group(0)@binding(0)var Sampler: sampler;@group(0)@binding(1)var Texture: texture_2d<f32>;@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {let position=GetQuadCoord(index);let coord=(position+1)*0.5;var output: VertexOutput;output.position=vec4f(position,0.0,1.0);output.textureCoord=vec2f(coord.x,1-coord.y);return output;}@fragment fn fragment(@location(0)textureCoord: vec2f)->@location(0)vec4f {return textureSample(Texture,Sampler,textureCoord);}",R,X,v,x,G,l,N,Re,se,le,Ee;class Ae{constructor(t,e){h(this,N);h(this,R);h(this,X);h(this,v);h(this,x);h(this,G);h(this,l);!t&&T(p.DEVICE_NOT_REQUESTED),n(this,X,e),n(this,R,t)}CreateTexture(t){const e=t.label??d(this,N,Re).call(this,"Texture");return i(this,R).createTexture({...t,label:e})}WriteTexture(t,e){const{texture:r,mipLevel:a,origin:s,aspect:o,offset:E,bytesPerRow:m,rowsPerImage:P}=e;i(this,R).queue.writeTexture({texture:r,mipLevel:a,origin:s,aspect:o},t,{offset:E,bytesPerRow:m,rowsPerImage:P},d(this,N,le).call(this,e,"WriteTexture"))}CreateBitmapImage(t,e){return createImageBitmap(t,e)}CreateTextureFromSource(t,e){const r=e.mipLevelCount??(e.mipmaps&&this.GetMipmapLevels(t)||void 0),a=e.size,s=e.size,o=Array.isArray(e.size)||!e.size?a??d(this,N,se).call(this,t):[s.width,s.height];return this.CreateTexture({mipLevelCount:r,size:o,...e})}ImportExternalTexture(t,e,r){return i(this,R).importExternalTexture({source:t,label:e,colorSpace:r})}CreateMultisampleTexture(t=!1,e=4,r){var E;!i(this,l)&&T(p.RENDER_PIPELNE_NOT_FOUND,"multisample texture.");const{width:a,height:s,format:o}=i(this,l).CurrentTexture;return(t||!i(this,v)||i(this,v).width!==a||i(this,v).height!==s)&&((E=i(this,v))==null||E.destroy(),n(this,v,this.CreateTexture({usage:GPUTextureUsage.RENDER_ATTACHMENT,label:r??"Multisample Texture",size:[a,s],sampleCount:e,format:o}))),i(this,v)}CopyImageToTexture(t,e){let{texture:r}=e;const[a,s]=d(this,N,se).call(this,t),{create:o,flipY:E,mipLevel:m,aspect:P,colorSpace:he,premultipliedAlpha:ue,generateMipmaps:ve=!0}=e;return!r&&!o&&T(p.TEXTURE_NOT_FOUND),r??(r=this.CreateTextureFromSource(t,o)),i(this,R).queue.copyExternalImageToTexture({source:t,origin:e.sourceOrigin,flipY:E},{texture:r,mipLevel:m,origin:e.destinationOrigin,aspect:P,colorSpace:he,premultipliedAlpha:ue},d(this,N,le).call(this,{width:a,height:s,...e},"CopyImageToTexture")),ve&&1<r.mipLevelCount&&(r.depthOrArrayLayers===1?this.GenerateMipmaps(r):this.GenerateCubeMipmaps(r)),r}GenerateCubeMipmaps(t){d(this,N,Ee).call(this,t,{minMagFilter:Te.LINEAR},e=>{for(let r=0;r<t.depthOrArrayLayers;++r)i(this,l).SetBindGroups(i(this,l).CreateBindGroup(i(this,l).CreateBindGroupEntries([i(this,x),t.createView({arrayLayerCount:1,baseArrayLayer:r,mipLevelCount:1,dimension:"2d",baseMipLevel:e})]))),i(this,l).CreatePassDescriptor(i(this,l).CreateColorAttachment(t.createView({baseMipLevel:e+1,arrayLayerCount:1,baseArrayLayer:r,mipLevelCount:1,dimension:"2d"}))),i(this,l).Render(6,!1),i(this,l).DestroyCurrentPass()})}GenerateMipmaps(t){d(this,N,Ee).call(this,t,{minFilter:Te.LINEAR},e=>{i(this,l).SetBindGroups(i(this,l).CreateBindGroup(i(this,l).CreateBindGroupEntries([i(this,x),t.createView({baseMipLevel:e++,mipLevelCount:1})]))),i(this,l).CreatePassDescriptor(i(this,l).CreateColorAttachment(t.createView({baseMipLevel:e,mipLevelCount:1}))),i(this,l).Render(6,!1),i(this,l).DestroyCurrentPass()})}CreateSampler(t){if(!t)return i(this,R).createSampler();const{addressModeUV:e,addressMode:r,minMagFilter:a,filter:s}=t;return e&&(t.addressModeU=t.addressModeV=e),r&&(t.addressModeU=t.addressModeV=t.addressModeW=r),a&&(t.minFilter=t.magFilter=a),s&&(t.minFilter=t.magFilter=t.mipmapFilter=s),i(this,R).createSampler(t)}GetMipmapLevels(t){const[e,r]=d(this,N,se).call(this,t);return(Math.log2(Math.max(e,r))|0)+1}set Renderer(t){n(this,l,t)}SetRenderer(t){this.Renderer=t}}R=new WeakMap,X=new WeakMap,v=new WeakMap,x=new WeakMap,G=new WeakMap,l=new WeakMap,N=new WeakSet,Re=function(t){return i(this,X)&&t&&`${i(this,X)} ${t}`||""},se=function(t){return t instanceof HTMLVideoElement?[t.videoWidth,t.videoHeight]:t instanceof VideoFrame?[t.codedWidth,t.codedHeight]:[t.width,t.height]},le=function(t,e){const{size:r,width:a,height:s,depthOrArrayLayers:o}=t;return!r&&!a&&T(p.TEXTURE_SIZE_NOT_FOUND,`\`${e}\` method.`),r??{width:a,height:s,depthOrArrayLayers:o}},Ee=function(t,e,r){!i(this,l)&&T(p.RENDER_PIPELNE_NOT_FOUND,"texture with mipmaps."),(!i(this,G)||!i(this,x))&&(n(this,G,i(this,l).CreateShaderModule($e)),n(this,x,this.CreateSampler(e)));let a=0,s=t.width,o=t.height;for(i(this,l).SavePipelineState(),i(this,l).ResetPipelineState(),i(this,l).CreatePipeline({vertex:i(this,l).CreateVertexState(i(this,G)),fragment:i(this,l).CreateFragmentState(i(this,G),void 0,i(this,l).CreateTargetState(t.format))});1<s||1<o;)s=Math.max(s*.5|0,1),o=Math.max(o*.5|0,1),r(a++);i(this,l).SubmitCommandBuffer(),i(this,l).SetCommandEncoder(void 0),i(this,l).RestorePipelineState(),n(this,G,n(this,x,void 0))};var Z,L,W,B,D,b,z,J,_,S,C,A,K,g,ee,te,re,ie,M,$,pe,_e;class qe extends Oe{constructor(e,r,a,s){super(e,r,"Render");h(this,$);h(this,Z);h(this,L,!1);h(this,W,new Float32Array(2));h(this,B,!1);h(this,D);h(this,b);h(this,z);h(this,J);h(this,_);h(this,S);h(this,C);h(this,A);h(this,K);h(this,g,[]);h(this,ee);h(this,te);h(this,re);h(this,ie);h(this,M);!a&&T(p.CANVAS_NOT_FOUND);const o=a.getContext("webgpu");!o&&T(p.CONTEXT_NOT_FOUND),o.configure({device:e,...s}),n(this,z,this.CreateBuffer({size:i(this,W).length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:"Render Pipeline Resolution Buffer"})),n(this,D,a),n(this,b,o),d(this,$,pe).call(this),n(this,K,s.format)}SetCanvasSize(e,r){!this.Device&&T(p.DEVICE_NOT_FOUND),!i(this,D)&&T(p.CANVAS_NOT_FOUND);const{maxTextureDimension2D:a}=this.Device.limits;e=Math.max(1,Math.min(e,a)),r=Math.max(1,Math.min(r,a)),(i(this,D).width!==e||i(this,D).height!==r)&&(i(this,D).width=e,i(this,D).height=r,d(this,$,pe).call(this))}CreateColorAttachment(e,r="clear",a="store",s,o,E){return{view:e,loadOp:r,storeOp:a,clearValue:s,resolveTarget:o,depthSlice:E}}CreateDepthAttachment(e,r=1,a="clear",s="store",o){return n(this,B,!0),n(this,J,new Ae(this.Device,"Depth Texture")),{view:e,depthClearValue:r,depthLoadOp:a,depthStoreOp:s,depthReadOnly:o}}CreateStencilAttachment(e,r="clear",a="store",s){return{stencilClearValue:e,stencilLoadOp:r,stencilStoreOp:a,stencilReadOnly:s}}CreatePassDescriptor(e,r,a,s,o,E){const m=Array.isArray(e)&&e||[e];return n(this,L,!m.some(({view:P})=>!!P)),r??(r=this.CreatePipelineLabel("Render Pass")),this.Descriptor={colorAttachments:m,depthStencilAttachment:a,occlusionQuerySet:s,timestampWrites:o,maxDrawCount:E,label:r}}CreateVertexBufferAttribute(e,r=0,a=0){return{format:e,shaderLocation:r,offset:a}}CreateVertexState(e,r="vertex",a,s){return a=Array.isArray(a)&&a||[a],{module:e,entryPoint:r,buffers:a,constants:s}}CreateBlendComponent(e="add",r="src-alpha",a="one"){return{operation:e,srcFactor:r,dstFactor:a}}CreateBlendState(e={},r={}){return{color:e,alpha:r}}CreateTargetState(e=i(this,K),r,a){return{format:e,blend:r,writeMask:a}}CreateFragmentState(e,r="fragment",a,s){return a??(a=this.CreateTargetState()),a=Array.isArray(a)&&a||[a],{module:e,entryPoint:r,targets:a,constants:s}}CreateStencilFaceState(e,r,a,s){return{compare:e,failOp:r,depthFailOp:a,passOp:s}}CreateDepthStencilState(e="depth24plus",r=!0,a="less",s,o,E,m,P,he,ue){return{format:e,depthWriteEnabled:r,depthCompare:a,stencilFront:s,stencilBack:o,stencilReadMask:E,stencilWriteMask:m,depthBias:P,depthBiasSlopeScale:he,depthBiasClamp:ue}}CreateMultisampleState(e=4,r,a){return{count:e,mask:r,alphaToCoverageEnabled:a}}CreatePipeline(e){const r=e.layout??"auto";let{module:a,vertex:s,fragment:o}=e;a&&(s??(s=this.CreateVertexState(a)),o??(o=this.CreateFragmentState(a))),!a&&!s&&T(p.VERTEX_STATE_NOT_FOUND);const E=e.label??this.CreatePipelineLabel("Render Pipeline");return this.Pipeline=this.Device.createRenderPipeline({...e,vertex:s,fragment:o,label:E,layout:r})}SavePipelineState(){super.SavePipelineState(),n(this,M,i(this,A)),n(this,ee,i(this,g)),n(this,ie,i(this,S)),n(this,te,i(this,L)),n(this,re,i(this,B)),i(this,M)&&n(this,M,Object.values(i(this,M)))}ResetPipelineState(){super.ResetPipelineState(),n(this,L,!1),n(this,B,!1),this.SetIndexBuffer(n(this,S,void 0))}RestorePipelineState(){super.RestorePipelineState(),n(this,g,i(this,ee)),n(this,S,i(this,ie)),n(this,L,i(this,te)),n(this,B,i(this,re)),this.SetIndexBuffer(...Array.isArray(i(this,M))&&i(this,M)||[void 0])}SetVertexBuffers(e,r,a){r=Array.isArray(r)&&r||[r],a=Array.isArray(a)&&a||[a],n(this,g,Array.isArray(e)&&e.map((s,o)=>({buffer:s,offset:r[o],size:a[o]}))||[{buffer:e,offset:r[0],size:a[0]}])}AddVertexBuffers(e,r,a){r=Array.isArray(r)&&r||[r],a=Array.isArray(a)&&a||[a],i(this,g).push(...Array.isArray(e)&&e.map((s,o)=>({buffer:s,offset:r[o],size:a[o]}))||[{buffer:e,offset:r[0],size:a[0]}])}SetIndexBuffer(e,r="uint32",a,s){n(this,A,e&&{buffer:e,format:r,offset:a,size:s})}Render(e,r=!0){i(this,B)&&d(this,$,_e).call(this),i(this,C)||(i(this,S)?(this.Descriptor.colorAttachments[0].view=i(this,S).createView(),this.Descriptor.colorAttachments[0].resolveTarget=this.CurrentTextureView):i(this,L)&&(this.Descriptor.colorAttachments[0].view=this.CurrentTextureView),n(this,C,this.GetCommandEncoder().beginRenderPass(this.Descriptor)),i(this,C).setPipeline(this.Pipeline),n(this,Z,i(this,A)?i(this,C).drawIndexed.bind(i(this,C)):i(this,C).draw.bind(i(this,C))));for(let a=0,s=i(this,g).length;a<s;++a){const{buffer:o,offset:E,size:m}=i(this,g)[a];i(this,C).setVertexBuffer(a,o,E,m)}i(this,A)&&i(this,C).setIndexBuffer(i(this,A).buffer,i(this,A).format,i(this,A).offset,i(this,A).size);for(let a=0,s=0,o=this.BindGroups.length;a<o;++a){const{bindGroup:E,dynamicOffsets:m,active:P}=this.BindGroups[a];P&&i(this,C).setBindGroup(s++,E,m)}i(this,Z).call(this,...Array.isArray(e)&&e||[e]),r&&this.Submit()}DestroyCurrentPass(){var e;(e=i(this,C))==null||e.end(),n(this,C,void 0)}Submit(){this.DestroyCurrentPass(),this.SubmitCommandBuffer(),this.SetCommandEncoder(void 0)}Destroy(){var e;this.DestroyCurrentPass(),(e=i(this,b))==null||e.unconfigure()}get Canvas(){return i(this,D)}get Context(){return i(this,b)}get AspectRatio(){return!i(this,D)&&T(p.CANVAS_NOT_FOUND),i(this,D).width/i(this,D).height}get DepthTexture(){return i(this,_)}get CurrentTexture(){return i(this,b).getCurrentTexture()}get CurrentTextureView(){return this.CurrentTexture.createView()}set MultisampleTexture(e){n(this,S,e)}get MultisampleTexture(){return i(this,S)}get ResolutionBuffer(){return i(this,z)}get CurrentPass(){return i(this,C)}}Z=new WeakMap,L=new WeakMap,W=new WeakMap,B=new WeakMap,D=new WeakMap,b=new WeakMap,z=new WeakMap,J=new WeakMap,_=new WeakMap,S=new WeakMap,C=new WeakMap,A=new WeakMap,K=new WeakMap,g=new WeakMap,ee=new WeakMap,te=new WeakMap,re=new WeakMap,ie=new WeakMap,M=new WeakMap,$=new WeakSet,pe=function(){i(this,W).set([i(this,D).width,i(this,D).height]),this.WriteBuffer(i(this,z),i(this,W))},_e=function(){var s;const e=this.CurrentTexture,{width:r,height:a}=e;(!i(this,_)||i(this,_).width!==r||i(this,_).height!==a)&&((s=i(this,_))==null||s.destroy(),n(this,_,i(this,J).CreateTextureFromSource(e,{usage:GPUTextureUsage.RENDER_ATTACHMENT,format:"depth24plus"}))),this.Descriptor.depthStencilAttachment.view=i(this,_).createView()};var ae;class Qe extends Oe{constructor(e,r){super(e,r,"Compute");h(this,ae,[1])}CreatePassDescriptor(e,r,a,s){return e??(e=this.CreatePipelineLabel("Compute Pass")),this.Descriptor={label:e,timestampWrites:r?{querySet:r,beginningOfPassWriteIndex:a,endOfPassWriteIndex:s}:void 0}}SetPassDescriptor(e){this.Descriptor=e}CreatePipeline(e){const r=e.layout??"auto",a=e.label??this.CreatePipelineLabel("Compute Pipeline");return this.Pipeline=this.Device.createComputePipeline({label:a,layout:r,compute:e})}Compute(e=!1){const r=this.GetCommandEncoder().beginComputePass(this.Descriptor);r.setPipeline(this.Pipeline);for(let a=0,s=0,o=this.BindGroups.length;a<o;++a){const{bindGroup:E,dynamicOffsets:m,active:P}=this.BindGroups[a];P&&r.setBindGroup(s++,E,m)}r.dispatchWorkgroups(...i(this,ae)),r.end(),e&&this.Submit()}Submit(){this.SubmitCommandBuffer(),this.SetCommandEncoder(void 0)}set Workgroups(e){n(this,ae,Array.isArray(e)&&e||[e])}}ae=new WeakMap;/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.6
 * @license MIT
 */var V,H,k,U,O,ne,Se,Ue,fe;const c=class c{static RenderPipeline(t,e="",r={}){return r.format??(r.format=c.PreferredCanvasFormat),d(this,O,ne).call(this,e),(async()=>{const a=await c.Device;return new Proxy(qe,{construct(s){return new s(a,e,t,r)}})})()}static ComputePipeline(t=""){return d(this,O,ne).call(this,t),(async()=>{const e=await c.Device;return new Proxy(Qe,{construct(r){return new r(e,t)}})})()}static Texture(t=""){return d(this,O,ne).call(this,t),(async()=>{const e=await c.Device;return new Proxy(Ae,{construct(r){return new r(e,t)}})})()}static Destroy(t,e,r){var a;t=Array.isArray(t)&&t||[t],t.forEach(s=>s==null?void 0:s.destroy()),e=Array.isArray(e)&&e||[e],e.forEach(s=>s==null?void 0:s.destroy()),r=Array.isArray(r)&&r||[r],r.forEach(s=>s==null?void 0:s.destroy()),(a=i(c,V))==null||a.destroy(),n(c,H,n(c,V,null)),c.PowerPreference=c.ForceFallbackAdapter=void 0,c.DescriptorLabel=i(c,U).requiredFeatures=c.RequiredLimits=void 0}static set PowerPreference(t){i(c,k).powerPreference=t}static set ForceFallbackAdapter(t){i(c,k).forceFallbackAdapter=t}static set DescriptorLabel(t){i(c,U).label=t}static async SetRequiredFeatures(t){const e=(await c.Adapter).features,r=i(c,U).requiredFeatures??[];return t=Array.isArray(t)&&t||[t],t.forEach(a=>e.has(a)?r.push(a):Ne(p.FEATURE_NOT_FOUND,`"${a}".
It will be skipped when requesting a GPUDevice.`)),i(c,U).requiredFeatures=r}static set RequiredLimits(t){i(c,U).requiredLimits=t}static get PreferredCanvasFormat(){return!navigator.gpu&&T(p.WEBGPU_NOT_SUPPORTED),navigator.gpu.getPreferredCanvasFormat()}static get Adapter(){return(async()=>{var t;return i(c,H)??await d(t=c,O,Ue).call(t)()})()}static get Device(){return(async()=>{var t;return i(c,V)??await d(t=c,O,fe).call(t)()})()}static get VERSION(){return"0.0.6"}};V=new WeakMap,H=new WeakMap,k=new WeakMap,U=new WeakMap,O=new WeakSet,ne=function(t){var e;(e=i(c,U)).label??(e.label=t&&`${t} Device`||"")},Se=function(t){if(c.OnDeviceLost)return c.OnDeviceLost(t);const e=(t.message&&` | Message: ${t.message}`)??".";T(p.DEVICE_LOST,`Reason: ${t.reason}`+e)},Ue=function(){return!navigator.gpu&&T(p.WEBGPU_NOT_SUPPORTED),async()=>{const t=await navigator.gpu.requestAdapter(i(c,k));return!t&&T(p.ADAPTER_NOT_FOUND),n(c,H,t)}},fe=function(){return async()=>{const{requiredFeatures:t,requiredLimits:e,label:r}=i(c,U),a=await(await c.Adapter).requestDevice({requiredFeatures:t,requiredLimits:e,defaultQueue:{label:r}});return!a&&T(p.DEVICE_NOT_FOUND),a.lost.then(d(c,O,Se)),n(c,V,a)}},h(c,O),h(c,V,null),h(c,H,null),h(c,k,{powerPreference:void 0,forceFallbackAdapter:!1}),q(c,"OnDeviceLost"),h(c,U,{label:void 0,requiredFeatures:void 0,requiredLimits:void 0});let Ce=c;f({TRIANGLE:3,SQUARE:4,PENTAGON:5,HEXAGON:6,HEPTAGON:7,OCTAGON:8,NONAGON:9,DECAGON:10,DODECAGON:12});const ze={DegreesToRadians:ye,RadiansToDegrees:xe};console.info("%cUWAL v0.0.6","background:#005a9c;padding:3px;color:#fff;");export{We as A,Te as F,Ce as U,ze as a};
