<p align="center">
  <a title="UWAL" href="https://ustymukhman.github.io/uwal/" target="_blank" rel="noopener noreferrer">
    <img alt="UWAL" src="assets/favicon.svg" width="256" height="256" />
  </a>
</p>

<h1 align="center">UWAL</h1>

<p align="center">
  <img alt="GitHub deployments" src="https://img.shields.io/github/deployments/UstymUkhman/uwal/github-pages?style=flat-square" />
  <img alt="NPM bundle size" src="https://img.shields.io/bundlejs/size/uwal?style=flat-square" />
  <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/UstymUkhman/uwal?color=orange&style=flat-square" />
  <img alt="GitHub License" src="https://img.shields.io/github/license/UstymUkhman/uwal?color=lightgrey&style=flat-square" />
</p>

<p align="center">
  <i>The goal of UWAL is to remove as much boilerplate as possible when working with the WebGPU APIs, while still providing a flexible interface with reasonable defaults for all configuration options.</i>
</p>

## Introduction

- UWAL is very minimal, under development and in early beta stage, so expect breaking changes in the future.
- There are no plans to implement any WebGL fallback, so keep an eye on [browsers that support](https://caniuse.com/webgpu) WebGPU APIs.
- It is aimed at developers who like minimal layers of abstraction and are interested in writing their own shaders.
- To get started with UWAL, feel free to check out the [Wiki](https://github.com/UstymUkhman/uwal/wiki) page for some simple examples using version `0.2.x`.

## Installation

```bash
npm i uwal
# or
yarn add uwal
# or
pnpm add uwal
# or
bun add uwal
```

## Diagram

```mermaid
flowchart TD
  GPU[WebGPU APIs]
  DEV[Device]
  APP[Your Appliation]

  BP[Base Pipeline]
  CP[Compute Pipeline]
  RP[Render Pipeline]
  BS[Base Stage]
  COMP[Computation]
  RNDR[Renderer]
  TEX[Texture]

  GPU  --> DEV
  DEV  --> BS
  DEV  --> TEX
  BS   --> COMP
  BS   --> RNDR
  COMP --> CP
  COMP --> APP
  BP   --> CP
  BP   --> RP
  CP   --> APP
  RP   --> APP
  RNDR --> RP
  RNDR --> APP

  TIME[GPUTiming] --> APP
  MATH[MathUtils] --> APP

  ND2[Node2D]
  GEO[Geometries]
  ND[Node]
  MAT[Materials]
  SHDS[Shaders]
  CAM[Camera]
  SHP[Shape]
  MESH[Mesh]
  SCN[Scene]
  TXT[MSDFText]

  LGHT[Lights]     --> APP
  COL[Color]       --> APP
  CONST[Constants] --> APP

  ND2  --> APP
  ND2  --> SCN
  ND2  --> CAM
  ND2  --> SHP
  MAT  --> SHP
  GEO  --> APP
  GEO  --> SHP
  GEO  --> MESH
  MAT  --> MESH
  ND   --> CAM
  ND   --> MESH
  ND   --> SCN
  ND   --> APP
  SHP  --> SCN
  MESH --> SCN
  CAM  --> APP
  CAM  --> SCN
  SHDS --> MAT
  SHDS --> TXT
  RP   --> APP
  TEX  --> APP
  SCN  --> APP
  SHP  --> APP
  MAT  --> APP
  TXT  --> APP
  SHDS --> APP
```

## Examples

|   |   |
|:-:|:-:|
| Basic Program | Ripple Effect |
| [![Basic Program](assets/images/BasicProgram.jpg)](https://www.youtube.com/watch?v=TOCvJR07H6k) | [![Ripple Effect](assets/images/RippleEffect.jpg)](https://www.youtube.com/watch?v=j07n96qDe20) |
| WebGPU Smallpt | Pong Game |
| [![WebGPU Smallpt](assets/images/WebGPUSmallpt.jpg)](https://ustymukhman.github.io/uwal/dist/examples/examples.html#webgpu-smallpt) | [![Pong Game](assets/images/PongGame.jpg)](https://ustymukhman.github.io/uwal/dist/examples/examples.html#pong-game) |

## Lessons

- Basics
  - [Fundamentals](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#fundamentals)
  - [Inter-stage Variables](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#inter-stage-variables)
  - [Uniforms](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#uniforms)
  - [Storage Buffers](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#storage-buffers)
  - [Vertex Buffers](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#vertex-buffers)
  - Textures
    - [Textures](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#textures)
    - [Mipmap Filter](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#mipmap-filter)
    - [Loading Images](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#loading-images)
    - [Generating mipmaps on the GPU](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#gpu-mipmaps)
    - [Loading Canvas](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#loading-canvas)
    - [Loading Video](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#loading-video)
    - [Texture Atlases](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#texture-atlases)
    - [Using Video](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#using-video)
    - [Using Camera](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#using-camera)
    - [Cubemaps](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#cubemaps)
    - [Storage Textures](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#storage-textures)
    - [Multisampling](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#multisampling)
  - [Shader Constants](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#shader-constants)
  - [Transparency and Blending](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#transparency)
  - [Blend Settings](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#blend-settings)
  - [Bind Group Layouts](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#bind-group-layouts)
  - [Timing Performance](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#timing-performance)
  - Compatibility Mode _(TBI)_
- 3D Math
  - [Translation](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#translation)
  - [Rotation](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#rotation)
  - [Scale](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#scale)
  - [Matrix Math](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#matrix-math)
  - [Adding in Projection](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#adding-projection)
  - [Orthographic Projection](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#orthographic-projection)
  - [Perspective Projection](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#perspective-projection)
  - [Cameras](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#cameras)
  - [Matrix Stacks](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#matrix-stacks)
  - [Recursive Tree](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#recursive-tree)
  - [Scene Graphs](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#scene-graphs)
  - [Making a Hand](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#making-hand)
- Lighting
  - [Directional Lighting](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#directional-lighting)
  - [Point Lighting](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#point-lighting)
  - [Spot Lighting](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#spot-lighting)

## Acknowledgements

- Inspired by the philosophy of the great [ogl](https://github.com/oframe/ogl) library.
- Born from the incredible lessons of [WebGPU Fundamentals](https://webgpufundamentals.org/).
- Built upon the awesomeness of [wgpu-matrix](https://github.com/greggman/wgpu-matrix) and [wgsl_reflect](https://github.com/brendan-duncan/wgsl_reflect).
- Leveraging a fantastic [primitive-geometry](https://github.com/dmnsgn/primitive-geometry) NPM package.
