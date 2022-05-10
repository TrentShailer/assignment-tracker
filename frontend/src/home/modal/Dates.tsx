import React, { useEffect, useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import TextField from "@mui/material/TextField";
import isPast from "date-fns/isPast";
import formatDistance from "date-fns/formatDistance";
import format from "date-fns/format";

interface IProps {
	outDate: Date | null;
	dueDate: Date | null;
	SaveChanges: Function;
}

export default function Dates(props: IProps) {
	const [outText, setOutText] = useState("");
	const [dueText, setDueText] = useState("");
	const [outDate, setOutDate] = useState(props.outDate);
	const [dueDate, setDueDate] = useState(props.dueDate);

	useEffect(() => {
		let now = new Date();
		if (!outDate || !dueDate) {
			return;
		}
		if (isPast(outDate)) {
			setOutText(
				`Out ${formatDistance(outDate, now, { addSuffix: true })} (${format(
					outDate,
					"EEEE"
				)})`
			);
			setDueText(
				`Due ${formatDistance(dueDate, now, { addSuffix: true })} (${format(
					dueDate,
					"EEEE"
				)})`
			);
		} else {
			setOutText(
				`Out ${formatDistance(outDate, now, { addSuffix: true })} (${format(
					outDate,
					"EEEE"
				)})`
			);
			setDueText(
				`Due ${formatDistance(dueDate, outDate)} later  (${format(dueDate, "EEEE")})`
			);
		}
	}, [outDate, dueDate]);

	const SaveChange = () => {
		props.SaveChanges({ dueDate: dueDate, outDate: outDate });
	};

	return (
		<div>
			<div
				style={{
					width: "calc(100% - 20px)",
					marginTop: 20,
					marginLeft: 10,
					marginRight: 10,
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
				}}>
				<div style={{ fontWeight: 500, fontSize: 18 }}>{outText}</div>
				<div style={{ fontWeight: 500, fontSize: 18 }}>{dueText}</div>
			</div>

			<div
				style={{
					width: "calc(100% - 20px)",
					marginTop: 40,
					marginLeft: 10,
					marginRight: 10,
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
				}}>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<div>
						<DateTimePicker
							renderInput={(props) => <TextField {...props} />}
							label="Out Date"
							value={outDate}
							onAccept={SaveChange}
							onChange={(date) => {
								setOutDate(date);
							}}
						/>
					</div>
					<div>
						<DateTimePicker
							renderInput={(props) => <TextField {...props} />}
							label="Due Date"
							value={dueDate}
							onAccept={SaveChange}
							onChange={(date) => {
								setDueDate(date);
							}}
						/>
					</div>
				</LocalizationProvider>
			</div>
		</div>
	);
}
