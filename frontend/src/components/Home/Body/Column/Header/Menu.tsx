import React from "preact";
import {
  Menu as BaseMenu,
  Box,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import Icon from "../../../../components/Icon";
import { Course } from "../../../Body";
import Edit from "./Menu/Edit";
import Delete from "./Menu/Delete";
import { useState } from "preact/hooks";
import Create from "./Create";

interface Props {
  course: Course;
  FetchData: () => void;
}

export default function Menu({ course, FetchData }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  return (
    <Box>
      <Edit
        FetchData={FetchData}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        course={course}
      />
      <Delete
        FetchData={FetchData}
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        course={course}
      />
      <BaseMenu>
        <MenuButton cursor="pointer" as={Box}>
          <Icon
            color="whiteAlpha.900"
            size={8}
            path="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"
          />
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={() => setEditOpen(true)}
            icon={
              <Icon
                color="whiteAlpha.900"
                size={6}
                path=" M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
              />
            }
          >
            Edit Course
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => setDeleteOpen(true)}
            icon={
              <Icon
                color="red.500"
                size={6}
                path="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M9,8H11V17H9V8M13,8H15V17H13V8Z"
              />
            }
          >
            Delete Course
          </MenuItem>
        </MenuList>
      </BaseMenu>
    </Box>
  );
}
