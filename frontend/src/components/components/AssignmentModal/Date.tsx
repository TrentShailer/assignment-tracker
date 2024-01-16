import {
    Text,
    Input,
    Box,
    FormControl,
    FormErrorMessage,
    FormLabel,
} from "@chakra-ui/react";
import dayjs, { Dayjs } from "dayjs";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater, useEffect, useState } from "preact/hooks";

interface Props {
    label: string;
    date: Dayjs | null;
    setDate: StateUpdater<Dayjs>;
    dateError: string | null;
}

export default function Date({ label, date, setDate, dateError }: Props) {
    const [error, setError] = useState<string | null>(null);

    const [value, setValue] = useState(
        date ? date.format("YYYY-MM-DDTHH:mm") : ""
    );

    useEffect(() => {
        setValue(date ? date.format("YYYY-MM-DDTHH:mm") : "");
    }, [date]);

    useEffect(() => {
        setError(dateError);
    }, [dateError]);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = (e.target as HTMLInputElement).value;
        setValue(newValue);

        if (!newValue) {
            setError(null);
            setDate(null);
            return;
        }

        try {
            const dayjsVal = dayjs(newValue);
            setError(null);
            setDate(dayjsVal);
        } catch (_) {}
    };

    return (
        <FormControl isInvalid={error !== null}>
            <FormLabel>{label}</FormLabel>
            <Input
                value={value}
                onChange={onChange}
                placeholder={`Enter ${label}`}
                type="datetime-local"
            />
            {error !== null ? (
                <FormErrorMessage>{error}</FormErrorMessage>
            ) : null}
        </FormControl>
    );
}
