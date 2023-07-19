import {
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  useToast,
  UseToastOptions,
  ModalOverlay,
  Input,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  FetchData: () => void;
}

const ErrorMessage: Record<string, UseToastOptions> = {
  "error.null": { title: "Invalid Course Code", status: "warning" },
  "error.fk": { title: "Invalid Course Code", status: "warning" },
  "error.server": { title: "Something went wrong", status: "error" },
  "error.session": { title: "Your session has expired", status: "error" },
  "error.not_found": {
    title: "This course doesn't exist",
    status: "warning",
  },
};

const trySubmit = async (
  code: string
): Promise<
  | true
  | "error.not_found"
  | "error.server"
  | "error.fk"
  | "error.null"
  | "error.session"
> => {
  try {
    type Result =
      | {
          ok: true;
        }
      | {
          ok: false;
          reason:
            | "error.not_found"
            | "error.server"
            | "error.null"
            | "error.fk";
        };

    const { data } = await axios.post<Result>("/api/v1/courses/import", {
      course_id: code,
    });
    if (data.ok === true) return true;
    return data.reason;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response.status === 401) {
        return "error.session";
      }
    }
    return "error.server";
  }
};

export default function ImportCourseModal({
  isOpen,
  onClose,
  FetchData,
}: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const Submit = async () => {
    setLoading(true);
    const result = await trySubmit(code);

    if (result === true) {
      toast({ title: "Imported Course", status: "success" });
      FetchData();
      Exit();
    } else if (result === "error.session" || result === "error.fk") {
      FetchData();
    } else {
      toast(ErrorMessage[result]);
    }

    setLoading(false);
  };

  const Exit = () => {
    setCode("");
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      Submit();
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    if (value.length > 36) return;
    setCode(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={Exit}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import Course</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <Text>Course Code</Text>
          <Input
            isDisabled={loading}
            value={code}
            onKeyDown={onKeyDown}
            onChange={onChange}
            autofocus
            placeholder="Enter course code"
          />
        </ModalBody>

        <ModalFooter>
          <Button isDisabled={loading} mr={3} onClick={Exit}>
            Cancel
          </Button>
          <Button isLoading={loading} colorScheme="blue" onClick={Submit}>
            Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
