import { Box } from "@chakra-ui/react";
import React from "preact";
import Icon from "../../../../components/Icon";
import { useState } from "preact/hooks";
import { Assignment, Course } from "../../../../Home";

interface Props {
  OpenAssignment: (assignment: Assignment, course: Course) => void;
  course: Course;
}

export default function Create({ course, OpenAssignment }: Props) {
  return (
    <Box>
      <Box cursor="pointer" onClick={() => OpenAssignment(null, course)}>
        <Icon
          color="whiteAlpha.900"
          size={8}
          path="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
        />
      </Box>
    </Box>
  );
}
