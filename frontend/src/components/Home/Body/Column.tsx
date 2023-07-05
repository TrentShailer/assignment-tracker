import {
  Card,
  Flex,
  Heading,
  Icon,
  IconButton,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import React from "preact";
import { Assignment, Course } from "../../Home";
import Header from "./Column/Header";
import AssignmentCard from "./Column/AssignmentCard";
import dayjs from "dayjs";

interface Props {
  assignments: Assignment[];
  course: Course;
  courses?: Course[];
  FetchData: () => void;
  OpenAssignment: (assignment: Assignment, course: Course) => void;
}

export default function Column({
  course,
  courses,
  assignments,
  FetchData,
  OpenAssignment,
}: Props) {
  return (
    <Card p={4} pt={2} minW="350px" h="100%">
      <Header
        OpenAssignment={OpenAssignment}
        FetchData={FetchData}
        course={course}
      />
      <Stack gap={2} overflow="auto">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            OpenAssignment={OpenAssignment}
            course={
              courses
                ? courses.find((course) => course.id === assignment.course_id)
                : course
            }
          />
        ))}
      </Stack>
    </Card>
  );
}
