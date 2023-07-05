import {
  Text,
  Card,
  Stack,
  Flex,
  Heading,
  Divider,
  Progress,
  Box,
} from "@chakra-ui/react";
import React from "preact";
import { Assignment, Course } from "../../../Home";
import { useEffect, useState } from "preact/hooks";
import dayjs, { Dayjs } from "dayjs";
import TimeText from "./AssignmentCard/TimeText";
import TimeProgress from "./AssignmentCard/TimeProgress";
import ProgressBar from "./AssignmentCard/ProgressBar";

interface Props {
  course: Course;
  assignment: Assignment;
  OpenAssignment: (assignment: Assignment, course: Course) => void;
}

export default function AssignmentCard({
  course,
  assignment,
  OpenAssignment,
}: Props) {
  return (
    <Card
      onClick={() => OpenAssignment(assignment, course)}
      cursor="pointer"
      background="whiteAlpha.200"
      p={4}
    >
      <Text>
        {course.name} — {assignment.name}
      </Text>
      <ProgressBar assignment={assignment} />
      <TimeText assignment={assignment} />
      <TimeProgress assignment={assignment} />
    </Card>
  );
}
