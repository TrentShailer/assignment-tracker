import { Button, ButtonGroup } from "@chakra-ui/react";
import React from "preact";

interface Props {
  loading: boolean;
  trySubmit: (type: "login" | "register") => void;
}

export default function Submit({ loading, trySubmit }: Props) {
  return (
    <ButtonGroup isDisabled={loading} isAttached>
      <Button w="50%" onClick={() => trySubmit("register")}>
        Register
      </Button>
      <Button w="50%" colorScheme="blue" onClick={() => trySubmit("login")}>
        Login
      </Button>
    </ButtonGroup>
  );
}
