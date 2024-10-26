import { AxiosError } from "axios";
import { ErrorResponse } from "./types/ErrorResponse";
function is_error_response(error: any): error is ErrorResponse {
	return (
		error !== undefined &&
		error.status !== undefined &&
		error.message !== undefined &&
		error.fields !== undefined
	);
}

export { is_error_response };
