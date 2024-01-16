import {
    Text,
    Box,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    FormErrorMessage,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import React from "preact";
import { StateUpdater, useEffect, useState } from "preact/hooks";

interface Props {
    progress: number;
    setProgress: StateUpdater<number>;
    progressError: string | null;
}

export default function ProgressBar({
    progress,
    setProgress,
    progressError,
}: Props) {
    return (
        <FormControl isInvalid={progressError !== null}>
            <FormLabel>Progress</FormLabel>
            <Slider
                aria-label="Progress"
                value={progress}
                onChange={setProgress}
                step={1}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
            {progressError !== null ? (
                <FormErrorMessage>{progressError}</FormErrorMessage>
            ) : null}
        </FormControl>
    );
}
