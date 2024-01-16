import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    useToast,
} from "@chakra-ui/react";
import { User } from "../../../../../../backend/bindings/User";
import { useState } from "preact/hooks";
import axios from "axios";
import { ErrorResponse } from "../../../../../../backend/bindings/ErrorResponse";

type Props = {
    SetUser: (user: User | null) => void;
    open: boolean;
    on_close: () => void;
};

export default function DeleteModal({ SetUser, open, on_close }: Props) {
    const [loading, set_loading] = useState(false);

    const toast = useToast();

    const delete_account = async () => {
        set_loading(true);
        try {
            await axios.delete("/api/user");
            SetUser(null);
            toast({
                title: "Deleted account",
                status: "success",
                duration: 5000,
            });
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 401) {
                    toast({
                        title: "Failed to delete account",
                        description: error.message,
                        status: "warning",
                        duration: 5000,
                    });
                    SetUser(null);
                } else if (error.status === 410) {
                    toast({
                        title: "Failed to delete account",
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

        set_loading(false);
    };
    return (
        <Modal isOpen={open} onClose={on_close}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delete Account?</ModalHeader>
                <ModalCloseButton isDisabled={loading} />
                <ModalBody>
                    This will delete your account, all courses, and all
                    assginments permanantly.
                </ModalBody>

                <ModalFooter>
                    <Button
                        isDisabled={loading}
                        colorScheme="blue"
                        mr={3}
                        onClick={on_close}
                    >
                        Cancel
                    </Button>
                    <Button
                        isLoading={loading}
                        onClick={delete_account}
                        colorScheme="red"
                    >
                        Delete Account
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
