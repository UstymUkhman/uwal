var Y=n=>{throw TypeError(n)};var I=(n,i,e)=>i.has(n)||Y("Cannot "+e);var t=(n,i,e)=>(I(n,i,"read from private field"),e?e.call(n):i.get(n)),s=(n,i,e)=>i.has(n)?Y("Cannot add the same private member more than once"):i instanceof WeakSet?i.add(n):i.set(n,e),h=(n,i,e,a)=>(I(n,i,"write to private field"),a?a.call(n,e):i.set(n,e),e),b=(n,i,e)=>(I(n,i,"access private method"),e);import{m as l,a as j,v as k,N as J}from"./index-CTlcc_oC.js";var X=`struct Shape
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(0) var<uniform> resolution: vec3f;

fn GetClipSpace(position: vec2f) -> vec2f\r
{\r
    
    let clipSpace = position / resolution.xy * 2 - 1;

    
    return clipSpace * vec2f(1, -1);\r
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
}`,f,v,x,M,w,F,T,m,B,P,r,A,o,S,d,y,C,E,u,U,R,G,g,c,q,z,H,N;class Z{constructor(i){s(this,c);s(this,f);s(this,v,0);s(this,x,!1);s(this,M,l.create());s(this,w,l.create());s(this,F,l.create());s(this,T,l.create());s(this,m);s(this,B);s(this,P);s(this,r);s(this,A);s(this,o);s(this,S);s(this,d);s(this,y,[]);s(this,C,[void 0]);s(this,E,new Float32Array([1,1]));s(this,u,new Float32Array([0,0]));s(this,U,new Float32Array([0,0]));s(this,R,new Float32Array([0,0]));s(this,G);s(this,g,j({min:k.create(),max:k.create()}));h(this,m,i.label??"Shape"),h(this,f,i.radius??0),h(this,r,i.renderer),h(this,B,i.segments);const{startAngle:e,endAngle:a,innerRadius:p}=i;b(this,c,q).call(this,e,a,p),b(this,c,z).call(this),b(this,c,H).call(this),this.Scale=t(this,E),this.Origin=t(this,u),this.Rotation=t(this,v),this.Position=t(this,R)}Update(){return t(this,r).SetVertexBuffers(t(this,y)),t(this,r).SetIndexBuffer(t(this,S)),t(this,r).SetBindGroups(t(this,C)),b(this,c,N).call(this)}Render(i=!0){t(this,r).SavePipelineState(),t(this,r).Render(t(this.Update(),P),i),t(this,r).RestorePipelineState()}AddBindGroups(i){t(this,C).push(...Array.isArray(i)&&i||[i])}AddVertexBuffers(i){t(this,y).push(...Array.isArray(i)&&i||[i])}set Color(i){t(this,A).set(Array.isArray(i)||ArrayBuffer.isView(i)?i:i.rgba),t(this,r).WriteBuffer(t(this,d),t(this,A),t(this,G).color)}get Color(){return t(this,A)}set Position(i){t(this,R).set(i),l.translation(t(this,R),t(this,T)),h(this,x,!0)}get Position(){return t(this,R)}set Rotation(i){h(this,v,i),l.rotation(t(this,v),t(this,F)),h(this,x,!0)}get Rotation(){return t(this,v)}set Scale(i){t(this,E).set(i),l.scaling(t(this,E),t(this,w)),h(this,x,!0)}get Scale(){return t(this,E)}set Origin(i){t(this,u)[0]=i[0],t(this,u)[1]=i[1],t(this,u)[0]*=-t(this,f),t(this,u)[1]*=-t(this,f),l.translation(t(this,u),t(this,M)),t(this,u)[0]=i[0]||0,t(this,u)[1]=i[1]||0,h(this,x,!0)}get Origin(){return t(this,u)}get Center(){return t(b(this,c,N).call(this),U)}get Vertices(){return t(this,P)}get Transform(){return t(this,o)}get BoundingBox(){return t(this,g)}Destroy(){t(this,y).forEach(i=>i.destroy()),h(this,d,t(this,d).destroy()),h(this,S,t(this,S).destroy()),t(this,y).splice(0),t(this,C).splice(0)}}f=new WeakMap,v=new WeakMap,x=new WeakMap,M=new WeakMap,w=new WeakMap,F=new WeakMap,T=new WeakMap,m=new WeakMap,B=new WeakMap,P=new WeakMap,r=new WeakMap,A=new WeakMap,o=new WeakMap,S=new WeakMap,d=new WeakMap,y=new WeakMap,C=new WeakMap,E=new WeakMap,u=new WeakMap,U=new WeakMap,R=new WeakMap,G=new WeakMap,g=new WeakMap,c=new WeakSet,q=function(i=0,e=J.TAU,a=0){const p=e-i,V=new Float32Array((t(this,B)+1)*2*3);for(let O=0,_=0;_<=t(this,B);++_){const $=i+_*p/t(this,B),D=Math.cos($),L=Math.sin($);V[O++]=D*t(this,f),V[O++]=L*t(this,f),V[O++]=D*a,V[O++]=L*a}const W=t(this,r).CreateVertexBuffer(V,{label:`${t(this,m)} Vertex Buffer`});t(this,r).WriteBuffer(W,V),t(this,y).push(W)},z=function(){const i=new Uint32Array(h(this,P,t(this,B)*6));for(let e=0,a=0;a<t(this,B);++a){const p=a*2;i[e++]=p+1,i[e++]=p+3,i[e++]=p+2,i[e++]=p+2,i[e++]=p+0,i[e++]=p+1}h(this,S,t(this,r).CreateIndexBuffer(i,{label:`${t(this,m)} Index Buffer`})),t(this,r).WriteBuffer(t(this,S),i)},H=function(){const{buffer:i,shape:{color:e,matrix:a}}=t(this,r).CreateUniformBuffer("shape",{label:`${t(this,m)} Uniform Buffer`});h(this,d,i),h(this,o,a),h(this,A,e),t(this,C)[0]=t(this,r).CreateBindGroup(t(this,r).CreateBindGroupEntries([{buffer:t(this,r).ResolutionBuffer},{buffer:t(this,d)}]),0,`${t(this,m)} Bind Group`),h(this,G,j({matrix:e.length*Float32Array.BYTES_PER_ELEMENT,color:0*Float32Array.BYTES_PER_ELEMENT}))},N=function(){if(t(this,x)){l.multiply(t(this,T),t(this,F),t(this,o)),l.multiply(t(this,o),t(this,w),t(this,o)),l.multiply(t(this,o),t(this,M),t(this,o)),t(this,r).WriteBuffer(t(this,d),t(this,o),t(this,G).matrix);const i=t(this,U)[0]=t(this,o)[8],e=t(this,U)[1]=t(this,o)[9];t(this,g).min[0]=i-t(this,f),t(this,g).min[1]=e-t(this,f),t(this,g).max[0]=i+t(this,f),t(this,g).max[1]=e+t(this,f),h(this,x,!1)}return this};export{X as S,Z as a};
