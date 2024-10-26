import React from "preact";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Text,
	useToast,
	UseToastOptions,
} from "@chakra-ui/react";
import { useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";
import axios from "axios";
import { Course } from "../../../../../../types/Course";
import { User } from "../../../../../../types/User";
import { ErrorResponse } from "../../../../../../types/ErrorResponse";

interface Props {
	course: Course;
	isOpen: boolean;
	onClose: () => void;
	FetchData: () => void;
	SetUser: (user: User | null) => void;
}

export default function Edit({ course, isOpen, onClose, FetchData, SetUser }: Props) {
	const [name, setName] = useState(course.name);
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		if (value.length > 128) return;
		setName(value);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			Submit();
		}
	};

	const Cancel = () => {
		setName(course.name);
		onClose();
	};

	const Submit = async () => {
		setLoading(true);
		try {
			await axios.put(`/api/courses/${course.id}`, {
				name,
			});
			toast({ title: "Updated course", status: "success" });
			FetchData();
			onClose();
		} catch (e) {
			if (axios.isAxiosError<ErrorResponse>(e) && e.response !== undefined) {
				const error = e.response.data;
				if (error.status === 400) {
					if (error.fields !== null && error.fields.length > 0) {
						toast({
							title: "Failed to edit course",
							description: error.fields[0].message,
							status: "warning",
							duration: 5000,
						});
					} else {
						toast({
							title: "Failed to edit course",
							description: error.message,
							status: "warning",
							duration: 5000,
						});
					}
				} else if (error.status === 401) {
					toast({
						title: "Failed to edit course",
						description: error.message,
						status: "warning",
						duration: 5000,
					});
					SetUser(null);
				} else if (error.status === 404) {
					toast({
						title: "Failed to edit course",
						description: error.message,
						status: "warning",
						duration: 5000,
					});
					FetchData();
				} else if (error.status === 410) {
					toast({
						title: "Failed to edit course",
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
		<Modal isOpen={isOpen} onClose={Cancel}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Edit Course</ModalHeader>
				<ModalCloseButton isDisabled={loading} />
				<ModalBody>
					<Text>Course Name</Text>
					<Input
						isDisabled={loading}
						value={name}
						onKeyDown={onKeyDown}
						onChange={onChange}
						autofocus
						placeholder="Enter course name"
					/>
				</ModalBody>

				<ModalFooter>
					<Button isDisabled={loading} mr={3} onClick={Cancel}>
						Cancel
					</Button>
					<Button isLoading={loading} colorScheme="blue" onClick={Submit}>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
