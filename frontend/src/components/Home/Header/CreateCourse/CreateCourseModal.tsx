import {
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Input,
  ModalFooter,
  Button,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import axios from "axios";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { Course } from "../../../Home";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  FetchData: () => void;
}

const ErrorMessage: Record<string, UseToastOptions> = {
  "error.null": { title: "Invalid Course Name", status: "warning" },
  "error.fk": { title: "Invalid Course Name", status: "warning" },
  "error.server": { title: "Something went wrong", status: "error" },
  "error.session": { title: "Your session has expired", status: "error" },
  "error.not_found": {
    title: "This course no longer exists",
    status: "warning",
  },
};

const trySubmit = async (
  name: string
): Promise<
  true | "error.null" | "error.server" | "error.session" | "error.fk"
> => {
  if (name === "") return "error.null";

  try {
    type Data =
      | { ok: true; course: Course }
      | { ok: false; reason: "error.null" | "error.fk" };
    const { data } = await axios.post<Data>(`/api/v1/courses`, {
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

export default function CreateCourseModal({
  isOpen,
  onClose,
  FetchData,
}: Props) {
  const [name, setName] = useState("");
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
  const Submit = async () => {
    setLoading(true);
    const result = await trySubmit(name);

    if (result === true) {
      toast({ title: "Created Course", status: "success" });
      FetchData();
      onClose();
    } else if (result === "error.session" || result === "error.fk") {
      FetchData();
    } else {
      toast(ErrorMessage[result]);
    }

    setLoading(false);
  };

  const Exit = () => {
    setName("");
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={Exit}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Course</ModalHeader>
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
          <Button isDisabled={loading} mr={3} onClick={Exit}>
            Cancel
          </Button>
          <Button isLoading={loading} colorScheme="blue" onClick={Submit}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
