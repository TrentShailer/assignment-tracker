import { Text, Box, Input } from "@chakra-ui/react";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater } from "preact/hooks";
interface Props {
  loading: boolean;
  username: string;
  setUsername: StateUpdater<string>;
}
export default function Username({ loading, username, setUsername }: Props) {
  return (
    <Box>
      <Text textColor={loading ? "whiteAlpha.300" : "whiteAlpha.900"}>
        Username
      </Text>
      <Input
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value: string = (e.target as HTMLInputElement).value;
          if (value.length > 256) return;
          setUsername(value);
        }}
        isDisabled={loading}
        placeholder="Enter Username"
      />
    </Box>
  );
}
