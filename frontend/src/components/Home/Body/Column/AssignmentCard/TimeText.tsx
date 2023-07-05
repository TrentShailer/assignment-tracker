import dayjs, { Dayjs } from "dayjs";
import React from "preact";
import { Assignment } from "../../../../Home";
import { useEffect, useState } from "preact/hooks";
import { Text } from "@chakra-ui/react";

interface Props {
  assignment: Assignment;
}

const CalculateTimeString = (date: Dayjs): string => {
  const diff = date.diff(dayjs());

  if (diff < 1000 * 60 * 60) {
    return "less than one hour";
  } else if (diff < 1000 * 60 * 60 * 24) {
    const hours = Math.round(diff / 1000 / 60 / 60);
    return hours + " hour" + (hours === 1 ? "" : "s");
  }
  const days = Math.round(diff / 1000 / 60 / 60 / 24);
  return days + " day" + (days === 1 ? "" : "s");
};

export default function TimeText({ assignment }: Props) {
  const [timeText, setTimeText] = useState("");

  const SetTimeText = () => {
    const out = assignment.out_date.isBefore(dayjs());
    const completed = assignment.due_date.isBefore(dayjs());

    if (completed) setTimeText("");
    else if (out)
      setTimeText(`Due in ${CalculateTimeString(assignment.due_date)}`);
    else setTimeText(`Out in ${CalculateTimeString(assignment.out_date)}`);
  };

  useEffect(() => {
    SetTimeText();
  }, [assignment.out_date, assignment.due_date]);

  useEffect(() => {
    SetTimeText();
    setInterval(SetTimeText, 1000 * 60);
  }, []);

  return <Text>{timeText}</Text>;
}
