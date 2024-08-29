<p align="center">
  <a title="UWAL" href="https://ustymukhman.github.io/uwal/" target="_blank" rel="noopener noreferrer">
    <img alt="UWAL" src="assets/favicon.svg" width="256" height="256" />
  </a>
</p>

<h1 align="center">UWAL</h1>

<p align="center">
  <img alt="GitHub deployments" src="https://img.shields.io/github/deployments/UstymUkhman/uwal/github-pages?style=flat-square" />
  <img alt="NPM bundle size" src="https://img.shields.io/bundlephobia/min/uwal?style=flat-square" />
  <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/UstymUkhman/uwal?color=orange&style=flat-square" />
  <img alt="GitHub License" src="https://img.shields.io/github/license/UstymUkhman/uwal?color=lightgrey&style=flat-square" />
</p>

<p align="center">
  <i>The goal of UWAL is to remove as much boilerplate as possible when working with the WebGPU APIs, while still providing a flexible interface with reasonable defaults for all configuration options.</i>
</p>

<!-- ## Introduction

UWAL is inspired by the fantastic [OGL](https://github.com/oframe/ogl) library and shares with it the following philosophy points:

- It is aimed at developers who like minimal layers of abstraction and are interested in writing their own shaders.
- It comes with much fewer features than some popular libraries like [three.js](https://threejs.org/) or [Babylon.js](https://www.babylonjs.com/).
- UWAL still requires to be familiar with WebGPU pipelines but allows to spare some pain points when setting up some data structures.
- Keeping the level of abstraction low helps to make it easier to understand, extend, and also makes it more practical as a WebGPU learning resource.

On the other hand, it adds some precautions developers should be warn about before using this library:

- It is very minimal and under development; if you want to get the work done, use any other mature library, if you want to learn WebGPU but write less verbose code — give it a shot!
- There are no plans to implement any WebGL fallback, so keep an eye on [browsers that support](https://caniuse.com/webgpu) WebGPU APIs.
- UWAL is in early alpha stage at the moment, so expect breaking changes in near future.

Other than that, have fun! -->

## [Installation](https://www.npmjs.com/package/uwal)

```bash
npm i uwal
# or
yarn add uwal
# or
pnpm add uwal
# or
bun add uwal
```

## [Examples](https://ustymukhman.github.io/uwal/dist/examples/examples.html)

<!-- [![Basic Program](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID) -->

### WebGPU Fundamentals

- [Fundamentals](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#fundamentals)
- [Inter-stage Variables](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#inter-stage-variables)
- [Uniforms](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#uniforms)
- [Storage Buffers](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#storage-buffers)
- [Vertex Buffers](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#vertex-buffers)
  - [Textures](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#textures)
  - [Mipmap Filter](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#mipmap-filter)
  - [Loading Images](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#loading-images)
  - [Generating mipmaps on the GPU](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#gpu-mipmaps)
  - [Loading Canvas](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#loading-canvas)
  - [Loading Video](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#loading-video)
  - Texture Atlases
  - [Using Video](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#using-video)
  - [Cubemaps](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#cubemaps)
  - [Storage Textures](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#storage-textures)
  - [Multisampling](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#multisampling)
- [Shader Constants](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#shader-constants)
- [Transparency and Blending](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#transparency)
- [Blend Settings](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#blend-settings)
