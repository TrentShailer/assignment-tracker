import React from "preact";
import { Box, Card, Flex, Stack, useToast } from "@chakra-ui/react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "preact/hooks";
import Column from "./Body/Column";
import axios from "axios";
import AssignmentModal from "../components/AssignmentModal";
import { Assignment } from "../../assignment";
import { Course } from "../../../../backend/bindings/Course";
import { User } from "../../../../backend/bindings/User";

interface Props {
    FetchData: () => void;
    SetUser: (user: User | null) => void;
    assignments: Assignment[];
    courses: Course[];
}

export default function Body({
    FetchData,
    assignments,
    courses,
    SetUser,
}: Props) {
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [openAssignment, setOpenAssignment] = useState<Assignment>(null);
    const [openCourse, setOpenCourse] = useState<Course>(null);

    const [activeAssignments, setActiveAssignments] = useState<Assignment[]>(
        []
    );

    const GetActiveAssignments = () => {
        setActiveAssignments([
            ...assignments.filter(
                (assignment) =>
                    assignment.out_date.isBefore(dayjs()) &&
                    assignment.progress < 100 &&
                    assignment.due_date.isAfter(dayjs())
            ),
        ]);
    };

    useEffect(() => {
        GetActiveAssignments();
    }, [assignments]);

    const OpenAssignment = (assignment: Assignment | null, course: Course) => {
        setOpenAssignment(assignment);
        setOpenCourse(course);
        setAssignmentModalOpen(true);
    };

    return (
        <Box>
            <AssignmentModal
                isOpen={assignmentModalOpen}
                onClose={() => {
                    setOpenAssignment(null);
                    setOpenCourse(null);
                    setAssignmentModalOpen(false);
                }}
                FetchData={FetchData}
                assignment={openAssignment}
                course={openCourse}
                SetUser={SetUser}
            />
            <Stack
                direction="row"
                w="100%"
                h="calc(100vh - 140px)"
                pb={4}
                overflowX="auto"
                gap={4}
            >
                <Column
                    OpenAssignment={OpenAssignment}
                    FetchData={FetchData}
                    course={{ id: "", name: "Active" }}
                    assignments={activeAssignments}
                    courses={courses}
                    SetUser={SetUser}
                />
                {courses.map((course) => (
                    <Column
                        key={course.id}
                        OpenAssignment={OpenAssignment}
                        FetchData={FetchData}
                        course={course}
                        assignments={assignments.filter(
                            (assignment) => assignment.course_id === course.id
                        )}
                        SetUser={SetUser}
                    />
                ))}
            </Stack>
        </Box>
    );
}
