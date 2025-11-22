export default function()
{
    const vertexData = new Float32Array([
        // Front base:
        -50,  75,  15,
        -20,  75,  15,
        -50, -75,  15,
        -20, -75,  15,

        // Top front rung:
        -20,  75,  15,
         50,  75,  15,
        -20,  45,  15,
         50,  45,  15,

        // Middle front rung:
        -20,  15,  15,
         20,  15,  15,
        -20, -15,  15,
         20, -15,  15,

        // Back base:
        -50,  75, -15,
        -20,  75, -15,
        -50, -75, -15,
        -20, -75, -15,

        // Top back rung:
        -20,  75, -15,
         50,  75, -15,
        -20,  45, -15,
         50,  45, -15,

        // Middle back rung:
        -20,  15, -15,
         20,  15, -15,
        -20, -15, -15,
         20, -15, -15
    ]);

    const indexData = new Uint32Array([
         0,  2,  1,  2,  3,  1, // Front base
         4,  6,  5,  6,  7,  5, // Top front rung
         8, 10,  9, 10, 11,  9, // Middle front rung

        12, 13, 14, 14, 13, 15, // Back base
        16, 17, 18, 18, 17, 19, // Top back rung
        20, 21, 22, 22, 21, 23, // Middle back rung

         0,  5, 12, 12,  5, 17, // Top
         5,  7, 17, 17,  7, 19, // Top right rung
         6, 18,  7, 18, 19,  7, // Top bottom rung
         6,  8, 18, 18,  8, 20, // Between two rungs

         8,  9, 20, 20,  9, 21, // Middle top rung
         9, 11, 21, 21, 11, 23, // Middle right rung
        10, 22, 11, 22, 23, 11, // Middle bottom rung

        10,  3, 22, 22,  3, 15, // Right
         2, 14,  3, 14, 15,  3, // Bottom
         0, 12,  2, 12, 14,  2  // Left
    ]);

    const normalData = new Float32Array([
         0,    0,    1, // Front base
         0,    0,    1, // Top front rung
         0,    0,    1, // Middle front rung

         0,    0,   -1, // Back base
         0,    0,   -1, // Top back rung
         0,    0,   -1, // Middle back rung

         0,    1,    0, // Top
         1,    0,    0, // Top right rung
         0,   -1,    0, // Top bottom rung
         1,    0,    0, // Between two rungs

         0,    1,    0, // Middle top rung
         1,    0,    0, // Middle right rung
         0,   -1,    0, // Middle bottom rung

         1,    0,    0, // Right
         0,   -1,    0, // Bottom
        -1,    0,    0  // Left
    ]);

    return { vertexData, indexData, normalData };
}
