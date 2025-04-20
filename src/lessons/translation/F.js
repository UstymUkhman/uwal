export default function()
{
    const vertexData = new Float32Array(
    [
        // Base:
          0,   0,
         30,   0,
          0, 150,
         30, 150,

        // Top rung:
         30,   0,
        100,   0,
         30,  30,
        100,  30,

        // Middle rung:
         30,  60,
         70,  60,
         30,  90,
         70,  90
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
