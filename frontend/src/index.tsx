import { render } from "preact";
import { Box, ChakraProvider, useToast } from "@chakra-ui/react";
import theme from "./theme.js";
import { useEffect, useState } from "preact/hooks";
import Loading from "./components/Loading.js";
import Home from "./components/Home.js";
import Auth from "./components/Auth.js";
import axios from "axios";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

export type User = {
  id: string;
  username: string;
};

const transitionDuration = 250;

const FetchSession = async (): Promise<User | null> => {
  try {
    type GetUser = { ok: true; user: User };
    const { data } = await axios.get<GetUser>("/api/v1/user");
    console.log(data);
    if (data.ok === true) {
      return data.user;
    }
  } catch (error) {
    console.error(error.response.status);
    if (axios.isAxiosError(error)) {
      if (error.response.status === 401) {
        return null;
      }
    }
  }
  return null;
};

export function App() {
  const [loading, setLoading] = useState(true);
  const [opacity, setOpacity] = useState(1);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    dayjs.extend(advancedFormat);
    FetchSession().then((user) => {
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
      <Box opacity={opacity} transition={`opacity ${transitionDuration}ms`}>
        {loading ? (
          <Loading />
        ) : user ? (
          <Home user={user} SetUser={SetUser} />
        ) : (
          // <Auth SetUser={SetUser} />
          <Home user={user} SetUser={SetUser} />
        )}
      </Box>
    </ChakraProvider>
  );
}

render(<App />, document.getElementById("app"));
