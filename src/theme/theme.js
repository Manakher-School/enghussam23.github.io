import { createTheme } from "@mui/material/styles";

export const createAppTheme = (direction = "rtl") => {
  return createTheme({
    direction: direction,
    palette: {
      primary: {
        main: "#2196f3ff",
        light: "#64B5F6",
        dark: "#1976D2",
      },
      secondary: {
        main: "#FF9800",
        light: "#FFB74D",
        dark: "#F57C00",
      },
      success: {
        main: "#4CAF50",
        light: "#81C784",
      },
      error: {
        main: "#F44336",
      },
      warning: {
        main: "#FF9800",
      },
      background: {
        default: "#F5F5F5",
        paper: "#FFFFFF",
      },
    },
    typography: {
      fontFamily:
        direction === "rtl"
          ? "Cairo, Roboto, Arial, sans-serif"
          : "Roboto, Cairo, Arial, sans-serif",
      h1: {
        fontSize: "2.5rem",
        fontWeight: 600,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
      },
      body1: {
        fontSize: "1rem",
      },
      body2: {
        fontSize: "0.875rem",
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
};
