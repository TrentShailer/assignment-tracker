import { Text, Box, Input } from "@chakra-ui/react";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater } from "preact/hooks";

interface Props {
  name: string;
  setName: StateUpdater<string>;
}

export default function Name({ name, setName }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    if (value.length > 256) return;
    setName(value);
  };

  return (
    <Box>
      <Text>Name</Text>
      <Input
        autofocus
        value={name}
        placeholder="Enter Name"
        onChange={handleChange}
      />
    </Box>
  );
}
