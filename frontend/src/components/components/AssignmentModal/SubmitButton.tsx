import { Button, UseToastOptions, useToast } from "@chakra-ui/react";
import { Dayjs } from "dayjs";
import React from "preact";
import axios, { AxiosRequestConfig } from "axios";
import { StateUpdater } from "preact/hooks";
import { Assignment } from "../../../assignment";
import { Course } from "../../../types/Course";
import { User } from "../../../types/User";
import { ErrorResponse } from "../../../types/ErrorResponse";

interface Props {
	loading: boolean;
	setLoading: StateUpdater<boolean>;
	name: string;
	setNameError: (v: string | null) => void;
	outDate: Dayjs;
	setOutDateError: (v: string | null) => void;
	dueDate: Dayjs;
	setDueDateError: (v: string | null) => void;
	progress: number;
	setProgressError: (v: string | null) => void;
	assignment: Assignment | null;
	course: Course;
	Close: () => void;
	FetchData: () => void;
	SetUser: (user: User | null) => void;
}

const validate_fields = (
	name: string,
	outDate: Dayjs,
	dueDate: Dayjs,
	progress: number
): {
	name_error: string | null;
	out_date_error: string | null;
	due_date_error: string | null;
	progress_error: string | null;
} => {
	let name_error: string | null = null;
	let out_date_error: string | null = null;
	let due_date_error: string | null = null;
	let progress_error: string | null = null;

	if (name === "" || name.length > 128) {
		name_error = "Name must be between 1-128 characters.";
	}

	if (!outDate) {
		out_date_error = "Out date must be a valid date.";
	}

	if (!dueDate) {
		due_date_error = "Due date must be a valid date";
	}

	if (progress > 100 || progress < 0) {
		progress_error = "Progress must be between 0-100";
	}

	return { name_error, out_date_error, due_date_error, progress_error };
};

export default function SubmitButton({
	loading,
	setLoading,
	name,
	setNameError,
	outDate,
	setOutDateError,
	dueDate,
	setDueDateError,
	progress,
	setProgressError,
	assignment,
	course,
	Close,
	FetchData,
	SetUser,
}: Props) {
	const toast = useToast();

	const Submit = async () => {
		setLoading(true);
		const { name_error, out_date_error, due_date_error, progress_error } = validate_fields(
			name,
			outDate,
			dueDate,
			progress
		);
		if (
			name_error !== null ||
			out_date_error !== null ||
			due_date_error !== null ||
			progress_error !== null
		) {
			setNameError(name_error);
			setDueDateError(due_date_error);
			setOutDateError(out_date_error);
			setProgressError(progress_error);
			setLoading(false);
			return;
		}

		let requestConf: AxiosRequestConfig;

		if (assignment) {
			requestConf = {
				method: "put",
				url: `/api/courses/${course.id}/assignments/${assignment.id}`,
				data: {
					name,
					due_date: dueDate.format("YYYY-MM-DDTHH:mm:ss"),
					out_date: outDate.format("YYYY-MM-DDTHH:mm:ss"),
					progress,
				},
			};
		} else {
			requestConf = {
				method: "post",
				url: `/api/courses/${course.id}/assignments`,
				data: {
					name,
					due_date: dueDate.format("YYYY-MM-DDTHH:mm:ss"),
					out_date: outDate.format("YYYY-MM-DDTHH:mm:ss"),
					progress,
				},
			};
		}

		try {
			await axios<Assignment>(requestConf);
			toast({
				title: `${assignment ? "Edited" : "Created"} Assignment`,
				status: "success",
			});
			FetchData();
			Close();
		} catch (e) {
			if (axios.isAxiosError<ErrorResponse>(e) && e.response !== undefined) {
				const error = e.response.data;
				if (error.status === 400) {
					if (error.fields !== null && error.fields.length > 0) {
						error.fields.forEach((field) => {
							if (field.field === "name") {
								setNameError(field.message);
							} else if (field.field === "out_date") {
								setOutDateError(field.message);
							} else if (field.field === "due_date") {
								setDueDateError(field.message);
							} else if (field.field === "progress") {
								setProgressError(field.message);
							} else {
								toast({
									title: `Invalid ${field.field}`,
									description: field.message,
									status: "warning",
									duration: 5000,
								});
							}
						});
					} else {
						toast({
							title: `Failed to ${assignment ? "edit" : "create"} assignment`,
							description: error.message,
							status: "warning",
							duration: 5000,
						});
					}
				} else if (error.status === 401) {
					toast({
						title: `Failed to ${assignment ? "edit" : "create"} assignment`,
						description: error.message,
						status: "warning",
						duration: 5000,
					});
					SetUser(null);
				} else if (error.status === 404) {
					toast({
						title: `Failed to ${assignment ? "edit" : "create"} assignment`,
						description: error.message,
						status: "warning",
						duration: 5000,
					});
					FetchData();
				} else if (error.status === 410) {
					toast({
						title: `Failed to ${assignment ? "edit" : "create"} assignment`,
						description: error.message,
						status: "error",
						duration: 5000,
					});
					SetUser(null);
				} else if (error.status === 500) {
					toast({
						title: "Internal server error",
						description: error.message,
						status: "error",
						duration: 5000,
					});
					console.error(error);
				}
			} else {
				toast({
					title: "An unexpected error ocurred",
					description: e,
					status: "error",
					duration: 5000,
				});
				console.error(e);
			}
		}

		setLoading(false);
	};
	return (
		<Button isLoading={loading} colorScheme="blue" onClick={Submit}>
			{assignment !== null ? "Edit" : "Create"}
		</Button>
	);
}
