import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast,
} from "@chakra-ui/react";
import React from "preact";
import { useRef, useState } from "preact/hooks";
import { Course } from "../../../../Body";
import axios from "axios";

interface Props {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  FetchData: () => void;
}

export default function Delete({ course, isOpen, onClose, FetchData }: Props) {
  const cancelRef = useRef();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const tryDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/v1/course/${course.id}`);
      toast({ title: "Delete Successful", status: "success" });
      FetchData();
    } catch (error) {
      toast({ title: "Delete Failed", status: "error" });
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Course '{course.name}'
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button isDisabled={loading} ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={loading}
              colorScheme="red"
              onClick={tryDelete}
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
