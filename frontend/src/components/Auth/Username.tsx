import {
    Text,
    Box,
    Input,
    FormHelperText,
    FormControl,
    FormLabel,
    FormErrorMessage,
} from "@chakra-ui/react";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater } from "preact/hooks";
interface Props {
    loading: boolean;
    value: string;
    setValue: StateUpdater<string>;
    error: string | null;
}

export default function Username({ loading, value, setValue, error }: Props) {
    return (
        <FormControl isInvalid={error !== null}>
            <FormLabel
                textColor={loading ? "whiteAlpha.300" : "whiteAlpha.900"}
            >
                Username
            </FormLabel>
            <Input
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value: string = (e.target as HTMLInputElement).value;
                    if (value.length > 128) return;
                    setValue(value);
                }}
                isDisabled={loading}
                placeholder="Enter Username"
            />
            {error !== null ? (
                <FormErrorMessage>{error}</FormErrorMessage>
            ) : null}
        </FormControl>
    );
}
