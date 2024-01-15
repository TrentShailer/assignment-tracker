import {
    Alert,
    AlertIcon,
    Card,
    Container,
    Flex,
    Heading,
    Stack,
} from "@chakra-ui/react";
import React from "preact";
import axios from "axios";
import Footer from "./Footer";
import { User } from "..";
import { useState } from "preact/hooks";
import Username from "./Auth/Username";
import Password from "./Auth/Password";
import Submit from "./Auth/Submit";

interface Props {
    SetUser: (user: User) => void;
}

const ErrorMessage = {
    "error.null": "Username or password is empty.",
    "error.bounds": "Username or password is too long.",
    "error.unique": "Username already exists.",
    "error.username_password": "Username or password are incorrect.",
    "error.server": "Something went wrong.",
};

const ValidateFields = (
    username: string,
    password: string
): true | "error.null" => {
    if (!username || username.length === 0) {
        return "error.null";
    }
    if (!password || password.length === 0) {
        return "error.null";
    }
    return true;
};

const AttemptSubmit = async (
    uri: string,
    username: string,
    password: string
): Promise<SubmitResult> => {
    try {
        const { data } = await axios.post<SubmitResult>(uri, {
            username,
            password,
        });
        return data;
    } catch (error) {
        return { ok: false, reason: "error.server" };
    }
};

type SubmitResult = { ok: true; user: User } | { ok: false; reason: string };

export default function Auth({ SetUser }: Props) {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const trySubmit = async (type: "login" | "register") => {
        setLoading(true);
        setError(null);
        const validFields = ValidateFields(username, password);
        if (validFields !== true) {
            setLoading(false);
            setError(ErrorMessage[validFields]);
            return;
        }

        const uri = type === "login" ? "/api/session" : "/api/users";

        const data = await AttemptSubmit(uri, username, password);
        if (data.ok === true) {
            SetUser(data.user);
        } else {
            setLoading(false);
            setError(ErrorMessage[data.reason]);
        }
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
                            username={username}
                            setUsername={setUsername}
                        />
                        <Password
                            loading={loading}
                            password={password}
                            setPassword={setPassword}
                            trySubmit={trySubmit}
                        />
                        {error ? (
                            <Alert status="error">
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
