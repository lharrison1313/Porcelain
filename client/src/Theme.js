import { createTheme } from "@mui/material/styles";
import { color } from "@mui/system";

let colors = {
  primary: "#070d1d",
  secondary: "#2e2e38",
  contrast: "#cb1431",
  terminal: "#14cb32",
  ocean: "#127cc7",
  sun: "#c7be12",
  rose: "#c7129a",
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    contrast: {
      main: colors.contrast,
    },
    terminal: {
      main: colors.terminal,
    },
    ocean: {
      main: colors.ocean,
    },
  },
  typography: {
    h1: {
      color: colors.contrast,
    },
    body1: {
      color: colors.contrast,
    },
    body2: {
      color: colors.ocean,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.primary,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&-MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "red",
          },
          color: colors.contrast,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.ocean,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.ocean,
          },
        },
        notchedOutline: {
          borderColor: colors.contrast,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: colors.contrast,
          "&.Mui-focused": {
            color: colors.contrast,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(20, 203, 50, 0.1)",
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fill: colors.ocean,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: colors.contrast,
        },
      },
    },
  },
});

export { theme, colors };
