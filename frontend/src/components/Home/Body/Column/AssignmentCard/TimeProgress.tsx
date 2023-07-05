import React from "preact";
import { Assignment } from "../../../../Home";
import { useEffect, useState } from "preact/hooks";
import dayjs, { Dayjs } from "dayjs";
import { Progress } from "@chakra-ui/react";

interface Props {
  assignment: Assignment;
}

const CalculateProgress = (outDate: Dayjs, dueDate: Dayjs): number => {
  if (dueDate.isBefore(dayjs())) return 100;
  if (outDate.isAfter(dayjs())) return 0;

  const totalDiff = dueDate.diff(outDate);
  const dueDateDiff = dueDate.diff(dayjs());

  return 100 - (dueDateDiff / totalDiff) * 100;
};

export default function TimeProgress({ assignment }: Props) {
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("green");

  const SetProgress = () => {
    const progress = CalculateProgress(
      assignment.out_date,
      assignment.due_date
    );
    setProgress(progress);

    if (progress === 100) setColor("green");
    else if (progress > 75) setColor("red");
    else if (progress > 50) setColor("orange");
    else if (progress > 25) setColor("yellow");
    else setColor("green");
  };

  useEffect(() => {
    SetProgress();
  }, [assignment.out_date, assignment.due_date]);

  useEffect(() => {
    SetProgress();
    setInterval(SetProgress, 1000 * 60);
  }, []);

  return <Progress colorScheme={color} hasStripe value={progress} />;
}
