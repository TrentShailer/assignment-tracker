import { render } from "preact";
import {
    Box,
    ChakraProvider,
    CreateToastFnReturn,
    useToast,
} from "@chakra-ui/react";
import theme from "./theme.js";
import { useEffect, useState } from "preact/hooks";
import Loading from "./components/Loading.js";
import Home from "./components/Home.js";
import Auth from "./components/Auth.js";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { User } from "../../backend/bindings/User";
import { is_error_response } from "./error.js";
import { ErrorResponse } from "../../backend/bindings/ErrorResponse.js";

dayjs.extend(advancedFormat);
axios.defaults.baseURL = import.meta.env.DEV
    ? "http://localhost:8080"
    : undefined;
axios.defaults.withCredentials = import.meta.env.DEV ? true : false;

const transitionDuration = 250;

const FetchSession = async (
    toast: CreateToastFnReturn
): Promise<User | null> => {
    try {
        const { data } = await axios.get<User>("/api/user");
        return data;
    } catch (e: any) {
        if (axios.isAxiosError<ErrorResponse>(e) && e.response !== undefined) {
            const error = e.response.data;
            if (error.status === 401) {
                return null;
            }
            if (error.status === 410) {
                toast({
                    title: "Failed to get session",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
                return null;
            }
            if (error.status === 500) {
                toast({
                    title: "Internal server error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
                console.error(error);
                return null;
            }
        }

        toast({
            title: "An unexpected error ocurred",
            description: e,
            status: "error",
            duration: 5000,
        });
        console.error(e);
        return null;
    }
};

export function App() {
    const [loading, setLoading] = useState(true);
    const [opacity, setOpacity] = useState(1);

    const [user, setUser] = useState<User | null>(null);

    const toast = useToast();

    useEffect(() => {
        FetchSession(toast).then((user) => {
            setUser(user);
            // Fade out
            setOpacity(0);
            // Switch view and fade in
            setTimeout(() => {
                setLoading(false);
                setOpacity(1);
            }, transitionDuration);
        });
    }, []);

    const SetUser = (user: User | null) => {
        setOpacity(0);
        setTimeout(() => {
            setUser(user);
            setOpacity(1);
        }, transitionDuration);
    };

    return (
        <ChakraProvider theme={theme}>
            <Box
                opacity={opacity}
                transition={`opacity ${transitionDuration}ms`}
            >
                {loading ? (
                    <Loading />
                ) : user ? (
                    <Home user={user} SetUser={SetUser} />
                ) : (
                    <Auth SetUser={SetUser} />
                )}
            </Box>
        </ChakraProvider>
    );
}

render(<App />, document.getElementById("app"));
