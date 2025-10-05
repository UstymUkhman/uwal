var e="@group(0)@binding(0)var<uniform>projection: mat4x4f;fn GetVertexClipSpace(position: vec4f)->vec4f{return projection*position;}@vertex fn vertex(@location(0)position: vec4f)->@builtin(position)vec4f {return GetVertexClipSpace(position);}",o="@group(0)@binding(1)var<uniform>color: vec4f;@fragment fn fragment()->@location(0)vec4f {return color;}",r="@group(0)@binding(0)var<uniform>projection: mat3x3f;fn GetVertexClipSpace(position: vec2f)->vec4f{let coords=projection*vec3f(position,1);return vec4f(coords.xy,0,1);}@vertex fn vertex(@location(0)position: vec2f)->@builtin(position)vec4f {return GetVertexClipSpace(position);}",n="@group(0)@binding(1)var<uniform>color: vec4f;@fragment fn fragment()->@location(0)vec4f {return color;}";const t=`${e}

${o}`,i=`${r}

${n}`;export{t as C,i as S};
