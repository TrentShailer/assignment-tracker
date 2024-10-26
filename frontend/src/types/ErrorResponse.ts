import type { FieldError } from "./FieldError";

/**
 * An error response from the API.
 */
export type ErrorResponse = { status: number; message: string; fields: Array<FieldError> | null };
