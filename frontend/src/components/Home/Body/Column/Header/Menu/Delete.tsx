import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useToast,
} from "@chakra-ui/react";
import React from "preact";
import { useRef, useState } from "preact/hooks";
import axios from "axios";
import { Course } from "../../../../../../../../backend/bindings/Course";
import { User } from "../../../../../../../../backend/bindings/User";
import { ErrorResponse } from "../../../../../../../../backend/bindings/ErrorResponse";

interface Props {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
    FetchData: () => void;
    SetUser: (user: User | null) => void;
}

export default function Delete({
    course,
    isOpen,
    onClose,
    FetchData,
    SetUser,
}: Props) {
    const cancelRef = useRef();
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const tryDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`/api/courses/${course.id}`);
            toast({ title: "Delete Successful", status: "success" });
            FetchData();
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 401) {
                    toast({
                        title: "Failed to delete course",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                    SetUser(null);
                } else if (error.status === 404) {
                    toast({
                        title: "Failed to delete course",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                } else if (error.status === 410) {
                    toast({
                        title: "Failed to delete course",
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
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete Course '{course.name}'
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            isDisabled={loading}
                            ref={cancelRef}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            isLoading={loading}
                            colorScheme="red"
                            onClick={tryDelete}
                            ml={3}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}
