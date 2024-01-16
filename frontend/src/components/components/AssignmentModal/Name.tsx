import {
    Text,
    Box,
    Input,
    FormErrorMessage,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater } from "preact/hooks";

interface Props {
    name: string;
    setName: StateUpdater<string>;
    nameError: string | null;
}

export default function Name({ name, setName, nameError }: Props) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = (e.target as HTMLInputElement).value;
        if (value.length > 128) return;
        setName(value);
    };

    return (
        <FormControl isInvalid={nameError !== null}>
            <FormLabel>Name</FormLabel>
            <Input
                autofocus
                value={name}
                placeholder="Enter Name"
                onChange={handleChange}
            />
            {nameError !== null ? (
                <FormErrorMessage>{nameError}</FormErrorMessage>
            ) : null}
        </FormControl>
    );
}
