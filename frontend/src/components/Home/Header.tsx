import { Flex, Heading, Stack } from "@chakra-ui/react";
import React from "preact";
import { useEffect, useState } from "preact/hooks";
import dayjs, { Dayjs } from "dayjs";
import CreateCourse from "./Header/CreateCourse";
import Reload from "./Header/Reload";
import ImportCourse from "./Header/ImportCourse";
import AccountButton from "./Header/AccountButton";
import { User } from "../../../../backend/bindings/User";

interface Props {
    user: User;
    SetUser: (user: User | null) => void;
    FetchData: () => {};
}

const NowString = (): string => {
    return dayjs().format("h:mm a [on] dddd [the] Do [of] MMMM");
};

export default function Header({ user, SetUser, FetchData }: Props) {
    const [now, setNow] = useState(NowString());

    useEffect(() => {
        let interval = setInterval(() => {
            setNow(NowString());
        }, 1000 * 60);

        return () => {
            clearInterval(interval);
        };
    }, []);
    return (
        <Flex
            background="whiteAlpha.100"
            h="60px"
            alignItems="center"
            justifyContent="space-between"
            gap={4}
            p={4}
        >
            <Heading size="md" mt={-1} lineHeight="normal" noOfLines={1}>
                {now}
            </Heading>
            <Stack direction="row" gap={4}>
                <CreateCourse SetUser={SetUser} FetchData={FetchData} />
                <ImportCourse SetUser={SetUser} FetchData={FetchData} />
                <Reload FetchData={FetchData} />
                <AccountButton SetUser={SetUser} />
            </Stack>
        </Flex>
    );
}
