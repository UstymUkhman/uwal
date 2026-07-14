---
title: Introduction
description: Unopinionated WebGPU Abstraction Library
---

# What is UWAL?

UWAL (pronounced `/ˈjuvaʊl/`), stands for "**Unopinionated WebGPU Abstraction Library**" and it's a JavaScript tool to
enhance your web pages with stunning effects built on top of the WebGPU APIs.

### WebGPU

WebGPU is a fairly new web API, a successor to the more well-known [WebGL](https://en.wikipedia.org/wiki/WebGL), first
released officially in Google Chrome 113, on May 3, 2023. Even if WebGPU has quickly gain broad browser support accross
all major operating systems, it is still recommended to keep an eye on its [availability](https://caniuse.com/?search=WebGPU)
since some browsers offer partial support and require a feature flag to be enabled. You can find more info about WebGPU
here:
  - [wikipedia.org](https://en.wikipedia.org/wiki/WebGPU)
  - [webgpu.org](https://webgpu.org/)
  - [w3.org](https://www.w3.org/TR/webgpu/)

## Philosophy

The goal of UWAL is to remove as much boilerplate as possible when working with the WebGPU APIs, while still providing
a flexible interface with reasonable defaults for most use cases. That being said, UWAL has started as a set of tools to
ease the development of WebGPU applications while working with its APIs over a very thin abstraction layer and, even with
introduction of higher level components like [scene graphs](/Scene), cameras and lights, the core idea is the same:
provide minimal layers of abstraction to developers who are interested in building their own pipelines and writing shaders.
UWAL is considered under development and in beta stage, so please expect breaking changes until it hits version `1.0`.
No WebGL fallback will be provided by the library for browsers that do not support WebGPU, so make sure to handle these
cases gracefully for users whose browsers do not support modern graphics APIs.

### Other Options

Compared to older graphics libraries on the web like `three.js`, `Babylon.js` and `PlayCanvas`, UWAL is much more
low-level and comes with many fewer features, so for a smoother developer experience and stable, production-ready
applications, it's recommended to stick to these options. You can think of UWAL as a spiritual successor to the [ogl](https://github.com/oframe/ogl)
library: a much lighter and simple package that keeps you bundle size small while still providing all the necessary
tooling to manage pipelines, bind groups and shaders; which may be just what you need sometimes.

## Getting Started

The recommended way to start experimenting with UWAL is to take a look at and fork any of the official [examples](https://ustymukhman.github.io/uwal/dist/examples/examples.html), wiki [pages](https://github.com/UstymUkhman/uwal/wiki),
or WebGPU Fundamentals [lessons](https://github.com/UstymUkhman/uwal/tree/main/src/lessons) provided by the library. The
code hosted in the main repository is guaranteed to work with the latest version of the library published on [NPM](https://www.npmjs.com/package/uwal).
However, more examples using older versions, can be found [here](https://github.com/UstymUkhman/uwal-webgpu-fundamentals) and in dedicated repositories on [GitHub](https://github.com/UstymUkhman?tab=repositories&q=uwal-)
featured in the "*Demos*" section of the examples page. To install the library and create your first shader with UWAL,
feel free to check the [Installation](/Installation) page.

## Acknowledgements

UWAL was developed from the amazing [WebGPU Fundamentals](https://webgpufundamentals.org/) lessons by [Gregg Tavares](https://github.com/greggman),
and it's heavily inspired by [ogl](https://github.com/oframe/ogl) and its core principles about simplicity, goals and abstraction level.
However, to keep the library code as minimal and simple as possible, a few lightweight dependencies were introduced
along the way:
  - [wgpu-matrix](https://github.com/greggman/wgpu-matrix): Fast WebGPU 3D math library.
  - [wgsl_reflect](https://github.com/brendan-duncan/wgsl_reflect): A WebGPU Shading Language parser and reflection library.
  - [primitive-geometry](https://github.com/dmnsgn/primitive-geometry): Geometries for 3D rendering, including normals, UVs and faces.

Kudos to the maintainers of these libraries who did a better job than I could ever do in developing and optimizing them.
