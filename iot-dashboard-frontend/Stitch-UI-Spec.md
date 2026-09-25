# Stitch AI Command Center - UI Implementation Specification

> **📌 Implementation Status: 100% COMPLETED (All Requirements Implemented & Verified)**  
> **Date Verified:** 2026-09-19  
> **Environment:** Angular 21 (Standalone) + Tailwind CSS v4

---

## 📊 Implementation Checklist & Status Tracker

| Category | Component / Feature | File Path | Status |
| :--- | :--- | :--- | :---: |
| **Shell Layout** | `MainLayoutComponent` | `src/app/layouts/main-layout/` | ✅ **DONE** |
| **Navigation** | Fixed Sidebar (`w-20`, `routerLink`) | `main-layout.component.html` | ✅ **DONE** |
| **Routing** | Child routes & default redirect | `src/app/app.routes.ts` | ✅ **DONE** |
| **Target Page** | `StitchAiCenterComponent` | `src/app/pages/stitch-ai-center/` | ✅ **DONE** |
| **Secondary Page**| `OverviewDashboardComponent` | `src/app/pages/overview-dashboard/` | ✅ **DONE** |
| **Secondary Page**| `MachineFleetComponent` | `src/app/pages/machine-fleet/` | ✅ **DONE** |
| **Secondary Page**| `WorkOrdersComponent` | `src/app/pages/work-orders/` | ✅ **DONE** |
| **Styling & Glows**| Tailwind arbitrary values & Neon glow shadows | `src/styles.scss` | ✅ **DONE** |

---

## Context
- [x] Expert Angular 21 and Tailwind CSS developer implementation.
- [x] Build pixel-perfect, interactive "Stitch AI Command Center" application based on "Flip7 Dark Edition" design system.
- [x] Use Angular Standalone Component architecture and Angular Router for Single Page Application (SPA) navigation without page refreshes.

---

## Application Architecture & Routing

The application follows a modular architecture, separating the shell/layout from the individual page contents.

### 1. Parent Layout (`MainLayoutComponent`) - [x] **DONE**
- [x] Root wrapper component.
- [x] **Layout Structure:** Flexbox container (`min-h-screen`, `bg-[#0B1514]`, `text-[#E8F6F5]`, `flex`).
- [x] **Sidebar Navigation (Left):** Stays fixed. Contains navigation icons.
- [x] **Main Content Area (Right):** Uses `<router-outlet>` to dynamically load child components. It is `flex-1` with padding `32px` (`p-8`).

### 2. Child Components (The 4 Pages) - [x] **DONE**
All standalone components generated for the following routes:
- [x] 1. `OverviewDashboardComponent` (Route: `overview`) - 📊 Overview Dashboard (Implemented)
- [x] 2. `StitchAiCenterComponent` (Route: `stitch-ai-center`) - 🤖 Stitch AI Center (Full pixel-perfect implementation completed)
- [x] 3. `MachineFleetComponent` (Route: `machine-fleet`) - 🏭 Machine Fleet (Implemented)
- [x] 4. `WorkOrdersComponent` (Route: `work-orders`) - 🛠️ Work Orders (Implemented)

### 3. Routing Configuration (`app.routes.ts`) - [x] **DONE**
- [x] Configured the routes so that the 4 components are children of `MainLayoutComponent`.
- [x] Set the default route (`''`) to redirect to `stitch-ai-center`.
- [x] In the Sidebar, use `[routerLink]` and `routerLinkActive="bg-[#1E3835] text-[#4ED9D3]"` to handle navigation and active states smoothly without page reload.

---

## Global Design Tokens (Tailwind Arbitrary Values) - [x] **DONE**
- [x] **Background (App):** `#0B1514` (Deep Teal)
- [x] **Background (Card/Panel):** `#162B29` (Dark Teal)
- [x] **Background (Input/Interactive):** `#1E3835`
- [x] **Text Primary:** `#E8F6F5`
- [x] **Accent Gold:** `#FFD23F`
- [x] **Accent Neon Teal:** `#4ED9D3`
- [x] **Accent Coral:** `#EF6C4A`
- [x] **Sky Blue:** `#5DADE2`
- [x] **Teal Base:** `#2BA8A2`

