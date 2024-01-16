import { Button, UseToastOptions, useToast } from "@chakra-ui/react";
import React from "preact";
import axios from "axios";
import { StateUpdater } from "preact/hooks";
import { User } from "../../../../../backend/bindings/User";
import { Assignment } from "../../../assignment";
import { Course } from "../../../../../backend/bindings/Course";
import { ErrorResponse } from "../../../../../backend/bindings/ErrorResponse";

interface Props {
    loading: boolean;
    setLoading: StateUpdater<boolean>;
    assignment: Assignment;
    course: Course;
    FetchData: () => void;
    Close: () => void;
    SetUser: (user: User | null) => void;
}

export default function DeleteButton({
    loading,
    setLoading,
    assignment,
    course,
    FetchData,
    Close,
    SetUser,
}: Props) {
    const toast = useToast();
    const Delete = async () => {
        setLoading(true);
        try {
            await axios.delete(
                `/api/courses/${course.id}/assignments/${assignment.id}`
            );
            toast({ title: "Deleted Assignment", status: "success" });
            FetchData();
            Close();
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 401) {
                    toast({
                        title: "Failed to delete assignment",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                    SetUser(null);
                } else if (error.status === 404) {
                    toast({
                        title: "Failed to delete assignment",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                    FetchData();
                    Close();
                } else if (error.status === 410) {
                    toast({
                        title: "Failed to delete assignment",
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
        <Button
            isDisabled={loading}
            mr={"auto"}
            onClick={Delete}
            colorScheme="red"
        >
            Delete
        </Button>
    );
}
