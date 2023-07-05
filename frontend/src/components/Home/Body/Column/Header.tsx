import React from "preact";
import { Assignment, Course } from "../../../Home";
import { Flex, Heading } from "@chakra-ui/react";
import Icon from "../../../components/Icon";
import Menu from "./Header/Menu";
import Create from "./Header/Create";

interface Props {
  course: Course;
  FetchData: () => void;
  OpenAssignment: (assignment: Assignment, course: Course) => void;
}

export default function Header({ course, FetchData, OpenAssignment }: Props) {
  return (
    <Flex
      mb={4}
      h={10}
      justifyContent="space-between"
      gap={4}
      alignItems="center"
    >
      <Heading lineHeight="shorter" size="md">
        {course.name}
      </Heading>
      {course.id ? (
        <Flex gap={4} alignItems="center">
          <Create OpenAssignment={OpenAssignment} course={course} />
          <Menu FetchData={FetchData} course={course} />
        </Flex>
      ) : null}
    </Flex>
  );
}
