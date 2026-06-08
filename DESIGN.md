---
name: PitchSide Analytics
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fd'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#f0f0fb'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#8a5100'
  on-secondary: '#ffffff'
  secondary-container: '#fe9800'
  on-secondary-container: '#643900'
  tertiary: '#004e39'
  on-tertiary: '#ffffff'
  tertiary-container: '#00684e'
  on-tertiary-container: '#60ebbc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#ffb86f'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#693c00'
  tertiary-fixed: '#71faca'
  tertiary-fixed-dim: '#50ddaf'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513c'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
  bull-green: '#00B388'
  bear-red: '#E63946'
  ipl-blue-dark: '#001D4A'
  premium-gold: '#FFD700'
  neutral-bg: '#F4F7FA'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  widget-padding: 20px
---

## Brand & Style

The brand personality is authoritative, energetic, and data-driven. It bridges the gap between high-stakes financial trading and the passion of professional cricket. The UI should evoke a sense of precision and "live" urgency, typical of a trading floor, while maintaining the accessible excitement of sports broadcasting.

This design system utilizes a **Corporate / Modern** style with a focus on **High-Contrast Data Visualization**. It prioritizes information density for a desktop-first experience, ensuring that complex match statistics and trading metrics are legible at a glance. The aesthetic is defined by sharp clarity, functional layering, and a professional blue-chip color palette.

## Colors

The palette is anchored by a high-contrast combination of **Cricket Blue** and **Action Orange**. 

- **Primary:** A deep, trustworthy blue used for navigation, primary actions, and brand reinforcement.
- **Secondary:** A vibrant orange, derived from cricket ball and team aesthetics, used for accents and secondary indicators.
- **Data Status:** Standardized trading colors—Green for gains/upside and Red for losses/downside—ensure immediate cognitive recognition of market trends.
- **Neutral:** A cool-tinted gray scale is used for backgrounds and containers to reduce eye strain during long analytical sessions on desktop screens.

## Typography

The typography system is engineered for data density. 

- **Headlines:** Hanken Grotesk provides a sharp, contemporary look that feels professional and athletic.
- **Body:** Inter is used for its exceptional legibility in complex layouts and long-form match analysis.
- **Data:** JetBrains Mono is employed for tabular data, price movements, and strike rates. Its monospaced nature prevents "jumping" numbers during live updates and ensures perfect vertical alignment in trading ladders.

## Layout & Spacing

The system uses a **Fixed Grid** model for the desktop experience to maintain analytical focus. 

- **Grid:** A 12-column grid with a max-width of 1440px. 
- **Rhythm:** An 8px base unit drives all spacing decisions.
- **Desktop Layout:** Features a persistent left sidebar for navigation and a right-side "Order Book" or "Watchlist" drawer, leaving the center area for high-density charts and data tables.
- **Responsive Behavior:** On tablet, the sidebars collapse into icons or bottom sheets. On mobile, the layout reflows into a single-column stack, prioritizing "Live Score" and "Quick Trade" actions.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** The primary background uses a subtle off-white/cool-gray. Cards and data widgets use pure white surfaces to pop against the background.
- **Outlines:** Instead of heavy shadows, use 1px borders in a light neutral shade (#E2E8F0) to define boundaries between data sets without adding visual bulk.
- **Interactive Depth:** Only the "Primary Action" (Buy/Sell) and "Active Match" cards use a soft, ambient shadow to indicate their status as top-level interactive elements.

## Shapes

The shape language is **Soft** but disciplined. 

- **Corner Radius:** Standard components (Inputs, Chips, Small Cards) use a 4px (0.25rem) radius to maintain a professional, slightly technical feel.
- **Large Containers:** Dashboard widgets and main content blocks use an 8px (0.5rem) radius.
- **Specific Elements:** Sports-themed elements, like team badges or "Live" indicators, may use pill-shapes (full round) to differentiate them from the more rigid trading data components.

## Components

### Buttons
- **Primary:** Solid Blue with white text, 4px radius.
- **Trade Buy:** Solid Green (#00B388), high-contrast.
- **Trade Sell:** Solid Red (#E63946), high-contrast.
- **Ghost:** Transparent background with Blue outline for secondary desktop actions like "Export Data."

### Data Visualization
- **Donut Charts:** Used for "Boundaries Split" or "Portfolio Allocation," using the primary and secondary colors.
- **Progress Bars:** Used for "Bowling Economy" or "Win Probability," featuring a 4px height and rounded ends.
- **Trading Tables:** Striped rows (zebra striping) for better horizontal tracking of complex player stats.

### Cards
- **Match Card:** High-contrast header with team logos, condensed score data in the center, and a "Technical Analysis" quick-link at the bottom.
- **Analytical Widget:** White background, subtle border, containing a single specific metric or graph.

### Inputs & Controls
- **Search:** Persistent top-bar search with a "Command+K" shortcut indicator for power users.
- **Segmented Control:** Used for switching between "Overview," "Constituents," and "Technical" views; features a bottom-border indicator in Primary Blue.
- **Badges:** Small, high-saturation chips for "Trending," "Underrated," or "Live" status.