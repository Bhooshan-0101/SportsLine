import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    surface: Palette['primary'];
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    surface?: PaletteOptions['primary'];
  }
}

// Extend the Button props to include accent color
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

// Extend the Chip props to include accent color
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    accent: true;
  }
}
