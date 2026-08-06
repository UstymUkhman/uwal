[UWAL](Modules.md) / Color

## Type Aliases

<a id="colorparam"></a>

### ColorParam

```ts
type ColorParam = Color | GPUColor;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Classes

<a id="color"></a>

### Color

Utility class to convert, adjust, and compare color values.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Color(
   hexOrRed?, 
   green?, 
   blue?, 
   alpha?): Color;
```

Create a new color from a single hex value or using 3 or 4 channel components.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `hexOrRed?` | `number` | `0x000000` | RGB hex or red channel in `0 - 255` format. |
| `green?` | `number` | `undefined` | Green channel in `0 - 255` format. |
| `blue?` | `number` | `undefined` | Blue channel in `0 - 255` format. |
| `alpha?` | `number` | `1` | Alpha value in `0 - 1` format. |

###### Returns

[`Color`](#color)

#### Methods

<a id="set"></a>

##### Set()

```ts
Set(hex, alpha?): Color;
```

Update this color to a new value.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `hex` | `number` | `undefined` | Hex value. |
| `alpha?` | `number` | `1` | Alpha value. |

###### Returns

[`Color`](#color)

<a id="premultiply"></a>

##### Premultiply()

```ts
Premultiply(alpha?, dst?): Color;
```

Multiply this color with an alpha value.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `alpha?` | `number` | Alpha value to multiply in `0 - 1` format. Defaults to the color's alpha. |
| `dst?` | [`Color`](#color) | Destination color. A new one is created if omitted. |

###### Returns

[`Color`](#color)

<a id="random"></a>

##### Random()

```ts
Random(alpha?): Color;
```

Set this color to a random value.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `alpha?` | `number` | `1` | Alpha value. Call with `undefined` to randomize it. |

###### Returns

[`Color`](#color)

<a id="equals"></a>

##### Equals()

```ts
Equals(color): boolean;
```

Compare this color value with the provided one.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `color` | `number` \| [`ColorParam`](#colorparam) | Color to compare. |

###### Returns

`boolean`

#### Accessors

<a id="rgb"></a>

##### RGB

###### Get Signature

```ts
get RGB(): number[];
```

###### Returns

`number`[]

This color components in `0 - 255` format. Alpha is omitted.

###### Set Signature

```ts
set RGB(values): void;
```

Set this color components using `0 - 255` format. Alpha defaults to `255` if omitted.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `values` | `number`[] | 3 or 4 color channels. |

###### Returns

`void`

<a id="rgba"></a>

##### RGBA

###### Get Signature

```ts
get RGBA(): number[];
```

###### Returns

`number`[]

This color components in `0 - 255` format.

###### Set Signature

```ts
set RGBA(values): void;
```

Set this color components using `0 - 255` format.

###### Alias

[Color.RGB](#rgb-1)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `values` | `number`[] | 3 or 4 color channels. |

###### Returns

`void`

<a id="a"></a>

##### A

###### Get Signature

```ts
get A(): number;
```

###### Returns

`number`

This color alpha in `0 - 255` format.

###### Set Signature

```ts
set A(value): void;
```

Set this color alpha in `0 - 255` format.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `number` | Alpha value. |

###### Returns

`void`

<a id="rgb-1"></a>

##### rgb

###### Get Signature

```ts
get rgb(): number[];
```

###### Returns

`number`[]

This color components in `0 - 1` format. Alpha is omitted.

###### Set Signature

```ts
set rgb(values): void;
```

Set this color components using `0 - 1` format. Alpha defaults to `1` if omitted.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `values` | `number`[] | 3 or 4 color channels. |

###### Returns

`void`

<a id="rgba-1"></a>

##### rgba

###### Get Signature

```ts
get rgba(): number[];
```

###### Returns

`number`[]

This color components in `0 - 1` format.

###### Set Signature

```ts
set rgba(values): void;
```

Set this color components using `0 - 1` format.

###### Alias

[Color.rgb](#rgb)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `values` | `number`[] | 3 or 4 color channels. |

###### Returns

`void`

<a id="a-1"></a>

##### a

###### Get Signature

```ts
get a(): number;
```

###### Returns

`number`

This color alpha in `0 - 1` format.

###### Set Signature

```ts
set a(value): void;
```

Set this color alpha in `0 - 1` format.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `number` | Alpha value. |

###### Returns

`void`
