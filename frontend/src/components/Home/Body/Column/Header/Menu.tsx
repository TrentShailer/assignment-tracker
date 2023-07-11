import React from "preact";
import {
	Menu as BaseMenu,
	Box,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	useToast,
} from "@chakra-ui/react";
import Icon from "../../../../components/Icon";
import { Course } from "../../../../Home";
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
	const toast = useToast();
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
						onClick={() => {
							navigator.clipboard
								.writeText(course.id)
								.then(() => {
									toast({ title: "Copied Course Code", status: "success" });
								})
								.catch(() => {
									toast({ title: "Failed to Copy Course Code", status: "error" });
								});
						}}
						icon={
							<Icon
								color="whiteAlpha.900"
								size={6}
								path="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"
							/>
						}>
						Copy Course Code
					</MenuItem>
					<MenuItem
						onClick={() => setEditOpen(true)}
						icon={
							<Icon
								color="whiteAlpha.900"
								size={6}
								path="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
							/>
						}>
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
						}>
						Delete Course
					</MenuItem>
				</MenuList>
			</BaseMenu>
		</Box>
	);
}
