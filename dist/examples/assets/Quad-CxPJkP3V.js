var n=`const QUAD = array(\r
    vec2f(-1.0, -1.0), 
    vec2f( 1.0, -1.0), 
    vec2f( 1.0,  1.0), 
                       
    vec2f( 1.0,  1.0), 
    vec2f(-1.0,  1.0), 
    vec2f(-1.0, -1.0)  
);

fn GetQuadCoord(index: u32) -> vec2f\r
{\r
    return QUAD[index];\r
}`;export{n as Q};
