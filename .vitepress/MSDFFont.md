[UWAL](Modules.md) / MSDFFont

## Classes

<a id="msdffont"></a>

### MSDFFont

MSDF font management class, designed exclusively for internal usage.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new MSDFFont(label?, generated?): MSDFFont;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `label?` | `string` | `"MSDFFont"` | Font label. |
| `generated?` | `boolean` | `false` | Whether the font was generated [here](https://msdf-bmfont.donmccurdy.com/). |

###### Returns

[`MSDFFont`](#msdffont)

#### Methods

<a id="getbindgrouplayoutentries"></a>

##### GetBindGroupLayoutEntries()

```ts
static GetBindGroupLayoutEntries(Renderer): BindGroupLayoutEntry[];
```

Create font layout entries for the [MSDFText](./MSDFText) pipeline layout.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Renderer` | `RenderStage` | `Renderer` instance to create layout entries. |

###### Returns

`BindGroupLayoutEntry`[]

<a id="getcharacter"></a>

##### GetCharacter()

```ts
GetCharacter(code): Char;
```

Get character information by its code.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `number` | Character code. |

###### Returns

`Char`

<a id="getxadvance"></a>

##### GetXAdvance()

```ts
GetXAdvance(code, nextCode?): number;
```

Get the distance in pixels the cursor should advance for a given character.
If the next character is given, any kerning between the two characters will be taken into account.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `code` | `number` | `undefined` | Character code. |
| `nextCode?` | `number` | `-1` | Next character code. |

###### Returns

`number`

<a id="createbindgroupresources"></a>

##### CreateBindGroupResources()

```ts
CreateBindGroupResources(
   Pipeline, 
   url, 
requestOptions?): Promise<Record<string, GPUBindingResource>>;
```

Load and parse a font from a valid source file and save its characters info into a storage buffer.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | [MSDFText](./MSDFText) pipeline. |
| `url` | `string` | Font source path. |
| `requestOptions?` | `RequestInit` | `fetch` request options. |

###### Returns

`Promise`\<`Record`\<`string`, `GPUBindingResource`\>\>

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy all page textures.

###### Returns

`void`

#### Accessors

<a id="bindgroupresources"></a>

##### BindGroupResources

###### Get Signature

```ts
get BindGroupResources(): Record<string, GPUBindingResource>;
```

###### Throws

`ERROR.FONT_RESOURCES_NOT_FOUND` if the font has not yet been loaded with [MSDFText.LoadFont](./MSDFText#loadfont).

###### Returns

`Record`\<`string`, `GPUBindingResource`\>

Font bind group resources.

<a id="lineheight"></a>

##### LineHeight

###### Get Signature

```ts
get LineHeight(): number;
```

###### Returns

`number`

Font line height.

<a id="generated"></a>

##### Generated

###### Get Signature

```ts
get Generated(): boolean;
```

###### Returns

`boolean`

Whether the font was generated [here](https://msdf-bmfont.donmccurdy.com/).
