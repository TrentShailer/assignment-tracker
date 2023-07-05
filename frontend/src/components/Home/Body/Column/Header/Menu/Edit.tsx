import React from "preact";
import { Course } from "../../../../../Home";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Text,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";
import axios from "axios";

interface Props {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  FetchData: () => void;
}

const ErrorMessage: Record<string, UseToastOptions> = {
  "error.null": { title: "Invalid Course Name", status: "warning" },
  "error.server": { title: "Something went wrong", status: "error" },
  "error.session": { title: "Your session has expired", status: "error" },
  "error.not_found": {
    title: "This course no longer exists",
    status: "warning",
  },
};

const trySubmit = async (
  course: Course,
  name: string
): Promise<
  true | "error.null" | "error.not_found" | "error.server" | "error.session"
> => {
  if (name === "") return "error.null";

  try {
    type Data =
      | { ok: true; course: Course }
      | { ok: false; reason: "error.null" | "error.not_found" };
    const { data } = await axios.put<Data>(`/api/v1/courses/${course.id}`, {
      name,
    });

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
    return "error.server";
  }
};

export default function Edit({ course, isOpen, onClose, FetchData }: Props) {
  const [name, setName] = useState(course.name);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    if (value.length > 256) return;
    setName(value);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "return") {
      e.preventDefault();
      Submit();
    }
  };

  const Cancel = () => {
    setName(course.name);
    onClose();
  };

  const Submit = async () => {
    setLoading(true);
    const result = await trySubmit(course, name);

    if (result === true) {
      toast({ title: "Changed Name", status: "success" });
      FetchData();
      onClose();
    } else if (result === "error.session") {
      FetchData();
    } else {
      toast(ErrorMessage[result]);
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={Cancel}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Course</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <Text>Course Name</Text>
          <Input
            isDisabled={loading}
            value={name}
            onKeyDown={onKeyDown}
            onChange={onChange}
            autofocus
            placeholder="Enter course name"
          />
        </ModalBody>

        <ModalFooter>
          <Button isDisabled={loading} mr={3} onClick={Cancel}>
            Cancel
          </Button>
          <Button isLoading={loading} colorScheme="blue" onClick={Submit}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
