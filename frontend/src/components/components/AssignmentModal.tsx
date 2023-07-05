import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "preact/hooks";
import { Course, Assignment } from "../Home";
import { Dayjs } from "dayjs";
import Name from "./AssignmentModal/Name";
import CourseDisplay from "./AssignmentModal/CourseDisplay";
import ProgressBar from "./AssignmentModal/ProgressBar";
import Date from "./AssignmentModal/Date";
import DeleteButton from "./AssignmentModal/DeleteButton";
import SubmitButton from "./AssignmentModal/SubmitButton";

interface Props {
  course: Course;
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  FetchData: () => void;
}

export default function AssignmentModal({
  course,
  FetchData,
  assignment,
  isOpen,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [outDate, setOutDate] = useState<Dayjs>(null);
  const [dueDate, setDueDate] = useState<Dayjs>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (assignment !== null) {
      setName(assignment.name);
      setDueDate(assignment.due_date);
      setOutDate(assignment.out_date);
      setProgress(assignment.progress);
    }
  }, [assignment]);

  const Cancel = () => {
    onClose();
    setLoading(false);
    setName("");
    setOutDate(null);
    setDueDate(null);
    setProgress(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={Cancel}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {assignment !== null ? "Edit" : "Create"} Assignment
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody>
          <Stack gap={4}>
            <Name name={name} setName={setName} />
            <CourseDisplay course={course} />

            <Date label="Out Date" date={outDate} setDate={setOutDate} />
            <Date label="Due Date" date={dueDate} setDate={setDueDate} />

            <ProgressBar progress={progress} setProgress={setProgress} />
          </Stack>
        </ModalBody>

        <ModalFooter>
          {assignment !== null ? (
            <DeleteButton
              Close={Cancel}
              FetchData={FetchData}
              assignment={assignment}
              course={course}
              setLoading={setLoading}
              loading={loading}
            />
          ) : null}
          <Button isDisabled={loading} mr={3} onClick={Cancel}>
            Cancel
          </Button>
          <SubmitButton
            Close={Cancel}
            FetchData={FetchData}
            assignment={assignment}
            course={course}
            setLoading={setLoading}
            loading={loading}
            name={name}
            outDate={outDate}
            dueDate={dueDate}
            progress={progress}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
