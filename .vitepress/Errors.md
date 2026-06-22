[UWAL](Modules.md) / Errors

# Errors

## Type Aliases

### ErrorCause

> **ErrorCause** = `"WEBGPU_NOT_SUPPORTED"` \| `"ADAPTER_NOT_FOUND"` \| `"DEVICE_NOT_FOUND"` \| `"DEVICE_NOT_REQUESTED"` \| `"DEVICE_LOST"`

Defined in: [Errors.js:104](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L104)

#### Type Parameters

***

### PipelineErrorCause

> **PipelineErrorCause** = keyof `ERROR_CAUSE`

Defined in: [Errors.js:96](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L96)

#### Type Parameters

***

### StageErrorCause

> **StageErrorCause** = keyof `ERROR_CAUSE`

Defined in: [Errors.js:97](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L97)

#### Type Parameters

## Variables

### ERROR

> `const` **ERROR**: `Readonly`\<`Record`\<`"WEBGPU_NOT_SUPPORTED"` \| `"ADAPTER_NOT_FOUND"` \| `"FEATURE_NOT_FOUND"` \| `"DEVICE_NOT_FOUND"` \| `"DEVICE_NOT_REQUESTED"` \| `"DEVICE_LOST"` \| `"INVALID_CALL"` \| `"INSTANCE_BUFFER_NOT_FOUND"` \| `"CAMERA_BINDING_NOT_FOUND"` \| `"INDEX_BUFFER_NOT_FOUND"` \| `"INDEX_DATA_NOT_FOUND"` \| `"SHADER_CODE_NOT_FOUND"` \| `"SHADER_MODULE_NOT_FOUND"` \| `"VERTEX_ENTRY_NOT_FOUND"` \| `"VERTEX_ATTRIBUTE_NOT_FOUND"` \| `"UNIFORM_NOT_FOUND"` \| `"STORAGE_NOT_FOUND"` \| `"PIPELINE_NOT_FOUND"` \| `"RENDERER_NOT_FOUND"` \| `"TEXTURE_SIZE_NOT_FOUND"` \| `"TEXTURE_NOT_FOUND"` \| `"INVALID_BYTES_PER_ROW"` \| `"CANVAS_NOT_FOUND"` \| `"CONTEXT_NOT_FOUND"` \| `"RENDER_PASS_NOT_FOUND"` \| `"COMMAND_ENCODER_NOT_FOUND"` \| `"TIMESTAMP_QUERY_NOT_FOUND"` \| `"COMMAND_BUFFER_SUBMITTED"` \| `"INVALID_ROTATION_ORDER"` \| `"FONT_NOT_FOUND"` \| `"CAMERA_BUFFER_NOT_FOUND"` \| `"FONT_RESOURCES_NOT_FOUND"`, `string`\>\>

Defined in: [Errors.js:59](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L59)

***

### ERROR\_CAUSE

> `const` **ERROR\_CAUSE**: `Readonly`\<`Record`\<`"PIPELINE_NOT_FOUND"` \| `"CANVAS_NOT_FOUND"` \| `"CONTEXT_NOT_FOUND"` \| `"COMMAND_ENCODER_NOT_FOUND"` \| [`ErrorCause`](#errorcause), `number`\>\>

Defined in: [Errors.js:108](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L108)

***

### ERROR\_MESSAGE

> `const` **ERROR\_MESSAGE**: `Readonly`\<`Record`\<`"WEBGPU_NOT_SUPPORTED"` \| `"ADAPTER_NOT_FOUND"` \| `"FEATURE_NOT_FOUND"` \| `"DEVICE_NOT_FOUND"` \| `"DEVICE_NOT_REQUESTED"` \| `"DEVICE_LOST"` \| `"INVALID_CALL"` \| `"INSTANCE_BUFFER_NOT_FOUND"` \| `"CAMERA_BINDING_NOT_FOUND"` \| `"INDEX_BUFFER_NOT_FOUND"` \| `"INDEX_DATA_NOT_FOUND"` \| `"SHADER_CODE_NOT_FOUND"` \| `"SHADER_MODULE_NOT_FOUND"` \| `"VERTEX_ENTRY_NOT_FOUND"` \| `"VERTEX_ATTRIBUTE_NOT_FOUND"` \| `"UNIFORM_NOT_FOUND"` \| `"STORAGE_NOT_FOUND"` \| `"PIPELINE_NOT_FOUND"` \| `"RENDERER_NOT_FOUND"` \| `"TEXTURE_SIZE_NOT_FOUND"` \| `"TEXTURE_NOT_FOUND"` \| `"INVALID_BYTES_PER_ROW"` \| `"CANVAS_NOT_FOUND"` \| `"CONTEXT_NOT_FOUND"` \| `"RENDER_PASS_NOT_FOUND"` \| `"COMMAND_ENCODER_NOT_FOUND"` \| `"TIMESTAMP_QUERY_NOT_FOUND"` \| `"COMMAND_BUFFER_SUBMITTED"` \| `"INVALID_ROTATION_ORDER"` \| `"FONT_NOT_FOUND"` \| `"CAMERA_BUFFER_NOT_FOUND"` \| `"FONT_RESOURCES_NOT_FOUND"`, `string`\>\>

Defined in: [Errors.js:77](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L77)

***

### EVENT

> `const` **EVENT**: `Readonly`\<`Record`\<`"DEVICE_LOST"`, `string`\>\>

Defined in: [Errors.js:54](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L54)

## Functions

### ThrowError()

> **ThrowError**(`error`, `message?`): `void`

Defined in: [Errors.js:123](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L123)

#### Parameters

##### error

`string`

##### message?

`string`

#### Returns

`void`

***

### ThrowWarning()

> **ThrowWarning**(`warning`, `message?`): `void`

Defined in: [Errors.js:134](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Errors.js#L134)

#### Parameters

##### warning

`string`

##### message?

`string`

#### Returns

`void`