## Neon Glow Shadows (Retro-Arcade Vibe) - [x] **DONE**
- [x] Gold Glow: `shadow-[0_0_24px_rgba(255,210,63,0.6)]`
- [x] Coral Glow: `shadow-[0_0_24px_rgba(239,108,74,0.6)]`
- [x] Teal Glow: `shadow-[0_0_24px_rgba(43,168,162,0.5)]`
- [x] Card Lift: `shadow-[0_4px_24px_rgba(43,168,162,0.15)]`

---

## Pixel-Perfect UI Rules

### 1. Sidebar (Inside `MainLayoutComponent`) - [x] **DONE**
- [x] Width exactly `80px` (`w-20`), `border-r border-[#1E3835]`, flex column, centered items, gap `24px` (`gap-6`), padding top `32px` (`pt-8`).
- [x] Navigation items trigger router links without page refreshing (`[routerLink]`).
- [x] Active state applies `bg-[#1E3835] text-[#4ED9D3]`.

### 2. StitchAiCenterComponent (The Target Page) - [x] **DONE**

#### Header - [x] **DONE**
- [x] Flex container, justify-between, items-center, margin-bottom `32px` (`mb-8`).
- [x] **Title:** Text size `30px` (`text-3xl`), font `extrabold`. Include a robot emoji "🤖" with slight teal text-shadow.
- [x] **Target Machine Selector:** Pill-shaped (`rounded-full`), border `1px solid #FFD23F`, padding `8px 16px` (`px-4 py-2`). Text: "Target: Wire Bonder 01" in `#FFD23F`, font size `14px` (`text-sm`) with interactive target switching.

#### Grid System - [x] **DONE**
- [x] CSS Grid: `grid-cols-12`, gap `24px` (`gap-6`).
- [x] Left Column (Command Input): `col-span-12 lg:col-span-4`.
- [x] Right Column (Diagnostic Card): `col-span-12 lg:col-span-8`.

#### Left Column: Command Input Panel - [x] **DONE**
- [x] **Section Title:** "⚡ Quick Actions", size `16px` (`text-base`), font `semibold`, color `#4ED9D3`, margin-bottom `16px` (`mb-4`).
- [x] **Quick Action Buttons (3 items):**
  - [x] Full width (`w-full`), pill-shape (`rounded-full`), border `2px solid #1E3835`, text color `#E8F6F5`, padding `16px 24px` (`px-6 py-4`), margin-bottom `12px` (`mb-3`), text-align left.
  - [x] **Hover State:** `border-[#4ED9D3]`, `text-[#4ED9D3]`, apply **Teal Glow** (`shadow-[0_0_24px_rgba(43,168,162,0.5)]`).
- [x] **Manual Prompt Area:**
  - [x] Label: "MANUAL DIAGNOSIS QUERY", size `12px` (`text-xs`), uppercase, tracking-wider, color `#2BA8A2`, margin top `32px` (`mt-8`), margin bottom `8px` (`mb-2`).
  - [x] Textarea: `bg-[#1E3835]`, border `1px solid #1E3835`, rounded `16px` (`rounded-2xl`), text color `#E8F6F5`, placeholder `#E8F6F5` at 50% opacity. Padding `16px` (`p-4`), min-height `120px`.
  - [x] **Focus State:** `outline-none`, `border-[#5DADE2]`, `ring-2 ring-[#5DADE2]/40`.
