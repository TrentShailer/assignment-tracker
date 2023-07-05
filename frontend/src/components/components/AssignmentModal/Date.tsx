import { Text, Input, Box } from "@chakra-ui/react";
import dayjs, { Dayjs } from "dayjs";
import React from "preact";
import { ChangeEvent } from "preact/compat";
import { StateUpdater, useEffect, useState } from "preact/hooks";

interface Props {
  label: string;
  date: Dayjs | null;
  setDate: StateUpdater<Dayjs>;
}

export default function Date({ label, date, setDate }: Props) {
  const [isInvalid, setIsInvalid] = useState(date ? false : true);
  const [value, setValue] = useState(
    date ? date.format("YYYY-MM-DDTHH:mm") : ""
  );

  useEffect(() => {
    setValue(date ? date.format("YYYY-MM-DDTHH:mm") : "");
    if (date) setIsInvalid(false);
  }, [date]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = (e.target as HTMLInputElement).value;
    setValue(newValue);

    if (!newValue) {
      setIsInvalid(true);
      setDate(null);
      return;
    }

    try {
      const dayjsVal = dayjs(newValue);
      setIsInvalid(false);
      setDate(dayjsVal);
    } catch (_) {}
  };

  return (
    <Box>
      <Text>{label}</Text>
      <Input
        value={value}
        focusBorderColor={isInvalid ? "red.500" : "blue.500"}
        isInvalid={isInvalid}
        onChange={onChange}
        placeholder={`Enter ${label}`}
        type="datetime-local"
      />
    </Box>
  );
}
