var n=`const QUAD = array(
    vec2f(-1.0, -1.0), 
    vec2f( 1.0, -1.0), 
    vec2f( 1.0,  1.0), 
                       
    vec2f( 1.0,  1.0), 
    vec2f(-1.0,  1.0), 
    vec2f(-1.0, -1.0)  
);

fn GetQuadCoord(index: u32) -> vec2f
{
    return QUAD[index];
}`;export{n as Q};
