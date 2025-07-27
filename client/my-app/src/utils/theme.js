"use client";

import { experimental_extendTheme as extendTheme } from "@mui/material/styles";

const theme = extendTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdc3c7",
            borderRadius: "6px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#7ed6df",
          },
        },
      },
    },
  },
  colorSchemes: {
    light: {
      palette: {
        // primary: teal,
        // secondary: deepOrange,
      },
    },
    dark: {
      palette: {
        // primary: cyan,
        // secondary: orange,
      },
    },
  },
});

export default theme;
