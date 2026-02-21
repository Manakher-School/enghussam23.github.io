import { createTheme } from "@mui/material/styles";

// Subject-specific color palette for educational content
export const subjectColors = {
  رياضيات: { main: "#2196F3", light: "#64B5F6", emoji: "🔢" },
  Mathematics: { main: "#2196F3", light: "#64B5F6", emoji: "🔢" },
  علوم: { main: "#4CAF50", light: "#81C784", emoji: "🔬" },
  Science: { main: "#4CAF50", light: "#81C784", emoji: "🔬" },
  "لغة عربية": { main: "#FF9800", light: "#FFB74D", emoji: "📖" },
  "Arabic Language": { main: "#FF9800", light: "#FFB74D", emoji: "📖" },
  "لغة إنجليزية": { main: "#9C27B0", light: "#BA68C8", emoji: "🇬🇧" },
  "English Language": { main: "#9C27B0", light: "#BA68C8", emoji: "🇬🇧" },
  فنون: { main: "#E91E63", light: "#F06292", emoji: "🎨" },
  Arts: { main: "#E91E63", light: "#F06292", emoji: "🎨" },
  تاريخ: { main: "#795548", light: "#A1887F", emoji: "📚" },
  History: { main: "#795548", light: "#A1887F", emoji: "📚" },
  "تربية إسلامية": { main: "#009688", light: "#4DB6AC", emoji: "🕌" },
  "Islamic Education": { main: "#009688", light: "#4DB6AC", emoji: "🕌" },
};

export const getSubjectColor = (subject) => {
  return (
    subjectColors[subject] || { main: "#4CAF50", light: "#81C784", emoji: "📝" }
  );
};

// Grade-specific badges with plant progression theme
export const gradeBadges = {
  KG: { emoji: "🌱", name: { ar: "بذرة", en: "Seedling" }, color: "#81C784" },
  "Grade 1": {
    emoji: "🌿",
    name: { ar: "نبتة", en: "Sprout" },
    color: "#66BB6A",
  },
  "Grade 2": {
    emoji: "🪴",
    name: { ar: "شتلة", en: "Plant" },
    color: "#4CAF50",
  },
  "Grade 3": {
    emoji: "🌾",
    name: { ar: "سنبلة", en: "Grain" },
    color: "#8BC34A",
  },
  "Grade 4": {
    emoji: "🌻",
    name: { ar: "زهرة", en: "Flower" },
    color: "#CDDC39",
  },
  "Grade 5": {
    emoji: "🌲",
    name: { ar: "شجرة", en: "Tree" },
    color: "#689F38",
  },
  "Grade 6": {
    emoji: "🌳",
    name: { ar: "شجرة كبيرة", en: "Big Tree" },
    color: "#558B2F",
  },
};

export const getGradeBadge = (grade) => {
  return (
    gradeBadges[grade] || {
      emoji: "🌱",
      name: { ar: "بذرة", en: "Seedling" },
      color: "#81C784",
    }
  );
};

export const createAppTheme = (direction = "rtl") => {
  return createTheme({
    direction: direction,
    palette: {
      primary: {
        main: "#4CAF50", // Fresh Garden Green
        light: "#81C784",
        dark: "#388E3C",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#FFB300", // Sunshine Yellow
        light: "#FFD54F",
        dark: "#FFA000",
        contrastText: "#2E7D32",
      },
      success: {
        main: "#66BB6A",
        light: "#81C784",
        dark: "#388E3C",
      },
      info: {
        main: "#64B5F6", // Sky Blue
        light: "#90CAF9",
        dark: "#42A5F5",
      },
      error: {
        main: "#EF5350",
        light: "#E57373",
      },
      warning: {
        main: "#FFA726",
        light: "#FFB74D",
      },
      background: {
        default: "#F1F8E9", // Light Leaf Green
        paper: "#FFFFFF",
      },
      text: {
        primary: "#2E7D32", // Forest Green
        secondary: "#558B2F",
      },
    },
    typography: {
      fontFamily:
        direction === "rtl"
          ? "'Cairo', 'Nunito', sans-serif"
          : "'Nunito', 'Cairo', sans-serif",
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 700,
        letterSpacing: "-0.01em",
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
        fontWeight: 400,
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
      },
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 16, // More rounded for organic feel
    },
    spacing: 8,
    shadows: [
      "none",
      "0px 2px 8px rgba(46, 125, 50, 0.08)",
      "0px 4px 12px rgba(46, 125, 50, 0.12)",
      "0px 6px 16px rgba(46, 125, 50, 0.14)",
      "0px 8px 20px rgba(46, 125, 50, 0.16)",
      "0px 10px 24px rgba(46, 125, 50, 0.18)",
      "0px 12px 28px rgba(46, 125, 50, 0.20)",
      "0px 14px 32px rgba(46, 125, 50, 0.22)",
      "0px 16px 36px rgba(46, 125, 50, 0.24)",
      "0px 18px 40px rgba(46, 125, 50, 0.26)",
      "0px 20px 44px rgba(46, 125, 50, 0.28)",
      "0px 22px 48px rgba(46, 125, 50, 0.30)",
      "0px 24px 52px rgba(46, 125, 50, 0.32)",
      "0px 26px 56px rgba(46, 125, 50, 0.34)",
      "0px 28px 60px rgba(46, 125, 50, 0.36)",
      "0px 30px 64px rgba(46, 125, 50, 0.38)",
      "0px 32px 68px rgba(46, 125, 50, 0.40)",
      "0px 34px 72px rgba(46, 125, 50, 0.42)",
      "0px 36px 76px rgba(46, 125, 50, 0.44)",
      "0px 38px 80px rgba(46, 125, 50, 0.46)",
      "0px 40px 84px rgba(46, 125, 50, 0.48)",
      "0px 42px 88px rgba(46, 125, 50, 0.50)",
      "0px 44px 92px rgba(46, 125, 50, 0.52)",
      "0px 46px 96px rgba(46, 125, 50, 0.54)",
      "0px 48px 100px rgba(46, 125, 50, 0.56)",
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 20,
            padding: "10px 24px",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0px 2px 8px rgba(76, 175, 80, 0.2)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0px 4px 12px rgba(76, 175, 80, 0.3)",
            },
          },
          contained: {
            background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: "0px 4px 12px rgba(46, 125, 50, 0.1)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            border: "1px solid rgba(76, 175, 80, 0.1)",
            // Removed cursor: "pointer" - only specific clickable cards should have this
            // Removed hover transform - cards shouldn't move unless they're interactive
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#F9FBE7",
              },
              "&.Mui-focused": {
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 0px 0px 3px rgba(76, 175, 80, 0.1)",
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 600,
            fontSize: "0.875rem",
          },
          filled: {
            background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
            color: "#FFFFFF",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              "linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)",
            boxShadow: "0px 4px 16px rgba(46, 125, 50, 0.15)",
            borderRadius: 0,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            minHeight: 56,
            color: "#2E7D32", // Default text color (forest green)
            "&.Mui-selected": {
              color: "#4CAF50", // Selected tab color (primary green, not white!)
              fontWeight: 700,
            },
            "&:hover": {
              color: "#388E3C", // Hover color
              backgroundColor: "rgba(76, 175, 80, 0.08)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
          elevation1: {
            boxShadow: "0px 2px 8px rgba(46, 125, 50, 0.08)",
          },
          elevation2: {
            boxShadow: "0px 4px 12px rgba(46, 125, 50, 0.12)",
          },
        },
      },
    },
  });
};
