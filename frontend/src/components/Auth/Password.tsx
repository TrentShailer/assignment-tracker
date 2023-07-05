import {
  Text,
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater, useState } from "preact/hooks";

interface Props {
  loading: boolean;
  password: string;
  setPassword: StateUpdater<string>;
  trySubmit: (type: "login" | "register") => void;
}

export default function Password({
  loading,
  password,
  setPassword,
  trySubmit,
}: Props) {
  const [show, setShow] = useState(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "return") {
      e.preventDefault();
      trySubmit("login");
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value: string = (e.target as HTMLInputElement).value;
    if (value.length > 256) return;
    setPassword(value);
  };

  return (
    <Box>
      <Text textColor={loading ? "whiteAlpha.300" : "whiteAlpha.900"}>
        Password
      </Text>
      <InputGroup size="md">
        <Input
          onKeyDown={onKeyDown}
          value={password}
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
    </Box>
  );
}
