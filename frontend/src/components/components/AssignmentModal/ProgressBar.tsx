import {
  Text,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import React from "preact";
import { StateUpdater, useEffect, useState } from "preact/hooks";

interface Props {
  progress: number;
  setProgress: StateUpdater<number>;
}

export default function ProgressBar({ progress, setProgress }: Props) {
  return (
    <Box>
      <Text>Progress</Text>
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
    </Box>
  );
}
