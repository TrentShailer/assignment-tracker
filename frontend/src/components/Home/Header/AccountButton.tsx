import {
    Divider,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Tooltip,
    useToast,
} from "@chakra-ui/react";
import { User } from "../../../../../backend/bindings/User";
import Icon from "../../components/Icon";
import axios from "axios";
import { ErrorResponse } from "../../../../../backend/bindings/ErrorResponse";
import { useState } from "preact/hooks";
import DeleteModal from "./AccountButton/DeleteModal";

type Props = {
    SetUser: (user: User | null) => void;
};

export default function AccountButton({ SetUser }: Props) {
    const [show_delete, set_show_delete] = useState(false);
    const toast = useToast();

    const Logout = async () => {
        try {
            await axios.delete("/api/session");
            SetUser(null);
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 500) {
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
    };

    return (
        <>
            <DeleteModal
                open={show_delete}
                on_close={() => set_show_delete(false)}
                SetUser={SetUser}
            />
            <Menu>
                <Tooltip label="Account">
                    <MenuButton>
                        <IconButton
                            aria-label="Account Menu"
                            as="IconButton"
                            icon={
                                <Icon
                                    color="whiteAlpha.900"
                                    size={7}
                                    path="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                                />
                            }
                        />
                    </MenuButton>
                </Tooltip>
                <MenuList>
                    <MenuItem
                        onClick={() => set_show_delete(true)}
                        color="red.400"
                        icon={
                            <Icon
                                color="red.400"
                                size={5}
                                path="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                            />
                        }
                    >
                        Delete Account
                    </MenuItem>
                    <Divider mt={2} mb={2} />
                    <MenuItem
                        color="red.200"
                        icon={
                            <Icon
                                color="red.200"
                                size={5}
                                path="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
                            />
                        }
                        onClick={Logout}
                    >
                        Logout
                    </MenuItem>
                </MenuList>
            </Menu>
        </>
    );
}
