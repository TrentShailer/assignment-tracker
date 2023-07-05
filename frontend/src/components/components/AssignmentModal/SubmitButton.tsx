import { Button, UseToastOptions, useToast } from "@chakra-ui/react";
import { Dayjs } from "dayjs";
import React from "preact";
import { Assignment, Course } from "../../Home";
import axios, { AxiosRequestConfig } from "axios";
import { StateUpdater } from "preact/hooks";

interface Props {
  loading: boolean;
  setLoading: StateUpdater<boolean>;
  name: string;
  outDate: Dayjs;
  dueDate: Dayjs;
  progress: number;
  assignment: Assignment | null;
  course: Course;
  Close: () => void;
  FetchData: () => void;
}

const ErrorMessage: Record<string, UseToastOptions> = {
  "error.null": { title: "Not all fields are valid", status: "warning" },
  "error.server": { title: "Something went wrong", status: "error" },
};

const verifyFields = (
  name: string,
  outDate: Dayjs,
  dueDate: Dayjs,
  progress: number
): boolean => {
  if (name === "" || name.length > 256) return false;
  if (!outDate) return false;
  if (!dueDate) return false;
  if (progress > 100 || progress < 0) return false;

  return true;
};

const trySubmit = async (
  name: string,
  outDate: Dayjs,
  dueDate: Dayjs,
  progress: number,
  assignment: Assignment | null,
  course: Course
): Promise<
  true | "error.fk" | "error.null" | "error.session" | "error.server"
> => {
  const valid = verifyFields(name, outDate, dueDate, progress);
  if (!valid) return "error.null";

  if (!course.id) return "error.null";

  type Result =
    | { ok: true; assignment: Assignment }
    | { ok: false; reason: "error.fk" | "error.null" };

  try {
    let requestConf: AxiosRequestConfig;

    if (assignment) {
      requestConf = {
        method: "put",
        url: `/api/v1/courses/${course.id}/assignments/${assignment.id}`,
        data: {
          name,
          due_date: dueDate.toISOString(),
          out_date: outDate.toISOString(),
          progress,
        },
      };
    } else {
      requestConf = {
        method: "post",
        url: `/api/v1/courses/${course.id}/assignments`,
        data: {
          name,
          due_date: dueDate.toISOString(),
          out_date: outDate.toISOString(),
          progress,
        },
      };
    }

    const { data } = await axios<Result>(requestConf);

    if (data.ok === true) {
      return true;
    }

    return data.reason;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "401") {
        return "error.session";
      }
    }
  }
  return "error.server";
};

export default function SubmitButton({
  loading,
  setLoading,
  name,
  outDate,
  dueDate,
  progress,
  assignment,
  course,
  Close,
  FetchData,
}: Props) {
  const toast = useToast();

  const Submit = async () => {
    setLoading(true);

    const result = await trySubmit(
      name,
      outDate,
      dueDate,
      progress,
      assignment,
      course
    );
    if (result === true) {
      FetchData();
      toast({ title: "Created Assignment", status: "success" });
      Close();
    } else if (result === "error.session" || result === "error.fk") {
      FetchData();
    } else {
      toast(ErrorMessage[result]);
    }

    setLoading(false);
  };
  return (
    <Button isLoading={loading} colorScheme="blue" onClick={Submit}>
      {assignment !== null ? "Edit" : "Create"}
    </Button>
  );
}
