[UWAL](Modules.md) / TextureUtils

## Type Aliases

<a id="usage"></a>

### Usage

```ts
type Usage = Readonly<Record<"RENDER" | "STORAGE", GPUTextureUsageFlags>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Variables

<a id="texture"></a>

### TEXTURE

```ts
const TEXTURE: Readonly<Record<"STORAGE" | "RENDER", number>>;
```

Some utility bitmasks of the `GPUTextureUsage` flags.
- `TEXTURE.RENDER` is the default usage when creating a texture.
- `TEXTURE.STORAGE` is the default usage when creating a storage texture.

## Functions

<a id="textureutils"></a>

### TextureUtils()

```ts
function TextureUtils(Renderer?): Promise<Texture & () => Texture>;
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Renderer?` | `RenderStage` | `Renderer` instance required in some methods. |

#### Returns

`Promise`\<[`Texture`](Texture.md#texture) & () => [`Texture`](Texture.md#texture)\>

A promise of the [Texture](./Texture) class.

#### See

[Texture](./Texture) class for method reference.

#### Example

```ts
const Texture = new (await UWAL.TextureUtils());
```
