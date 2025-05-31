export default function()
{
    const vertexData = new Float32Array(
    [
        // Base:
          0,   0, 0,
         30,   0, 0,
          0, 150, 0,
         30, 150, 0,

        // Top rung:
         30,   0, 0,
        100,   0, 0,
         30,  30, 0,
        100,  30, 0,

        // Middle rung:
         30,  60, 0,
         70,  60, 0,
         30,  90, 0,
         70,  90, 0
    ]);

    const indexData = new Uint32Array(
    [
        0,  1,  2,  2, 1,  3, // Base
        4,  5,  6,  6, 5,  7, // Top rung
        8,  9, 10, 10, 9, 11  // Middle rung
    ]);

    return {
        vertices: indexData.length,
        vertexData, indexData
    };
}
