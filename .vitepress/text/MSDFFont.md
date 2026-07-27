[UWAL](../Modules.md) / text/MSDFFont

## Type Aliases

<a id="kernings"></a>

### Kernings

```ts
type Kernings = Map<number, Map<number, number>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="kerning"></a>

### Kerning

```ts
type Kerning = object;
```

#### Type Parameters

| Type Parameter |
| ------ |

#### Type Declaration

<a id="first"></a>

##### first

```ts
first: number;
```

<a id="second"></a>

##### second

```ts
second: number;
```

<a id="amount"></a>

##### amount

```ts
amount: number;
```

***

<a id="font"></a>

### Font

```ts
type Font = object;
```

#### Type Parameters

| Type Parameter |
| ------ |

#### Type Declaration

<a id="chars"></a>

##### chars

```ts
chars: Char[];
```

<a id="common-1"></a>

##### common

```ts
common: Common;
```

<a id="kernings-1"></a>

##### kernings?

```ts
optional kernings?: Kerning[];
```

<a id="pages-1"></a>

##### pages

```ts
pages: string[];
```

## Interfaces

<a id="char"></a>

### Char

#### Properties

<a id="c"></a>

##### c

```ts
c: number;
```

<a id="x"></a>

##### x

```ts
x: number;
```

<a id="y"></a>

##### y

```ts
y: number;
```

<a id="id"></a>

##### id

```ts
id: number;
```

<a id="char-1"></a>

##### char

```ts
char: string;
```

<a id="chnl"></a>

##### chnl

```ts
chnl: number;
```

<a id="page"></a>

##### page

```ts
page: number;
```

<a id="index"></a>

##### index

```ts
index: number;
```

<a id="width"></a>

##### width

```ts
width: number;
```

<a id="height"></a>

##### height

```ts
height: number;
```

<a id="xoffset"></a>

##### xoffset

```ts
xoffset: number;
```

<a id="yoffset"></a>

##### yoffset

```ts
yoffset: number;
```

<a id="xadvance"></a>

##### xadvance

```ts
xadvance: number;
```

***

<a id="common"></a>

### Common

#### Properties

<a id="base"></a>

##### base

```ts
base: number;
```

<a id="redchnl"></a>

##### redChnl

```ts
redChnl: number;
```

<a id="greenchnl"></a>

##### greenChnl

```ts
greenChnl: number;
```

<a id="bluechnl"></a>

##### blueChnl

```ts
blueChnl: number;
```

<a id="alphachnl"></a>

##### alphaChnl

```ts
alphaChnl: number;
```

<a id="lineheight"></a>

##### lineHeight

```ts
lineHeight: number;
```

<a id="scalew"></a>

##### scaleW

```ts
scaleW: number;
```

<a id="scaleh"></a>

##### scaleH

```ts
scaleH: number;
```

<a id="packed"></a>

##### packed

```ts
packed: number;
```

<a id="pages"></a>

##### pages

```ts
pages: number;
```

## Classes

<a id="msdffont"></a>

### MSDFFont

An MSDF font management class, mostly for internal usage.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new MSDFFont(label?, generated?): MSDFFont;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `label?` | `string` | `"MSDFFont"` | Name of the font |
| `generated?` | `boolean` | `false` | Whether the font was generated with [this tool](https://msdf-bmfont.donmccurdy.com/) |

###### Returns

[`MSDFFont`](#msdffont)

#### Methods

<a id="getbindgrouplayoutentries"></a>

##### GetBindGroupLayoutEntries()

```ts
static GetBindGroupLayoutEntries(Renderer): BindGroupLayoutEntry[];
```

Create layout entries for the text bind group layout.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Renderer` | `RenderStage` | `Renderer` instance used to create layout entries |

###### Returns

`BindGroupLayoutEntry`[]

<a id="getcharacter"></a>

##### GetCharacter()

```ts
GetCharacter(code): Char;
```

Get character information when measuring the text.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `number` | Code of the char to get info about |

###### Returns

[`Char`](#char)

<a id="createbindgroupresources"></a>

##### CreateBindGroupResources()

```ts
CreateBindGroupResources(
   Pipeline, 
   url, 
requestOptions?): Promise<Record<string, GPUBindingResource>>;
```

Load and parse the font from a URL and save its characters info into a storage buffer.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | Text pipeline |
| `url` | `string` | URL to load the font from |
| `requestOptions?` | `RequestInit` | Optional `fetch` request options |

###### Returns

`Promise`\<`Record`\<`string`, `GPUBindingResource`\>\>

<a id="getxadvance"></a>

##### GetXAdvance()

```ts
GetXAdvance(code, nextCode?): number;
```

Get the distance in pixels a line should advance for a given character.
If the next character is given, any kerning between the two characters will be taken into account.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `code` | `number` | `undefined` | Code of the character to advance |
| `nextCode?` | `number` | `-1` | Code of the next character |

###### Returns

`number`

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): undefined;
```

Destroy font and page textures.

###### Returns

`undefined`

#### Accessors

<a id="bindgroupresources"></a>

##### BindGroupResources

###### Get Signature

```ts
get BindGroupResources(): Record<string, GPUBindingResource>;
```

###### Returns

`Record`\<`string`, `GPUBindingResource`\>

Font bind group resources.

<a id="lineheight-1"></a>

##### LineHeight

###### Get Signature

```ts
get LineHeight(): number;
```

###### Returns

`number`

Line height defined by the font.

<a id="generated"></a>

##### Generated

###### Get Signature

```ts
get Generated(): boolean;
```

###### Returns

`boolean`

Whether the font was generated with [this tool](https://msdf-bmfont.donmccurdy.com/).
