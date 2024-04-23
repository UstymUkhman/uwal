import { ERROR_MESSAGE, ERROR_CAUSE } from "@/Constants";

/**
 * @param {import("@/Constants").ErrorCause} error
 * @param {string} [message = undefined]
 */
export function throwError(error, message)
{
    throw new Error(ERROR_MESSAGE[error] + (message ?? ''), { cause: ERROR_CAUSE[error] });
}
