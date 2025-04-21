var St=n=>{throw TypeError(n)};var rt=(n,e,r)=>e.has(n)||St("Cannot "+r);var t=(n,e,r)=>(rt(n,e,"read from private field"),r?r.call(n):e.get(n)),s=(n,e,r)=>e.has(n)?St("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,r),i=(n,e,r,c)=>(rt(n,e,"write to private field"),c?c.call(n,r):e.set(n,r),r),L=(n,e,r)=>(rt(n,e,"access private method"),r);import{b as Bt,N as Gt,U as Ct,C as st,a as it}from"./index-DEQUc6k7.js";import{a as x,v as At}from"./wgpu-matrix.module-CrC5GWIH.js";var Mt=`struct Shape
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(0) var<uniform> resolution: vec3f;

fn GetClipSpace(position: vec2f) -> vec2f
{
    
    let clipSpace = position / resolution.xy * 2 - 1;

    
    return clipSpace * vec2f(1, -1);
}

@group(0) @binding(1) var<uniform> shape: Shape;

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    let matrixPosition = shape.matrix * vec3f(position, 1);
    let clipSpace = GetClipSpace(matrixPosition.xy);
    return vec4f(clipSpace, 0, 1);
}

@vertex fn shapeVertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}`,p,j,S,q,Y,k,J,E,B,W,o,P,l,V,C,w,U,F,d,_,T,I,R,v,bt,Et,Vt,ot;class Ot{constructor(e){s(this,v);s(this,p);s(this,j,0);s(this,S,!1);s(this,q,x.create());s(this,Y,x.create());s(this,k,x.create());s(this,J,x.create());s(this,E);s(this,B);s(this,W);s(this,o);s(this,P);s(this,l);s(this,V);s(this,C);s(this,w,[]);s(this,U,[void 0]);s(this,F,new Float32Array([1,1]));s(this,d,new Float32Array([0,0]));s(this,_,new Float32Array([0,0]));s(this,T,new Float32Array([0,0]));s(this,I);s(this,R,Bt({min:At.create(),max:At.create()}));i(this,E,e.label??"Shape"),i(this,p,e.radius??0),i(this,o,e.renderer),i(this,B,e.segments);const{startAngle:r,endAngle:c,innerRadius:u}=e;L(this,v,bt).call(this,r,c,u),L(this,v,Et).call(this),L(this,v,Vt).call(this),this.Scale=t(this,F),this.Origin=t(this,d),this.Rotation=t(this,j),this.Position=t(this,T)}Update(){return t(this,o).SetVertexBuffers(t(this,w)),t(this,o).SetIndexBuffer(t(this,V)),t(this,o).SetBindGroups(t(this,U)),L(this,v,ot).call(this)}Render(e=!0){t(this,o).SavePipelineState(),t(this,o).Render(t(this.Update(),W),e),t(this,o).RestorePipelineState()}AddBindGroups(e){t(this,U).push(...Array.isArray(e)&&e||[e])}AddVertexBuffers(e){t(this,w).push(...Array.isArray(e)&&e||[e])}set Color(e){t(this,P).set(Array.isArray(e)||ArrayBuffer.isView(e)?e:e.rgba),t(this,o).WriteBuffer(t(this,C),t(this,P),t(this,I).color)}get Color(){return t(this,P)}set Position(e){t(this,T).set(e),x.translation(t(this,T),t(this,J)),i(this,S,!0)}get Position(){return t(this,T)}set Rotation(e){x.rotation(i(this,j,e),t(this,k)),i(this,S,!0)}get Rotation(){return t(this,j)}set Scale(e){t(this,F).set(e),x.scaling(t(this,F),t(this,Y)),i(this,S,!0)}get Scale(){return t(this,F)}set Origin(e){t(this,d)[0]=e[0],t(this,d)[1]=e[1],t(this,d)[0]*=-t(this,p),t(this,d)[1]*=-t(this,p),x.translation(t(this,d),t(this,q)),t(this,d)[0]=e[0]||0,t(this,d)[1]=e[1]||0,i(this,S,!0)}get Origin(){return t(this,d)}get Center(){return t(L(this,v,ot).call(this),_)}get Vertices(){return t(this,W)}get Transform(){return t(this,l)}get BoundingBox(){return t(this,R)}Destroy(){t(this,w).forEach(e=>e.destroy()),i(this,C,t(this,C).destroy()),i(this,V,t(this,V).destroy()),t(this,w).splice(0),t(this,U).splice(0)}}p=new WeakMap,j=new WeakMap,S=new WeakMap,q=new WeakMap,Y=new WeakMap,k=new WeakMap,J=new WeakMap,E=new WeakMap,B=new WeakMap,W=new WeakMap,o=new WeakMap,P=new WeakMap,l=new WeakMap,V=new WeakMap,C=new WeakMap,w=new WeakMap,U=new WeakMap,F=new WeakMap,d=new WeakMap,_=new WeakMap,T=new WeakMap,I=new WeakMap,R=new WeakMap,v=new WeakSet,bt=function(e=0,r=Gt.TAU,c=0){const u=r-e,A=new Float32Array((t(this,B)+1)*2*3);for(let M=0,O=0;O<=t(this,B);++O){const y=e+O*u/t(this,B),N=Math.cos(y),h=Math.sin(y);A[M++]=N*t(this,p),A[M++]=h*t(this,p),A[M++]=N*c,A[M++]=h*c}const K=t(this,o).CreateVertexBuffer(A,{label:`${t(this,E)} Vertex Buffer`});t(this,o).WriteBuffer(K,A),t(this,w).push(K)},Et=function(){const e=new Uint32Array(i(this,W,t(this,B)*6));for(let r=0,c=0;c<t(this,B);++c){const u=c*2;e[r++]=u+1,e[r++]=u+3,e[r++]=u+2,e[r++]=u+2,e[r++]=u+0,e[r++]=u+1}i(this,V,t(this,o).CreateIndexBuffer(e,{label:`${t(this,E)} Index Buffer`})),t(this,o).WriteBuffer(t(this,V),e)},Vt=function(){const{buffer:e,shape:{color:r,matrix:c}}=t(this,o).CreateUniformBuffer("shape",{label:`${t(this,E)} Uniform Buffer`});i(this,C,e),i(this,l,c),i(this,P,r),t(this,U)[0]=t(this,o).CreateBindGroup(t(this,o).CreateBindGroupEntries([{buffer:t(this,o).ResolutionBuffer},{buffer:t(this,C)}]),0,`${t(this,E)} Bind Group`),i(this,I,Bt({matrix:r.length*Float32Array.BYTES_PER_ELEMENT,color:0*Float32Array.BYTES_PER_ELEMENT}))},ot=function(){if(t(this,S)){x.multiply(t(this,J),t(this,k),t(this,l)),x.multiply(t(this,l),t(this,Y),t(this,l)),x.multiply(t(this,l),t(this,q),t(this,l)),t(this,o).WriteBuffer(t(this,C),t(this,l),t(this,I).matrix);const e=t(this,_)[0]=t(this,l)[8],r=t(this,_)[1]=t(this,l)[9];t(this,R).min[0]=e-t(this,p),t(this,R).min[1]=r-t(this,p),t(this,R).max[0]=e+t(this,p),t(this,R).max[1]=r+t(this,p),i(this,S,!1)}return this};/**
 * @module NonNegativeRollingAverage
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description We disallow negative values as this is used for timestamp queries
 * where it's possible for a query to return a beginning time greater than
 * the end time. {@link https://gpuweb.github.io/gpuweb/#timestamp}
 * @version 0.0.11
 * @license MIT
 */var Q,H,G,$;class nt{constructor(e=30){s(this,Q,0);s(this,H,0);s(this,G,0);s(this,$,[]);i(this,Q,e)}addSample(e){if(Number.isFinite(e)&&!Number.isNaN(e)&&0<=e){const r=t(this,$)[t(this,G)]||0;i(this,H,t(this,H)+(e-r)),t(this,$)[t(this,G)]=e,i(this,G,(t(this,G)+1)%t(this,Q))}}get(){return t(this,H)/t(this,$).length}}Q=new WeakMap,H=new WeakMap,G=new WeakMap,$=new WeakMap;var Nt=`struct VertexOutput\r
{\r
    @builtin(position) position: vec4f,\r
    @location(0) color: vec4f\r
};

