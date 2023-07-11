import { Box, IconButton, Tooltip, useToast } from "@chakra-ui/react";
import axios from "axios";
import React from "preact";
import Icon from "../../components/Icon";
import { useState } from "preact/hooks";
import ImportCourseModal from "./ImportCourse/ImportCourseModal";

interface Props {
	FetchData: () => void;
}

export default function ImportCourse({ FetchData }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Box>
			<ImportCourseModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				FetchData={FetchData}
			/>
			<Tooltip label="Import Course">
				<IconButton
					onClick={() => setIsOpen(true)}
					aria-label="Import Course"
					icon={
						<Icon
							color="whiteAlpha.900"
							size={7}
							path="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
						/>
					}
				/>
			</Tooltip>
		</Box>
	);
}
