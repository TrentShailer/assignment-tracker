import { type ThemeConfig, extendTheme } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  fonts: {
    body: "Inter, system-ui, sans-serif",
  },
  config,
});

export default theme;
