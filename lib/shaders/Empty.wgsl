@vertex fn vertex() -> @builtin(position) vec4f
{
    return vec4f(0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(0);
}

@compute @workgroup_size(1) fn compute() {}
