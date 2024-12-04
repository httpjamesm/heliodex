export const themes = ["System", "Light", "Dark"] as const;
export type Theme = (typeof themes)[number];

export const setTheme = (theme: Theme) => {
  localStorage.setItem("theme", theme);
  const html = document.documentElement;

  if (theme === "Light") {
    html.setAttribute("data-theme", "light");
  } else if (theme === "Dark") {
    html.setAttribute("data-theme", "dark");
  } else {
    html.setAttribute("data-theme", "system");
  }
};
