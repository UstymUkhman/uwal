var L=a=>{throw TypeError(a)};var I=(a,e,i)=>e.has(a)||L("Cannot "+i);var t=(a,e,i)=>(I(a,e,"read from private field"),i?i.call(a):e.get(a)),s=(a,e,i)=>e.has(a)?L("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(a):e.set(a,i),r=(a,e,i,n)=>(I(a,e,"write to private field"),n?n.call(a,i):e.set(a,i),i),A=(a,e,i)=>(I(a,e,"access private method"),i);import{a as Y,T as z,E as H,N as J}from"./index-oaqckAdJ.js";import{m as l,v as j}from"./wgpu-matrix.module-BvIiWEhL.js";var tt="struct Shape{color: vec4f,matrix: mat3x3f};@group(0)@binding(0)var<uniform>resolution: vec2f;fn GetClipSpace(position: vec2f)->vec2f{let clipSpace=position/resolution*2-1;return clipSpace*vec2f(1,-1);}@group(0)@binding(1)var<uniform>shape: Shape;fn GetVertexClipSpace(position: vec2f)->vec4f{let matrixPosition=shape.matrix*vec3f(position,1);let clipSpace=GetClipSpace(matrixPosition.xy);return vec4f(clipSpace,0,1);}@vertex fn vertex(@location(0)position: vec2f)->@builtin(position)vec4f {return GetVertexClipSpace(position);}",f,b,x,T,V,M,w,S,m,U,h,y,o,d,g,B,F,C,u,P,E,G,v,c,Q,k,q,N;class et{constructor(e){s(this,c);s(this,f);s(this,b,0);s(this,x,!1);s(this,T,l.create());s(this,V,l.create());s(this,M,l.create());s(this,w,l.create());s(this,S);s(this,m);s(this,U);s(this,h);s(this,y);s(this,o);s(this,d);s(this,g);s(this,B);s(this,F);s(this,C,new Float32Array([1,1]));s(this,u,new Float32Array([0,0]));s(this,P,new Float32Array([0,0]));s(this,E,new Float32Array([0,0]));s(this,G);s(this,v,Y({min:j.create(),max:j.create()}));!e.segments&&z(H.REQUIRED_SEGMENTS),r(this,S,e.label??"Shape"),r(this,f,e.radius??0),r(this,h,e.renderer),r(this,m,e.segments);const{startAngle:i,endAngle:n,innerRadius:p}=e;A(this,c,Q).call(this,i,n,p),A(this,c,k).call(this),A(this,c,q).call(this),this.Scale=t(this,C),this.Origin=t(this,u),this.Rotation=t(this,b),this.Position=t(this,E)}Update(){return t(this,h).SetVertexBuffers(t(this,g)),t(this,h).SetIndexBuffer(t(this,d)),t(this,h).SetBindGroups(t(this,F)),A(this,c,N).call(this)}Render(e=!0){t(this,h).SavePipelineState(),t(this,h).Render(t(this.Update(),U),e),t(this,h).RestorePipelineState()}set Color(e){t(this,y).set(Array.isArray(e)||ArrayBuffer.isView(e)?e:e.rgba),t(this,h).WriteBuffer(t(this,B),t(this,y),t(this,G).color)}get Color(){return t(this,y)}set Position(e){t(this,E).set(e),l.translation(t(this,E),t(this,w)),r(this,x,!0)}get Position(){return t(this,E)}set Rotation(e){l.rotation(r(this,b,e),t(this,M)),r(this,x,!0)}get Rotation(){return t(this,b)}set Scale(e){t(this,C).set(e),l.scaling(t(this,C),t(this,V)),r(this,x,!0)}get Scale(){return t(this,C)}set Origin(e){t(this,u)[0]=e[0],t(this,u)[1]=e[1],t(this,u)[0]*=-t(this,f),t(this,u)[1]*=-t(this,f),l.translation(t(this,u),t(this,T)),t(this,u)[0]=e[0]||0,t(this,u)[1]=e[1]||0,r(this,x,!0)}get Origin(){return t(this,u)}get Center(){return t(A(this,c,N).call(this),P)}get Vertices(){return t(this,U)}get Transform(){return t(this,o)}get BoundingBox(){return t(this,v)}Destroy(){r(this,d,t(this,d).destroy()),r(this,g,t(this,g).destroy()),r(this,B,t(this,B).destroy())}}f=new WeakMap,b=new WeakMap,x=new WeakMap,T=new WeakMap,V=new WeakMap,M=new WeakMap,w=new WeakMap,S=new WeakMap,m=new WeakMap,U=new WeakMap,h=new WeakMap,y=new WeakMap,o=new WeakMap,d=new WeakMap,g=new WeakMap,B=new WeakMap,F=new WeakMap,C=new WeakMap,u=new WeakMap,P=new WeakMap,E=new WeakMap,G=new WeakMap,v=new WeakMap,c=new WeakSet,Q=function(e=0,i=J.TAU,n=0){const p=i-e,R=new Float32Array((t(this,m)+1)*2*3);for(let O=0,_=0;_<=t(this,m);++_){const D=e+_*p/t(this,m),W=Math.cos(D),$=Math.sin(D);R[O++]=W*t(this,f),R[O++]=$*t(this,f),R[O++]=W*n,R[O++]=$*n}r(this,g,t(this,h).CreateVertexBuffer(R,{label:`${t(this,S)} Vertex Buffer`})),t(this,h).WriteBuffer(t(this,g),R)},k=function(){const e=new Uint32Array(r(this,U,t(this,m)*6));for(let i=0,n=0;n<t(this,m);++n){const p=n*2;e[i++]=p+1,e[i++]=p+3,e[i++]=p+2,e[i++]=p+2,e[i++]=p+0,e[i++]=p+1}r(this,d,t(this,h).CreateIndexBuffer(e,{label:`${t(this,S)} Index Buffer`})),t(this,h).WriteBuffer(t(this,d),e)},q=function(){const{buffer:e,shape:{color:i,matrix:n}}=t(this,h).CreateUniformBuffer("shape",{label:`${t(this,S)} Uniform Buffer`});r(this,B,e),r(this,o,n),r(this,y,i),r(this,F,t(this,h).CreateBindGroup(t(this,h).CreateBindGroupEntries([{buffer:t(this,h).ResolutionBuffer},{buffer:t(this,B)}]),0,`${t(this,S)} Bind Group`)),r(this,G,Y({matrix:i.length*Float32Array.BYTES_PER_ELEMENT,color:0*Float32Array.BYTES_PER_ELEMENT}))},N=function(){if(t(this,x)){l.multiply(t(this,w),t(this,M),t(this,o)),l.multiply(t(this,o),t(this,V),t(this,o)),l.multiply(t(this,o),t(this,T),t(this,o)),t(this,h).WriteBuffer(t(this,B),t(this,o),t(this,G).matrix);const e=t(this,P)[0]=t(this,o)[8],i=t(this,P)[1]=t(this,o)[9];t(this,v).min[0]=e-t(this,f),t(this,v).min[1]=i-t(this,f),t(this,v).max[0]=e+t(this,f),t(this,v).max[1]=i+t(this,f),r(this,x,!1)}return this};export{tt as S,et as a};