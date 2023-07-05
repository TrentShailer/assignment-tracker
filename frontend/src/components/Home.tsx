import React from "preact";
import { User } from "..";
import { Box, Container, useToast } from "@chakra-ui/react";
import Footer from "./Footer";
import Header from "./Home/Header";
import Body from "./Home/Body";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  SetUser: (user: User | null) => void;
  user: User;
}

export type Assignment = {
  id: string;
  course_id: string;
  name: string;
  out_date: Dayjs;
  due_date: Dayjs;
  progress: number;
};

type AssignmentReceived = {
  id: string;
  course_id: string;
  name: string;
  out_date: string;
  due_date: string;
  progress: number;
};

export type Course = {
  id: string;
  name: string;
};

const GetCourses = async (): Promise<
  Course[] | "error.session" | "error.server"
> => {
  try {
    type Result = { ok: true; courses: Course[] };
    const { data } = await axios.get<Result>("/api/v1/courses");
    return data.courses;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "401") {
        return "error.session";
      }
    }
  }
  return "error.server";
};

const GetAssignments = async (): Promise<
  Assignment[] | "error.session" | "error.server"
> => {
  try {
    type Result = { ok: true; assignments: AssignmentReceived[] };
    const { data } = await axios.get<Result>("/api/v1/assignments");
    return parseAssignments(data.assignments);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "401") {
        return "error.session";
      }
    }
  }
  return "error.server";
};

const parseAssignments = (assignments: AssignmentReceived[]): Assignment[] => {
  return assignments
    .map((assignment) => {
      const out_date = dayjs(assignment.out_date);
      const due_date = dayjs(assignment.due_date);
      return { ...assignment, out_date, due_date };
    })
    .sort(compareAssignments);
};

const compareByOutDate = (a: Assignment, b: Assignment): number => {
  const aDiff = Math.abs(a.out_date.diff(dayjs()));
  const bDiff = Math.abs(b.out_date.diff(dayjs()));
  return aDiff < bDiff ? -1 : 1;
};

const compareByDueDate = (a: Assignment, b: Assignment): number => {
  const aDiff = Math.abs(a.due_date.diff(dayjs()));
  const bDiff = Math.abs(b.due_date.diff(dayjs()));
  return aDiff < bDiff ? -1 : 1;
};

const compareAssignments = (a: Assignment, b: Assignment): number => {
  const aOut = a.out_date.isBefore(dayjs());
  const bOut = b.out_date.isBefore(dayjs());
  const aFinished = a.due_date.isBefore(dayjs()) || a.progress === 100;
  const bFinished = b.due_date.isBefore(dayjs()) || b.progress === 100;

  // If only one is finished, sort it last
  if (aFinished && !bFinished) return 1;
  if (!aFinished && bFinished) return -1;

  if (aFinished && bFinished) return compareByOutDate(a, b);

  // If only one is out, sort it first
  if (aOut && !bOut) return -1;
  if (!aOut && bOut) return 1;

  // If a is out and b is out, sort the due soonest first
  if (aOut && bOut) return compareByDueDate(a, b);

  // If a is not out and b is not out, sort the out soonest first
  return compareByOutDate(a, b);
};

let interval: number;

export default function Home({ user, SetUser }: Props) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const toast = useToast();

  const assignmentRef = useRef(assignments);

  const UpdateAssignments = () => {
    setAssignments(assignmentRef.current.sort(compareAssignments));
  };

  const Focus = () => {
    UpdateAssignments();

    interval = setInterval(UpdateAssignments, 1000 * 60 * 10);
  };
  const Blur = () => {
    clearInterval(interval);
  };

  const FetchData = async () => {
    setLoading(true);

    const courses = await GetCourses();
    const assignments = await GetAssignments();

    if (courses === "error.session" || assignments === "error.session") {
      toast({ title: "Your session has expired", status: "warning" });
      SetUser(null);
      return;
    } else if (courses === "error.server" || assignments === "error.server") {
      toast({ title: "Something went wrong", status: "error" });
      return;
    }

    setCourses(courses);
    setAssignments(assignments);
    assignmentRef.current = assignments;
    UpdateAssignments();
  };

  useEffect(() => {
    FetchData();

    document.addEventListener("focus", Focus);
    document.addEventListener("blur", Blur);

    return () => {
      document.removeEventListener("focus", Focus);
      document.removeEventListener("blur", Blur);
    };
  }, []);

  return (
    <Box>
      <Header FetchData={FetchData} user={user} SetUser={SetUser} />
      <Container maxW="container.xs">
        <Box pt={4} minH="calc(100vh - 120px)">
          <Body
            FetchData={FetchData}
            assignments={assignments}
            courses={courses}
          />
        </Box>
        <Footer />
      </Container>
    </Box>
  );
}
