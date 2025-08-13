export default function (radius = 1, height = 1, subdivisions = 6)
{
    const positions = [], colors = [], TAU = Math.PI * 2;

    const addVertex = (angle, radius, height, color) =>
    {
        positions.push( Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        colors.push(...color);
    }

    for (let s = 0; s < subdivisions; ++s)
    {
        const angle = Array.from({ length: 2 })
            .map((_, i) => (s + i) / subdivisions * TAU);

        const color = [(s + 1) / subdivisions * 128 + 127, 0, 0];

        addVertex(angle[0],      0,       0, color);
        addVertex(angle[1], radius, -height, color);
        addVertex(angle[0], radius, -height, color);

        addVertex(angle[0], radius, -height, color);
        addVertex(angle[1], radius, -height, color);
        addVertex(angle[0],      0, -height, color);
    }

    const vertices = positions.length / 3;
    const colorData = new Uint8Array(vertices * 4);
    const vertexData = new Float32Array(vertices * 3);

    vertexData.set(positions);

    for (let v = 0; v < vertices; ++v)
    {
        const v3 = v * 3, v4 = v * 4;
        const color = colors.slice(v3, v3 + 3);
        colorData.set(color, v4);
        colorData[v4 + 3] = 255;
    }

    return { vertexData, colorData, vertices };
};
