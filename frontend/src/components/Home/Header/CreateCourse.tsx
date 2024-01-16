import { Box, Button, Tooltip } from "@chakra-ui/react";
import React from "preact";
import { useState } from "preact/hooks";
import CreateCourseModal from "./CreateCourse/CreateCourseModal";
import { User } from "../../../../../backend/bindings/User";

interface Props {
    FetchData: () => void;
    SetUser: (user: User | null) => void;
}

export default function CreateCourse({ FetchData, SetUser }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Box>
            <CreateCourseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                FetchData={FetchData}
                SetUser={SetUser}
            />
            <Tooltip label="Create Course">
                <Button onClick={() => setIsOpen(true)}>Create Course</Button>
            </Tooltip>
        </Box>
    );
}
