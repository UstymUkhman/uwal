[UWAL](Modules.md) / TextureUtils

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

`Promise`\<[`Texture`](Texture-1.md#texture-1) & () => [`Texture`](Texture-1.md#texture-1)\>

A promise of the [Texture](./Texture-1) class.

#### See

[Texture](./Texture-1) class for method reference.

#### Example

```ts
const Texture = new (await UWAL.TextureUtils());
```
