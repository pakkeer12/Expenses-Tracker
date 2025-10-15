# Design Guidelines: Expense & Budget Tracker

## Design Approach: Material Design System
**Rationale**: Finance and productivity applications require clear information hierarchy, efficient data visualization, and trustworthy aesthetics. Material Design provides structured patterns for data-dense interfaces while maintaining visual clarity.

**Industry References**: Drawing patterns from Mint, YNAB, and Wallet - emphasizing data readability, dashboard efficiency, and financial trust signals.

---

## Core Design Principles
1. **Data Clarity First**: Every visual decision prioritizes information comprehension
2. **Trust Through Consistency**: Predictable patterns reduce cognitive load for financial tasks
3. **Efficient Interactions**: Minimize steps between user intent and action completion
4. **Responsive Data Display**: Charts and tables adapt gracefully across devices

---

## Color Palette

### Light Mode
- **Primary**: 220 90% 56% (Trustworthy blue for primary actions, headers)
- **Primary Hover**: 220 90% 48%
- **Surface**: 0 0% 100% (White backgrounds)
- **Surface Secondary**: 220 20% 97% (Card backgrounds, subtle separation)
- **Border**: 220 15% 88%
- **Text Primary**: 220 20% 15%
- **Text Secondary**: 220 10% 45%

### Dark Mode
- **Primary**: 220 80% 60%
- **Primary Hover**: 220 80% 52%
- **Surface**: 220 15% 12% (Dark background)
- **Surface Secondary**: 220 15% 16% (Cards, elevated surfaces)
- **Border**: 220 10% 25%
- **Text Primary**: 220 15% 95%
- **Text Secondary**: 220 10% 65%

### Semantic Colors (Both Modes)
- **Success/Income**: 142 76% 36% (light) / 142 71% 45% (dark)
- **Danger/Expense**: 0 84% 60% (light) / 0 72% 65% (dark)
- **Warning/Budget Alert**: 38 92% 50% (light) / 38 92% 60% (dark)
- **Info**: 199 89% 48% (light) / 199 89% 56% (dark)

---

## Typography

**Font Family**: 'Inter' from Google Fonts for optimal number/data readability

### Hierarchy
- **Dashboard Headers**: text-3xl md:text-4xl font-bold
- **Section Titles**: text-xl md:text-2xl font-semibold
- **Card Titles**: text-lg font-semibold
- **Body Text**: text-base font-normal
- **Data Labels**: text-sm font-medium
- **Financial Amounts**: font-semibold (always medium weight for scanability)
- **Captions/Helper**: text-xs text-secondary

---

## Layout System

**Spacing Units**: Consistently use Tailwind units of **4, 6, 8, 12, 16** for predictable rhythm
- Component padding: p-4 md:p-6
- Section spacing: space-y-6 md:space-y-8
- Card gaps: gap-4 md:gap-6
- Page margins: px-4 md:px-8 lg:px-12

**Grid Structure**:
- Dashboard: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Expense List: Single column with max-w-4xl
- Analytics: `grid grid-cols-1 lg:grid-cols-2 gap-8`

---

## Component Library

### Navigation
- **Desktop**: Vertical sidebar (w-64) with logo, navigation items, user profile at bottom
- **Mobile**: Bottom tab bar (fixed bottom-0) with 4-5 primary actions, hamburger for secondary menu
- Active state: Primary color background with rounded corners

### Dashboard Cards
- Elevated surface with subtle shadow: `shadow-sm border rounded-xl`
- Stat cards: Large number display (text-3xl font-bold), label below (text-sm text-secondary)
- Quick action cards: Icon + Title + Subtext, hover lift effect (hover:shadow-md transition)

### Data Tables
- Striped rows for scanability: `odd:bg-surface even:bg-surface-secondary`
- Sticky header on scroll
- Mobile: Transform to stacked cards with key-value pairs
- Action buttons: Icon-only on mobile, icon+text on desktop

### Forms
- Input fields: `bg-surface-secondary border border-border rounded-lg px-4 py-3`
- Dark mode inputs: Maintain subtle contrast with darker background
- Floating labels for space efficiency
- Category selector: Colorful icon badges
- Date picker: Inline calendar dropdown

### Charts (Recharts)
- **Pie Chart**: Category breakdown with color-coded segments, percentage labels
- **Line Chart**: Monthly trends with gradient fill under line, grid lines for reference
- **Bar Chart**: Budget vs spending comparison, dual colors (budget in muted, actual in primary/danger)
- Responsive: Reduce margins/padding on mobile, stack legends below

### Budget Progress Bars
- Rounded full bar with fill animation
- Color transitions: Green (under 70%) → Yellow (70-90%) → Red (over 90%)
- Display: Current/Budget amounts on ends, percentage in center

### Modals & Dialogs
- Centered overlay with backdrop blur: `backdrop-blur-sm bg-black/50`
- Content card: `bg-surface rounded-2xl max-w-lg w-full p-6`
- Mobile: Slide up from bottom with rounded top corners

### Buttons
- Primary: Filled primary color, white text, rounded-lg px-6 py-3
- Secondary: Outlined border-2 border-primary text-primary
- Danger: Filled danger color for delete actions
- Icon buttons: p-2 rounded-full hover:bg-surface-secondary

### Alerts & Notifications
- Toast notifications: Fixed top-right, slide-in animation
- Budget alerts: Inline warning banners with icon, dismissible
- Color-coded by severity (info/warning/danger)

---

## Mobile Responsiveness

### Breakpoint Strategy
- Mobile-first: Base styles for 320px+
- Tablet: md: (768px+) for 2-column layouts
- Desktop: lg: (1024px+) for full dashboard experience

### Mobile Optimizations
- Stack dashboard cards vertically
- Bottom navigation with icon-only labels
- Swipe gestures for delete actions on expense items
- Collapsible filter panels with slide-down animation
- Larger touch targets (min 44px height)

---

## Animations
Use sparingly for functional feedback only:
- Card hover: Subtle lift (transform: translateY(-2px))
- Loading states: Skeleton screens with shimmer (not spinners)
- Chart entry: Stagger animation for bars/segments
- Modal entry: Fade + scale (0.95 to 1)
- No decorative animations

---

## Dark Mode Implementation
- Consistent dark theme across all form inputs and text fields
- Use dark surface colors (not pure black) for reduced eye strain
- Increase border visibility with higher contrast borders
- Chart colors: Slightly brighter/saturated versions for dark backgrounds
- Toggle: Persistent moon/sun icon in header with smooth transition

---

## Accessibility
- Maintain 4.5:1 contrast ratio for all text
- ARIA labels on all interactive elements
- Keyboard navigation with visible focus states (ring-2 ring-primary)
- Screen reader announcements for budget alerts
- Financial amounts: Include currency symbols and semantic HTML

---

## Images
**No hero images required** - This is a utility application focused on data and functionality. Visual interest comes from:
- Data visualization (charts and graphs)
- Color-coded category icons
- Stat cards with large numerical displays
- Profile avatars in user sections

Use illustrative icons from **Heroicons** via CDN for categories (food, transport, entertainment, etc.)