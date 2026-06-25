[UWAL](Modules.md) / Errors

# Errors

## Type Aliases

### ErrorCause

> **ErrorCause** = `"WEBGPU_NOT_SUPPORTED"` \| `"ADAPTER_NOT_FOUND"` \| `"DEVICE_NOT_FOUND"` \| `"DEVICE_NOT_REQUESTED"` \| `"DEVICE_LOST"` \| `"CANVAS_NOT_FOUND"` \| `"CONTEXT_NOT_FOUND"` \| `"COMMAND_ENCODER_NOT_FOUND"` \| `"PIPELINE_NOT_FOUND"`

Defined in: [Errors.js:104](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Errors.js#L104)

#### Type Parameters

## Variables

### ERROR\_CAUSE

> `const` **ERROR\_CAUSE**: `Readonly`\<`Record`\<[`ErrorCause`](#errorcause), `number`\>\>

Defined in: [Errors.js:108](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Errors.js#L108)

#### Description

Possible internal errors and their `cause` values to handle them gracefully.
