import * as LIB from "./package.json" with { type: "json" };
import terser from "@rollup/plugin-terser";
import { minifySync } from "oxc-minify";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { resolve } from "path";

export default({ mode }, Name = LIB.name.toUpperCase()) =>
{
    const plugins = ["lessons", "examples"].includes(mode) && [] ||
    [
        terser(
        {
            ecma: 2020,
            module: true,
            compress:
            {
                passes: 2,
                ecma: 2020,
                unsafe: true,
                unsafe_arrows: true,
                unsafe_comps: false,
                unsafe_Function: true,
                unsafe_math: true,
                unsafe_symbols: false,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                unsafe_undefined: true
            }
        }),
        {
            apply: "build", enforce: "post",
            generateBundle(_options, bundle)
            {
                for (const asset of Object.values(bundle))
                    if (asset.type === "chunk") asset.code = minifySync(
                        asset.fileName, asset.code, { module: true, sourcemap: true }
                    ).code;
            }
        }
    ];

    const build = mode === "core" ?
        {
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: Name,
                fileName: `${LIB.name}.core`,
                entry: resolve("lib/core.js")
            }
        }
        : mode === "utils" ?
        {
            emptyOutDir: false,
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: `${Name} Utils`,
                fileName: `${LIB.name}.utils`,
                entry: resolve("lib/utils/export.js")
            }
        }
        : mode === "materials" ?
        {
            emptyOutDir: false,
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: `${Name} Materials`,
                fileName: `${LIB.name}.materials`,
                entry: resolve("lib/materials/index.js")
            }
        }
        : mode === "lights" ?
        {
            emptyOutDir: false,
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: `${Name} Lights`,
                fileName: `${LIB.name}.lights`,
                entry: resolve("lib/lights/index.js")
            }
        }
        : mode === "shaders" ?
        {
            emptyOutDir: false,
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: `${Name} Shaders`,
                fileName: `${LIB.name}.shaders`,
                entry: resolve("lib/shaders/index.js")
            }
        }
        : mode === "text" ?
        {
            emptyOutDir: false,
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: `${Name} MSDF Text`,
                fileName: `${LIB.name}.text`,
                entry: resolve("lib/text/index.js")
            }
        }
        : mode === "lib" ?
        {
            emptyOutDir: false,
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: Name,
                entry: resolve("lib/index.js")
            }
        }
        :
        {
            outDir: resolve(`dist/${mode}`),
            rollupOptions:
            {
                input:
                {
                    app: resolve(`./${mode}.html`)
                },
                output:
                {
                    assetFileNames: ({ name }) =>
                        ["Matrix-Code-NFI.png", "Roboto-Regular.png"].includes(name) &&
                            "assets/[name].[ext]" || "assets/[name]-[hash].[ext]"
                }
            }
        };

    return defineConfig(
    {
        build,
        base: "./",

        plugins:
        [
            ...plugins,
            glsl(
            {
                root: "/lib/shaders/",
                defaultExtension: "wgsl",
                minify: mode !== "development"
            })
        ],

        define:
        {
            VERSION: JSON.stringify(LIB.version)
        },

        resolve:
        {
            alias:
            {
                "#": resolve("lib")
            }
        },

        server:
        {
            port: 8080
        }
    });
};
