import React from "preact";
import { Icon as BaseIcon } from "@chakra-ui/react";

interface Props {
  path: string;
  size: number | string;
  color: string;
}

export default function Icon({ path, size, color }: Props) {
  return (
    <BaseIcon color={color} viewBox="0 0 24 24" w={size} h={size}>
      <path fill="currentColor" d={path} />
    </BaseIcon>
  );
}
