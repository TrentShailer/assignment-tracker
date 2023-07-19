import { Button, UseToastOptions, useToast } from "@chakra-ui/react";
import React from "preact";
import { Assignment, Course } from "../../Home";
import axios from "axios";
import { StateUpdater } from "preact/hooks";

interface Props {
  loading: boolean;
  setLoading: StateUpdater<boolean>;
  assignment: Assignment;
  course: Course;
  FetchData: () => void;
  Close: () => void;
}

const ErrorMessage: Record<string, UseToastOptions> = {
  "error.server": { title: "Something went wrong", status: "error" },
};

const tryDelete = async (
  assignment: Assignment,
  course: Course
): Promise<true | "error.session" | "error.not_found" | "error.server"> => {
  try {
    type Result = { ok: true } | { ok: false; reason: "error.not_found" };
    const { data } = await axios.delete<Result>(
      `/api/v1/courses/${course.id}/assignments/${assignment.id}`
    );
    if (data.ok === true) {
      return true;
    }
    return data.reason;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response.status === 401) {
        return "error.session";
      }
    }
  }
  return "error.server";
};

export default function DeleteButton({
  loading,
  setLoading,
  assignment,
  course,
  FetchData,
  Close,
}: Props) {
  const toast = useToast();
  const Delete = async () => {
    setLoading(true);
    const result = await tryDelete(assignment, course);
    if (result === true) {
      FetchData();
      toast({ title: "Deleted Assignment", status: "success" });
      Close();
    } else if (result === "error.session" || result === "error.not_found") {
      FetchData();
    } else {
      toast(ErrorMessage[result]);
    }

    setLoading(false);
  };
  return (
    <Button isDisabled={loading} mr={"auto"} onClick={Delete} colorScheme="red">
      Delete
    </Button>
  );
}
