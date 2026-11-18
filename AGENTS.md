# Project Rules & Design Guidelines

## 1. Typography & Git Repo Formatting
- **Follow Git Repo Typography**: Always follow the exact heading fonts, subheadings, font weights, and text styling of the git repo template.
  - Section Headings: Use `text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text` (or `font-medium tracking-tighter` for hero). Do NOT make section headings extra bold or all-caps unless explicitly requested.
  - Subheadings & Descriptions: Use `text-muted-foreground text-sm sm:text-base`.
  - Numbers & Metrics: Extrabold / Bold with tight tracking (`tracking-tight`).

## 2. Monochrome Color Palette (Black & White Theme)
- **UI Base Colors**: Pure Black (`#000000`, `#0A0A0A`, `#131316`), pure White (`#FFFFFF`), and neutral grayscale shades (`zinc` / `neutral` / `gray`).
- **Partner & Firm Logos**: Retain their authentic original brand colors with slightly rounded edges (`rounded-md` / `rounded-lg`).

## 3. Component Design & Template Formatting
- **Buttons**:
  - **Primary Action**: Solid black background with white text (`bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200`), `rounded-xl`, `font-semibold` or `font-medium`.
  - **Secondary / Outline Action**: White background with clean border (`border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground`), `rounded-xl`, `font-medium`.
- **Cards & Containers**:
  - Default cards: Clean white background (`bg-white dark:bg-card`), crisp border (`border border-zinc-200 dark:border-border`), smooth rounded corners (`rounded-2xl` / `rounded-3xl` / `rounded-[24px]`).
  - Featured / Most Popular cards: Light gray background (`bg-[#f4f4f5]` in light theme, `dark:bg-card`), solid 2px black border (`border-2 border-black dark:border-white`), pill badge with dark border.

---
*Trigger code/symbol*: `[BW-STYLE]` or `RULE:BW`