- [x] **Run Diagnostics Button:**
  - [x] Margin top `24px` (`mt-6`). Full width, pill-shape (`rounded-full`), padding `16px` (`py-4`).
  - [x] Background: Linear gradient to right from `#FFD23F` to `#B38F00`.
  - [x] Text: color `#124D4A`, font `extrabold`, size `16px` (`text-base`), uppercase, tracking-widest.
  - [x] Effect: Added **Gold Glow** (`shadow-[0_0_24px_rgba(255,210,63,0.6)]`). Hover: `scale-105`, transition transform.

#### Right Column: Diagnostic Card - [x] **DONE**
- [x] **Container:** `bg-[#162B29]`, rounded `24px` (`rounded-3xl`), border `1px solid #1E3835`, apply **Card Lift shadow** (`shadow-[0_4px_24px_rgba(43,168,162,0.15)]`). Padding `32px` (`p-8`), flex column, justify-between.

*Card Header* - [x] **DONE**
- [x] Flex, justify-between, items-center, border-bottom `1px solid #1E3835`, padding-bottom `24px` (`pb-6`), margin-bottom `24px` (`mb-6`).
- [x] **Title:** "Diagnostic Results", size `24px` (`text-2xl`), font `bold`.
- [x] **Confidence Badge:** Pill-shape, `bg-[#4ED9D3]/20`, text `#4ED9D3`, padding `6px 16px` (`px-4 py-1.5`), font `bold`, size `14px` (`text-sm`), flex items-center gap `8px` (`gap-2`) with a checkmark icon.

*Analysis Body (3 nested panels)* - [x] **DONE**
- [x] **1. Root Cause Panel (Coral Accent):**
  - [x] Border-left `4px solid #EF6C4A`. Padding `0 0 0 16px` (`pl-4`), margin-bottom `32px` (`mb-8`).
  - [x] Title: "⚠️ ROOT CAUSE ANALYSIS", text `#EF6C4A`, size `12px`, uppercase, bold, tracking-widest.
  - [x] Content: Text size `18px` (`text-lg`), font `medium`, margin-top `8px` (`mt-2`).

- [x] **2. Impact Prediction Panel (Gold Warning):**
  - [x] Background `bg-[#FFD23F]/10`, border `1px solid #FFD23F/30`, rounded `12px` (`rounded-xl`), padding `16px` (`p-4`), margin-bottom `32px` (`mb-8`).
  - [x] Title: "⚡ IMPACT PREDICTION", text `#FFD23F`, size `12px`, uppercase, bold.
  - [x] Content: Text `#FFD23F`, margin-top `8px` (`mt-2`).

- [x] **3. Recommendation Panel (Blue/Teal Accent):**
  - [x] Border-left `4px solid #5DADE2`. Padding `0 0 0 16px` (`pl-4`), margin-bottom `48px` (`mb-12`).
  - [x] Title: "💡 STITCH AI PRESCRIPTIVE ACTION", text `#5DADE2`, size `12px`, uppercase, bold.
  - [x] Content: Text size `16px` (`text-base`), margin-top `8px` (`mt-2`).

*Executive Action Panel (Bottom row)* - [x] **DONE**
- [x] Label above row: "EXECUTIVE ACTION PANEL (FINAL DECISION)", size `10px` (`text-[10px]`), tracking-widest, color `#2BA8A2`, margin-bottom `12px` (`mb-3`).
- [x] Flex row, gap `16px` (`gap-4`). All buttons are pill-shaped (`rounded-full`), flex-1, font `bold`, padding `16px` (`py-4`), flex center items.
- [x] **Button 1 (Approve):** `bg-[#2BA8A2]`, text `#E8F6F5`, add **Teal Glow** (`shadow-[0_0_24px_rgba(43,168,162,0.5)]`).
- [x] **Button 2 (Override):** `bg-[#0B1514]`, border `2px solid #1E3835`, text `#E8F6F5`. Hover: `bg-[#1E3835]`.
- [x] **Button 3 (Emergency Stop):** `bg-[#EF6C4A]`, text white, add **Coral Glow** (`shadow-[0_0_24px_rgba(239,108,74,0.6)]`). Add a warning icon.