import React from "preact";
import { Flex, Heading } from "@chakra-ui/react";
import Icon from "../../../components/Icon";
import Menu from "./Header/Menu";
import Create from "./Header/Create";
import { Course } from "../../../../../../backend/bindings/Course";
import { Assignment } from "../../../../assignment";
import { User } from "../../../../../../backend/bindings/User";

interface Props {
    course: Course;
    FetchData: () => void;
    OpenAssignment: (assignment: Assignment, course: Course) => void;
    SetUser: (user: User | null) => void;
}

export default function Header({
    course,
    FetchData,
    OpenAssignment,
    SetUser,
}: Props) {
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
                    <Menu
                        FetchData={FetchData}
                        course={course}
                        SetUser={SetUser}
                    />
                </Flex>
            ) : null}
        </Flex>
    );
}
