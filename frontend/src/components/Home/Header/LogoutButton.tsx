import { IconButton, Tooltip, useToast } from "@chakra-ui/react";
import axios from "axios";
import React from "preact";
import { useState } from "preact/hooks";
import { User } from "../../..";
import Icon from "../../components/Icon";

interface Props {
  SetUser: (user: User | null) => void;
}

export default function LogoutButton({ SetUser }: Props) {
  const toast = useToast();
  const Logout = async () => {
    try {
      await axios.delete("/api/v1/session");
      SetUser(null);
    } catch (err) {
      toast({ title: "Failed to logout", status: "error" });
    }
  };

  return (
    <Tooltip label="Logout">
      <IconButton
        onClick={Logout}
        aria-label="Logout"
        icon={
          <Icon
            color="whiteAlpha.900"
            size={7}
            path="M14.08,15.59L16.67,13H7V11H16.67L14.08,8.41L15.5,7L20.5,12L15.5,17L14.08,15.59M19,3A2,2 0 0,1 21,5V9.67L19,7.67V5H5V19H19V16.33L21,14.33V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19Z"
          />
        }
      />
    </Tooltip>
  );
}