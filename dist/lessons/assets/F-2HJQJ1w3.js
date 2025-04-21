var t=`@group(0) @binding(0) var<uniform> resolution: vec3f;

fn GetClipSpace(position: vec2f) -> vec2f
{
    
    let clipSpace = position / resolution.xy * 2 - 1;

    
    return clipSpace * vec2f(1, -1);
}`;function r(){const e=new Float32Array([0,0,30,0,0,150,30,150,30,0,100,0,30,30,100,30,30,60,70,60,30,90,70,90]),n=new Uint32Array([0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11]);return{vertices:n.length,vertexData:e,indexData:n}}export{t as R,r as c};
