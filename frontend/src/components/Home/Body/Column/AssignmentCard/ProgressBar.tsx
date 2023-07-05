import React from "preact";
import { Assignment } from "../../../../Home";
import { Progress } from "@chakra-ui/react";
import { useEffect, useState } from "preact/hooks";

interface Props {
  progress: number;
}

export default function ProgressBar({ progress }: Props) {
  const [color, setColor] = useState("red");

  useEffect(() => {
    if (progress > 90) setColor("green");
    else if (progress > 75) setColor("yellow");
    else if (progress > 50) setColor("orange");
    else setColor("red");
  }, [progress]);

  return <Progress colorScheme={color} value={progress} />;
}
