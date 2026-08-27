# Design System for PhishLens Landing Page

## Overview
This landing page follows a modern cybersecurity SaaS aesthetic: dark, confident, high-contrast, and trust-focused. The visual language should feel premium, technical, and protective without being overly aggressive.

## Core Style
- Style: modern SaaS / cybersecurity landing page
- Mood: safe, alert, professional, trustworthy
- Emphasis: clarity, urgency, readability, confidence
- Target audience: cybersecurity-conscious users, teams, and businesses

## Color Palette
Use a dark base with bright accent colors to signal security and action.

### Primary colors
- Background base: slate-950 (#020617)
- Background panels: slate-900 (#0f172a)
- Card backgrounds: white/5 with subtle borders
- Primary text: white (#ffffff)
- Secondary text: slate-300 (#cbd5e1)
- Muted text: slate-400 (#94a3b8)

### Accent colors
- Success / trust accent: emerald-400 (#34d399)
- Secondary accent: cyan-400 (#22d3ee)
- Warning / risk highlight: amber-400 (#fbbf24)
- Danger / phishing alert: rose-500 (#f43f5e)

### Gradients
Use gradients sparingly and only for high-impact surfaces.

Preferred gradient:
- from-emerald-400 to-cyan-400
- This should be used for primary CTAs and key emphasis blocks.

Warning gradient:
- from-amber-400 via-orange-400 to-rose-500
- Use for risk bars, threat levels, or suspicious indicator visuals.

Background gradient accent:
- from-emerald-500/10 via-slate-900 to-cyan-500/10
- Use for feature highlight sections or security banner blocks.

## Typography
- Base font: sans-serif system stack
- Recommended stack: Arial, Helvetica, sans-serif
- Heading weight: heavy / bold
- Body weight: regular to medium
- Letter spacing: slightly tighter for headings, wider for small uppercase labels

### Heading scale
- H1: large, bold, high-contrast, strong leading
- H2: large and structured
- H3: medium, clear and compact

### Label styles
- Use uppercase small labels with tracking-[0.2em] for section tags
- Example: "PHISHING PROTECTION"

## Layout & Spacing
Use a clean grid and generous spacing for clarity.

### Global spacing system
- Small gaps: 4px / 8px
- Component gaps: 12px / 16px
- Section spacing: 24px / 32px / 48px / 64px+
- Page padding: 24px on mobile, 32px+ on desktop
- Max content width: 80rem (max-w-7xl)

### Layout patterns
- Large centered container with generous outer margins
- Rounded cards and section blocks for structure
- Use soft borders and transparency to keep the dark theme elegant
- Content blocks should have layered depth via subtle shadows

### Border radius
- Buttons: fully rounded pills
- Cards: rounded-2xl to rounded-3xl
- Feature blocks: rounded-3xl
- Large section containers: rounded-[28px] or rounded-[32px]

## UI Components

### Buttons
- Primary CTA: pill-shaped, bright emerald-to-cyan gradient
- Secondary CTA: dark transparent button with subtle white border
- Hover states: slight lift or brighter fill, never dramatic motion

### Cards
- Dark translucent surfaces over slate background
- Border: border-white/10
- Background: bg-white/5 or bg-slate-900/80
- Hover treatment: minimal if any; site should stay clean and static

### Input areas
- Textarea and file upload zones should feel technical and minimal
- Dark base with subtle border and focus glow on active state
- Use focus:border-emerald-400 for interactive emphasis

### Status panels
- Danger score displays should use a warning palette
- Risk bar: amber/orange/red scale
- Use labels such as Suspicious, Live check, Risk score, Likely phishing

## Visual Hierarchy
1. Headline is the strongest element and should lead with the primary security promise.
2. Supporting paragraph should be concise and trust-building.
3. CTA buttons are next most important.
4. Stats and trust metrics reinforce credibility.
5. Feature cards explain value without clutter.

## General Design Principles
- Dark theme first, bright accent second
- Keep text highly legible against dark backgrounds
- Use gradients only for emphasis, not everywhere
- Preserve a clean, professional cybersecurity aesthetic
- Avoid overly playful visuals or too many bright colors
- Focus on trust, safety, and confidence

## Example Design Tokens
- bg-slate-950
- text-white
- text-slate-300
- border-white/10
- bg-emerald-500/10
- border-emerald-400/40
- bg-gradient-to-r from-emerald-400 to-cyan-400
- bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500

## Consistency Rules for Future Agents
- Do not replace the dark base palette with a light theme.
- Keep the CTA gradient consistent across primary buttons.
- Maintain rounded, soft-edged UI cards.
- Preserve spacing rhythm using the established 8px-based layout system.
- Use subtle borders and transparency rather than heavy shadows.
- Maintain a polished, premium cybersecurity look rather than a generic startup template.

## Summary
The design should look like a high-trust security product: dark, crisp, minimal, and slightly futuristic. The visual system is built around slate backgrounds, emerald/cyan highlights, amber warning tones, and generous spacing to maintain clarity and confidence.
