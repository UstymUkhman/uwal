var t="struct Transform{matrix: mat4x4f};struct VertexOutput{@builtin(position)position: vec4f,@location(0)textureCoord: vec2f};@group(0)@binding(0)var Sampler: sampler;@group(0)@binding(1)var Texture: texture_2d<f32>;@group(0)@binding(2)var<uniform>transform: Transform;@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {var output: VertexOutput;var position=GetQuadCoord(index);position=(position+1)*0.5;output.position=transform.matrix*vec4f(position,0.0,1.0);output.textureCoord=position*vec2f(1,50);return output;}@fragment fn fragment(@location(0)textureCoord: vec2f)->@location(0)vec4f {return textureSample(Texture,Sampler,textureCoord);}",e="struct VertexOutput{@builtin(position)position: vec4f,@location(0)textureCoord: vec2f};@group(0)@binding(0)var Sampler: sampler;@group(0)@binding(1)var Texture: texture_2d<f32>;@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {let position=GetQuadCoord(index);let coord=(position+1)*0.5;var output: VertexOutput;output.position=vec4f(position,0.0,1.0);output.textureCoord=vec2f(coord.x,1-coord.y);return output;}@fragment fn fragment(@location(0)textureCoord: vec2f)->@location(0)vec4f {return textureSample(Texture,Sampler,textureCoord);}";export{t as G,e as a};
