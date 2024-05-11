const QUAD = array(
    vec2f(-1.0, -1.0), //    4 ______ 2, 3
    vec2f( 1.0, -1.0), //     |     /|
    vec2f( 1.0,  1.0), //     |    / |
                       //     |   /  |
    vec2f( 1.0,  1.0), //     |  /   |
    vec2f(-1.0,  1.0), //     | /    |
    vec2f(-1.0, -1.0)  // 0, 5|/_____|1
);

fn GetQuadCoord(index: u32) -> vec2f
{
    return QUAD[index];
}
