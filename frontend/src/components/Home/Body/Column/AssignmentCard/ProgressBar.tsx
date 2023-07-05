import React from "preact";
import { Assignment } from "../../../../Home";
import { Progress } from "@chakra-ui/react";
import { useEffect, useState } from "preact/hooks";

interface Props {
  assignment: Assignment;
}

export default function ProgressBar({ assignment }: Props) {
  const [color, setColor] = useState("red");

  useEffect(() => {
    if (assignment.progress > 90) setColor("green");
    else if (assignment.progress > 75) setColor("yellow");
    else if (assignment.progress > 50) setColor("orange");
    else setColor("red");
  }, [assignment.progress]);

  return <Progress colorScheme={color} value={assignment.progress} />;
}
