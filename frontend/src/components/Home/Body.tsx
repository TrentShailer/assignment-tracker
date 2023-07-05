import React from "preact";
import { User } from "../..";
import { Box, Card, Flex, Stack, useToast } from "@chakra-ui/react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "preact/hooks";
import Column from "./Body/Column";
import axios from "axios";
import AssignmentModal from "../components/AssignmentModal";
import { Assignment, Course } from "../Home";

interface Props {
  FetchData: () => void;
  assignments: Assignment[];
  courses: Course[];
}

let interval: number;

export default function Body({ FetchData, assignments, courses }: Props) {
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [openAssignment, setOpenAssignment] = useState<Assignment>(null);
  const [openCourse, setOpenCourse] = useState<Course>(null);

  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([]);

  const GetActiveAssignments = () => {
    setActiveAssignments(
      assignments.filter(
        (assignment) =>
          assignment.out_date.isBefore(dayjs()) &&
          assignment.progress < 100 &&
          assignment.due_date.isAfter(dayjs())
      )
    );
  };

  const FocusIn = () => {
    GetActiveAssignments();

    interval = setInterval(GetActiveAssignments, 1000 * 60 * 10);
  };
  const FocusOut = () => {
    clearInterval(interval);
  };

  useEffect(() => {
    GetActiveAssignments();
    document.addEventListener("focusin", FocusIn);
    document.addEventListener("focusout", FocusOut);

    return () => {
      document.removeEventListener("focusin", FocusIn);
      document.removeEventListener("focusout", FocusOut);
    };
  }, []);

  useEffect(() => {
    GetActiveAssignments();
  }, [assignments]);

  useEffect(() => {
    console.log(activeAssignments);
  }, [activeAssignments]);

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
          />
        ))}
      </Stack>
    </Box>
  );
}
