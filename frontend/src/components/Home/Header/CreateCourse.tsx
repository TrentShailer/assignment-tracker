import { Box, Button, Tooltip } from "@chakra-ui/react";
import React from "preact";
import { useState } from "preact/hooks";
import CreateCourseModal from "./CreateCourse/CreateCourseModal";

interface Props {
  FetchData: () => void;
}

export default function CreateCourse({ FetchData }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Box>
      <CreateCourseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        FetchData={FetchData}
      />
      <Tooltip label="Create Course">
        <Button onClick={() => setIsOpen(true)}>Create Course</Button>
      </Tooltip>
    </Box>
  );
}
