import {
    Alert,
    AlertIcon,
    Card,
    Container,
    Flex,
    Heading,
    Stack,
    useToast,
} from "@chakra-ui/react";
import React from "preact";
import axios from "axios";
import Footer from "./Footer";
import { useState } from "preact/hooks";
import AuthInput from "./Auth/Username";
import Submit from "./Auth/Submit";
import Password from "./Auth/Password";
import Username from "./Auth/Username";
import { User } from "../../../backend/bindings/User";
import { ErrorResponse } from "../../../backend/bindings/ErrorResponse";

interface Props {
    SetUser: (user: User) => void;
}

const ValidateFields = (
    username: string,
    password: string
): { username_error: string | null; password_error: string | null } => {
    let username_error: string | null = null;
    let password_error: string | null = null;
    if (!username || username.length === 0 || username.length > 128) {
        username_error = "Username must be between 1-128 characters.";
    }
    if (!password || password.length === 0 || password.length > 128) {
        password_error = "Password must be between 1-128 characters.";
    }
    return { username_error, password_error };
};

const AttemptSubmit = async (
    uri: string,
    username: string,
    password: string
): Promise<User> => {
    try {
        const { data } = await axios.post<User>(uri, {
            username,
            password,
        });
        return data;
    } catch (error) {}
};

export default function Auth({ SetUser }: Props) {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);

    const toast = useToast();

    const trySubmit = async (type: "login" | "register") => {
        setLoading(true);
        setError(null);
        setUsernameError(null);
        setPasswordError(null);
        const { username_error, password_error } = ValidateFields(
            username,
            password
        );
        if (username_error !== null || password_error !== null) {
            setLoading(false);
            setError("Username or password is invalid.");
            setUsernameError(username_error);
            setPasswordError(password_error);
            return;
        }

        const uri = type === "login" ? "/api/session" : "/api/users";

        try {
            const { data } = await axios.post<User>(uri, {
                username,
                password,
            });
            SetUser(data);
        } catch (e) {
            if (
                axios.isAxiosError<ErrorResponse>(e) &&
                e.response !== undefined
            ) {
                const error = e.response.data;
                if (error.status === 400) {
                    setError(error.message);
                    if (error.fields !== null) {
                        error.fields.forEach((field) => {
                            if (field.field === "username") {
                                setUsernameError(field.message);
                            } else if (field.field === "password") {
                                setPasswordError(field.message);
                            }
                        });
                    }
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
        <Container maxW="container.xs">
            <Flex
                justifyContent="center"
                alignItems="center"
                minH="calc(100vh - 60px)"
                direction="column"
            >
                <Heading textAlign="center" mb={8} mt={-20} size="2xl">
                    Assignment Tracker
                </Heading>
                <Card maxW="100%" w={550} p={4}>
                    <Stack gap={4}>
                        <Username
                            loading={loading}
                            value={username}
                            setValue={(v) => {
                                setUsername(v);
                                setUsernameError(null);
                            }}
                            error={usernameError}
                        />
                        <Password
                            loading={loading}
                            value={password}
                            setValue={(v) => {
                                setPassword(v);
                                setPasswordError(null);
                            }}
                            trySubmit={trySubmit}
                            error={passwordError}
                        />
                        {error ? (
                            <Alert status={"warning"}>
                                <AlertIcon />
                                {error}
                            </Alert>
                        ) : null}
                        <Submit trySubmit={trySubmit} loading={loading} />
                    </Stack>
                </Card>
            </Flex>
            <Footer />
        </Container>
    );
}
