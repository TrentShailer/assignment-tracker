import {
    Text,
    Box,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    FormErrorMessage,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater, useState } from "preact/hooks";

interface Props {
    loading: boolean;
    value: string;
    setValue: StateUpdater<string>;
    trySubmit: (type: "login" | "register") => void;
    error: string | null;
}

export default function Password({
    loading,
    value,
    setValue,
    trySubmit,
    error,
}: Props) {
    const [show, setShow] = useState(false);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            trySubmit("login");
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value: string = (e.target as HTMLInputElement).value;
        if (value.length > 256) return;
        setValue(value);
    };

    return (
        <FormControl isInvalid={error !== null}>
            <FormLabel
                textColor={loading ? "whiteAlpha.300" : "whiteAlpha.900"}
            >
                Password
            </FormLabel>
            <InputGroup size="md">
                <Input
                    onKeyDown={onKeyDown}
                    value={value}
                    onChange={onChange}
                    isDisabled={loading}
                    pr="4.5rem"
                    type={show ? "text" : "password"}
                    placeholder="Enter password"
                />
                <InputRightElement width="4.5rem">
                    <Button
                        isDisabled={loading}
                        h="1.75rem"
                        size="sm"
                        onClick={() => {
                            setShow(!show);
                        }}
                    >
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>
            {error !== null ? (
                <FormErrorMessage>{error}</FormErrorMessage>
            ) : null}
        </FormControl>
    );
}
