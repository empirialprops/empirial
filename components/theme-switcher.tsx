"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <MoonIcon className="size-4 opacity-0" />
      </Button>
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const handleClick = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

export default ThemeSwitcher;
