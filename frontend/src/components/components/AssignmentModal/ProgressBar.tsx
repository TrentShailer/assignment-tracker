import {
  Text,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import React from "preact";
import { StateUpdater } from "preact/hooks";

interface Props {
  progress: number;
  setProgress: StateUpdater<number>;
}

export default function ProgressBar({ progress, setProgress }: Props) {
  const onChangeEnd = (value: number) => {
    setProgress(value);
  };
  return (
    <Box>
      <Text>Progress</Text>
      <Slider
        aria-label="Progress"
        value={progress}
        onChangeEnd={onChangeEnd}
        step={1}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
}
