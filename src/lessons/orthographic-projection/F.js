export default function()
{
    const positions = [
        // Front base:
          0,   0,  0,
         30,   0,  0,
          0, 150,  0,
         30, 150,  0,

        // Top front rung:
         30,   0,  0,
        100,   0,  0,
         30,  30,  0,
        100,  30,  0,

        // Middle front rung:
         30,  60,  0,
         70,  60,  0,
         30,  90,  0,
         70,  90,  0,

        // Back base:
          0,   0, 30,
         30,   0, 30,
          0, 150, 30,
         30, 150, 30,

        // Top back rung:
         30,   0, 30,
        100,   0, 30,
         30,  30, 30,
        100,  30, 30,

        // Middle back rung:
         30,  60, 30,
         70,  60, 30,
         30,  90, 30,
         70,  90, 30
    ];

    const indices = [
         0,  1,  2,  2,  1,  3, // Front base
         4,  5,  6,  6,  5,  7, // Top front rung
         8,  9, 10, 10,  9, 11, // Middle front rung

        12, 14, 13, 14, 15, 13, // Back base
        16, 18, 17, 18, 19, 17, // Top back rung
        20, 22, 21, 22, 23, 21, // Middle back rung

         0, 12,  5, 12, 17,  5, // Top
         5, 17,  7, 17, 19,  7, // Top right rung
         6,  7, 18, 18,  7, 19, // Top bottom rung
         6, 18,  8, 18, 20,  8, // Between two rungs

         8, 20,  9, 20, 21,  9, // Middle top rung
         9, 21, 11, 21, 23, 11, // Middle right rung
        10, 11, 22, 22, 11, 23, // Middle bottom rung

        10, 22,  3, 22, 15,  3, // Right
         2,  3, 14, 14,  3, 15, // Bottom
         0,  2, 12, 12,  2, 14  // Left
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
