const FULL_TRI = array(
    vec2f(-1.0, -1.0), //  2
    vec2f( 3.0, -1.0), //  |\
    vec2f(-1.0,  3.0), // 0|_\1
);

fn GetFullTriCoord(index: u32) -> vec2f
{
    return FULL_TRI[index];
}

const FULL_QUAD = array(
    vec2f(-1.0, -1.0), //    4 ______ 2, 3
    vec2f( 1.0, -1.0), //     |     /|
    vec2f( 1.0,  1.0), //     |    / |
                       //     |   /  |
    vec2f( 1.0,  1.0), //     |  /   |
    vec2f(-1.0,  1.0), //     | /    |
    vec2f(-1.0, -1.0)  // 0, 5|/_____|1
);

fn GetFullQuadCoord(index: u32) -> vec2f
{
    return FULL_QUAD[index];
}

fn GetFullTexCoord(coord: vec2f) -> vec2f
{
    return vec2f(coord * 0.5 + vec2f(0.5));
}
