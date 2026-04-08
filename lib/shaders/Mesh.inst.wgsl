struct MeshMatrixUniforms
{
    world: mat4x4f,
    worldNormal: mat3x3f,
    viewProjection: mat4x4f
};

@group(0) @binding(30) var<uniform> MeshMatrix: MeshMatrixUniforms;

fn GetVertexWorldPosition(position: vec4f, world: mat4x4f) -> vec3f
{
    return (position * world).xyz;
}

fn GetVertexClipSpace(position: vec4f, world: mat4x4f) -> vec4f
{
    let modelViewProjection = MeshMatrix.viewProjection * world;
    return modelViewProjection * position;
}

struct MeshVertexPosition
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) @interpolate(flat) instance: u32
};

@vertex fn vertex(
    @location(0) position: vec4f,
    @location(1) instanceColumn0: vec4f,
    @location(2) instanceColumn1: vec4f,
    @location(3) instanceColumn2: vec4f,
    @location(4) instanceColumn3: vec4f,
    @builtin(instance_index) instance: u32
) -> MeshVertexPosition
{
    let instanceMatrix = mat4x4f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2,
        instanceColumn3
    );

    return MeshVertexPosition(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        instance
    );
}

struct MeshVertexNormal
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) @interpolate(flat) instance: u32
};

@vertex fn vertexNormal(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) instanceColumn0: vec4f,
    @location(3) instanceColumn1: vec4f,
    @location(4) instanceColumn2: vec4f,
    @location(5) instanceColumn3: vec4f,
    @builtin(instance_index) instance: u32
) -> MeshVertexNormal
{
    let instanceMatrix = mat4x4f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2,
        instanceColumn3
    );

    return MeshVertexNormal(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        normal,
        instance
    );
}

struct MeshVertexUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) uv: vec2f,
    @location(2) @interpolate(flat) instance: u32
};

@vertex fn vertexUV(
    @location(0) position: vec4f,
    @location(1) uv: vec2f,
    @location(2) instanceColumn0: vec4f,
    @location(3) instanceColumn1: vec4f,
    @location(4) instanceColumn2: vec4f,
    @location(5) instanceColumn3: vec4f,
    @builtin(instance_index) instance: u32
) -> MeshVertexUV
{
    let instanceMatrix = mat4x4f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2,
        instanceColumn3
    );

    return MeshVertexUV(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        uv,
        instance
    );
}

struct MeshVertexNormalUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) @interpolate(flat) instance: u32
};

@vertex fn vertexNormalUV(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) instanceColumn0: vec4f,
    @location(4) instanceColumn1: vec4f,
    @location(5) instanceColumn2: vec4f,
    @location(6) instanceColumn3: vec4f,
    @builtin(instance_index) instance: u32
) -> MeshVertexNormalUV
{
    let instanceMatrix = mat4x4f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2,
        instanceColumn3
    );

    return MeshVertexNormalUV(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        normal,
        uv,
        instance
    );
}
