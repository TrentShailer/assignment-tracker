import React from "preact";
import { Course } from "../../Home";
import { Text, Box, Input } from "@chakra-ui/react";

interface Props {
  course: Course;
}

export default function CourseDisplay({ course }: Props) {
  return (
    <Box>
      <Text color="whiteAlpha.500">Course</Text>
      <Input isDisabled={true} value={course.name} />
    </Box>
  );
}