@vertex fn vertex(\r
    @location(0) position: vec2f,\r
    @location(1) color: vec4f,\r
    @location(2) offset: vec2f,\r
    @location(3) scale: vec2f,\r
    @location(4) vertexColor: vec4f\r
) -> VertexOutput\r
{\r
    var output: VertexOutput;\r
    let clipSpace = GetVertexClipSpace(position * scale).xy;

    output.position = vec4f(\r
        clipSpace + (offset + 0.9) /\r
        1.8 * vec2f(2, -2),\r
        0.0, 1.0\r
    );

    output.color = color * vertexColor;

    return output;\r
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f\r
{\r
    return color;\r
}`;/**
 * @module Timing Performance
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Timing Performance
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.9
 * @license MIT
 */(async function(n){let e,r=0;try{await Ct.SetRequiredFeatures("timestamp-query"),e=new(await Ct.RenderPipeline(n,"Timing Performance"))}catch(a){alert(a)}const c=24,u=0,A=0,K=2,M=new GUI,O=[],y=1e4,N={objects:100};M.add(N,"objects",0,y,1);const h=document.createElement("pre"),at=document.createElement("span"),ct=document.createElement("span"),ft=document.createElement("span");h.style.backgroundColor="rgb(0 0 0 / 0.8)",h.style.position="absolute",h.style.padding="0.5em",h.style.display="grid",h.style.color="white",h.style.margin="0px",h.style.left="0px",h.style.top="0px",h.append(at,ct,ft),document.body.appendChild(h);const ht=new nt,lt=new nt,ut=new nt,pt=e.CreateShaderModule([Mt,Nt]),dt=e.CreateColorAttachment();dt.clearValue=new st(5000268).rgba;const tt=new it.GPUTiming(e),wt=await tt.QuerySet;e.CreatePassDescriptor(dt,void 0,void 0,void 0,e.CreateTimestampWrites(wt,0,1));const Rt=e.CreateVertexBufferLayout("position"),{buffer:X,layout:Pt}=e.CreateVertexBuffer([{name:"color",format:"unorm8x4"}],y,"instance"),{buffer:Z,layout:Ut}=e.CreateVertexBuffer(["offset","scale"],y,"instance"),{buffer:mt,layout:Ft}=e.CreateVertexBuffer({name:"vertexColor",format:"unorm8x4"},y);e.CreatePipeline({fragment:e.CreateFragmentState(pt),vertex:e.CreateVertexState(pt,void 0,[Rt,Pt,Ut,Ft])});const Tt=new Ot({renderer:e,innerRadius:120,radius:240,segments:c}).Update().Vertices,et=new Float32Array(Z.size/Float32Array.BYTES_PER_ELEMENT);e.AddVertexBuffers([X,Z,mt]);{const a=X.size/y,f=new Uint8Array(X.size);for(let m=0;m<y;++m)f.set([b(255),b(255),b(255),255],a*m+u),O.push({scale:b(.2,.5),offset:[b(-.9,.9),b(-.9,.9)],velocity:[b(-.1,.1),b(-.1,.1)]});e.WriteBuffer(X,f)}{const a=new st(1644825),f=new st(16777215),m=new Uint8Array((c+1)*8);for(let z=0,g=0;z<=c;z++,g+=8)m.set(a.RGBA,g),m.set(f.RGBA,g+4);e.WriteBuffer(mt,m)}function b(a,f){return a===void 0?(a=0,f=1):f===void 0&&(f=a,a=0),Math.random()*(f-a)+a}async function xt(a){a*=.001;const f=a-r,m=performance.now(),z=Z.size/y/4;for(let g=0;g<N.objects;g++){const{scale:vt,offset:D,velocity:yt}=O[g];D[0]=it.EuclideanModulo(D[0]+yt[0]*f+1.5,3)-1.5,D[1]=it.EuclideanModulo(D[1]+yt[1]*f+1.5,3)-1.5;const gt=g*z;et.set(D,gt+A),et.set([vt,vt],gt+K)}e.WriteBuffer(Z,et),e.Render([Tt,N.objects],!1),e.DestroyCurrentPass(),ht.addSample(1/f),ut.addSample(performance.now()-m),tt.ResolveAndSubmit().then(g=>lt.addSample(g/1e3)),at.textContent=`FPS: ${ht.get().toFixed(1)}`,ft.textContent=`JS: ${ut.get().toFixed(1)}ms`,ct.textContent=`GPU: ${tt.Enabled&&`${lt.get().toFixed(1)}µs`||"N/A"}`,requestAnimationFrame(xt),r=a}new ResizeObserver(a=>{for(const f of a){const{inlineSize:m,blockSize:z}=f.contentBoxSize[0];e.SetCanvasSize(m,z)}requestAnimationFrame(xt)}).observe(document.body)})(document.getElementById("lesson"));
