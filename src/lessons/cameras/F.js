export default function()
{
    const positions = [
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
    ];

    const indices = [
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
    ];

    const colors = [
        200,  70, 120, // Front base
        200,  70, 120, // Top front rung
        200,  70, 120, // Middle front rung

         80,  70, 200, // Back base
         80,  70, 200, // Top back rung
         80,  70, 200, // Middle back rung

         70, 200, 210, // Top
        160, 160, 220, // Top right rung
         90, 130, 110, // Top bottom rung
        200, 200,  70, // Between two rungs

        210, 100,  70, // Middle top rung
        210, 160,  70, // Middle right rung
         70, 180, 210, // Middle bottom rung

        100,  70, 210, // Right
         76, 210, 100, // Bottom
        140, 210,  80  // Left
    ];

    const vertices = indices.length;
    const vertexData = new Float32Array(vertices * 4);
    const colorData = new Uint8Array(vertexData.buffer);

    for (let i = 0; i < vertices; i++)
    {
        let index = indices[i] * 3;
        vertexData.set(positions.slice(index, index + 3), i * 4);

        index = (i / 6 | 0) * 3;
        colorData.set(colors.slice(index, index + 3), i * 16 + 12);
        colorData[i * 16 + 15] = 255;
    }

    return { vertexData, vertices };
}
