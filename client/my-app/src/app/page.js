import Home from "./(pages)/Home";
import CssBaseline from "@mui/material/CssBaseline";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import theme from "@/utils/theme";

export default function HomePage() {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <Home />
    </CssVarsProvider>
  );
}
