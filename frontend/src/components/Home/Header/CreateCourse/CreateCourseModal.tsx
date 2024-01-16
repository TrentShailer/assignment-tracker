import {
    Text,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Input,
    ModalFooter,
    Button,
    useToast,
    UseToastOptions,
    RadioGroup,
    Stack,
    Radio,
    Divider,
    FormControl,
    FormLabel,
    FormErrorMessage,
} from "@chakra-ui/react";
import axios from "axios";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { User } from "../../../../../../backend/bindings/User";
import { Course } from "../../../../../../backend/bindings/Course";
import { ErrorResponse } from "../../../../../../backend/bindings/ErrorResponse";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    FetchData: () => void;
    SetUser: (user: User | null) => void;
}

export default function CreateCourseModal({
    isOpen,
    onClose,
    FetchData,
    SetUser,
}: Props) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, set_error] = useState<string | null>();

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
    const Submit = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post<Course>(`/api/courses`, {
                name,
            });
            toast({ title: "Created Course", status: "success" });
            FetchData();
            Exit();
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 400) {
                    if (error.fields !== null && error.fields.length > 0) {
                        const field = error.fields[0];
                        set_error(field.message);
                    } else {
                        set_error(error.message);
                    }
                } else if (error.status === 401) {
                    toast({
                        title: "Failed to create course",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                    SetUser(null);
                } else if (error.status === 410) {
                    toast({
                        title: "Failed to create course",
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

    const Exit = () => {
        setName("");
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={Exit}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Course</ModalHeader>
                <ModalCloseButton isDisabled={loading} />
                <ModalBody>
                    <FormControl isInvalid={error !== null}>
                        <FormLabel>Course Name</FormLabel>
                        <Input
                            isDisabled={loading}
                            value={name}
                            onKeyDown={onKeyDown}
                            onChange={onChange}
                            autofocus
                            placeholder="Enter course name"
                        />
                        {error !== null ? (
                            <FormErrorMessage>{error}</FormErrorMessage>
                        ) : null}
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button isDisabled={loading} mr={3} onClick={Exit}>
                        Cancel
                    </Button>
                    <Button
                        isLoading={loading}
                        colorScheme="blue"
                        onClick={Submit}
                    >
                        Create
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
