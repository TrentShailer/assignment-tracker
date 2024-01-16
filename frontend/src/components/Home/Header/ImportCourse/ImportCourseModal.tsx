import {
    Text,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    useToast,
    UseToastOptions,
    ModalOverlay,
    Input,
    ModalFooter,
    Button,
    CreateToastFnReturn,
} from "@chakra-ui/react";
import axios from "axios";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { User } from "../../../../../../backend/bindings/User";
import { ErrorResponse } from "../../../../../../backend/bindings/ErrorResponse";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    FetchData: () => void;
    SetUser: (user: User | null) => void;
}

export default function ImportCourseModal({
    isOpen,
    onClose,
    FetchData,
    SetUser,
}: Props) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const Submit = async () => {
        setLoading(true);
        try {
            await axios.post("/api/courses/import", {
                course_id: code,
            });
            toast({ title: "Imported course", status: "success" });
            FetchData();
            Exit();
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 401) {
                    toast({
                        title: "Failed import course",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                    SetUser(null);
                } else if (error.status === 404) {
                    toast({
                        title: "Failed import course",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                } else if (error.status === 410) {
                    toast({
                        title: "Failed to import course",
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
        setCode("");
        onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            Submit();
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = (e.target as HTMLInputElement).value;
        if (value.length > 36) return;
        setCode(value);
    };

    return (
        <Modal isOpen={isOpen} onClose={Exit}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Import Course</ModalHeader>
                <ModalCloseButton isDisabled={loading} />
                <ModalBody>
                    <Text>Course Code</Text>
                    <Input
                        isDisabled={loading}
                        value={code}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        autofocus
                        placeholder="Enter course code"
                    />
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
                        Import
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
