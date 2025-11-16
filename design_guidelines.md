# Design Guidelines: Okul Meclisi Portalı (School Council Portal)

## Design Approach
**System**: Material Design 3 principles adapted for educational dashboard context with dark theme aesthetic shown in the mockup. This utility-focused application prioritizes information clarity, quick scanning, and efficient task completion while maintaining visual appeal for student engagement.

## Core Design Principles
1. **Information hierarchy**: Clear visual distinction between primary content and supporting elements
2. **Dark-first design**: Deep purple-blue dark theme as primary interface with high contrast elements
3. **Approachability**: Soften the administrative nature with rounded corners and gentle shadows
4. **Turkish typography**: Proper support for Turkish characters (İ, ı, Ş, ş, Ğ, ğ, Ü, ü, Ö, ö, Ç, ç)

## Typography
**Font Family**: 
- Primary: Inter or IBM Plex Sans via Google Fonts (excellent Turkish character support)
- Fallback: system-ui, sans-serif

**Scale & Hierarchy**:
- Page titles: text-3xl font-bold (mobile: text-2xl)
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base font-normal
- Supporting text: text-sm
- Metadata/timestamps: text-xs text-muted-foreground

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-4 to p-6 (cards, dialogs)
- Section spacing: space-y-6 to space-y-8
- Grid gaps: gap-4 to gap-6
- Container margins: mx-4 on mobile, mx-auto max-w-7xl px-6 on desktop

**Grid Structure**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), 1-column on mobile
- Class directory: 2-column layout (sidebar filter + main list) on desktop
- Admin tabs: Full-width single column with nested grids per section
- Lists/Tables: Single column stack on mobile, multi-column on tablet+

## Component Library

### Navigation
- **Top bar**: Fixed header with logo left, main nav center, profile/logout right
- **Main navigation**: Horizontal tabs on desktop, hamburger menu on mobile
- Nav items: "Duyurular", "Oylamalar", "Fikirler", "Sınıflar", "Yönetici" (admin only)
- Active state: Bottom border accent with subtle background highlight

### Cards
- Rounded corners: rounded-lg to rounded-xl
- Shadow: shadow-md with subtle glow effect
- Padding: p-6
- Header + content + footer structure
- Hover state: Slight lift (transform translate-y-[-2px]) with increased shadow

### Announcements
- Card-based display with announcement icon
- Title (text-lg font-semibold) + timestamp (text-xs)
- Content preview: 3-line clamp with "Devamını Oku" link
- Full view: Modal/dialog or dedicated page

### Poll Cards
- Question prominently displayed (text-lg font-medium)
- Option list with radio buttons or progress bars (after voting)
- Vote percentage displayed with animated progress bars
- "Oy Ver" button (primary) or "Oy Verildi" (disabled state)
- Vote count: "X kişi oy verdi" below options

### Ideas/Blog System
- List view: Title, author name, approval status badge, excerpt (2-line clamp), timestamp
- Status badges: Pending (yellow), Approved (green), Rejected (red) with dot indicators
- Detail view: Full content with formatted text, author profile link, comment section below
- Comments: Nested design with avatar, name, timestamp, moderation status indicator

### Moderation Queue (Admin)
- Table layout with columns: Content preview, Author, Submitted date, Status, Actions
- Quick action buttons: "Onayla" (green), "Reddet" (red), "Görüntüle" (neutral)
- Bulk selection checkboxes for batch operations

### Class Directory
- Left sidebar: Select/dropdown filter for class names (9-A, 9-B, 10-A, etc.)
- Main area: Table with columns - Ad Soyad (Name), Numara (Student No), Sınıf (Class)
- Search bar above table: "Öğrenci ara..." placeholder
- Responsive: Sidebar collapses to top filter on mobile, table converts to card stack

### Forms
- Label above input fields (text-sm font-medium)
- Input fields: rounded-md border with focus ring
- Textarea: Minimum 4 rows for content fields
- Submit buttons: Full width on mobile, auto width on desktop, positioned bottom-right
- Validation: Inline error messages below fields in red text

### Empty States
- Centered vertically in container
- Icon (from lucide-react, size 48-64px)
- Heading: "Henüz [content type] yok"
- Subtext: Brief explanation
- Action button if applicable: "Yeni Ekle" or "Oluştur"

### Modals/Dialogs
- Max width: max-w-2xl for forms, max-w-4xl for content views
- Backdrop: Semi-transparent dark overlay
- Close button: Top-right X icon
- Action buttons: Bottom-right, primary action emphasized

## Admin Dashboard Tabs
- Horizontal tab navigation: "Kullanıcılar", "Duyurular", "Oylamalar", "Moderasyon", "Sınıflar"
- Each tab: Full-width content area with appropriate layout (table, form, or grid)
- User management: Table with role dropdown, search/filter bar
- CSV upload: Drag-drop zone with file format instructions

## Responsive Behavior
- Mobile (< 768px): Single column, stacked navigation, full-width cards
- Tablet (768-1024px): 2-column grids where appropriate
- Desktop (> 1024px): Full multi-column layouts, sidebar navigation visible

## Accessibility
- Focus indicators: 2px outline offset by 2px
- Button minimum target size: 44px height
- Proper heading hierarchy (h1 → h2 → h3)
- aria-labels for icon-only buttons
- Form labels associated with inputs
- Error announcements for screen readers

## Animations
**Minimal usage**:
- Page transitions: Simple fade (duration-200)
- Card hover: Subtle lift (transition-transform duration-200)
- Progress bars: Smooth width animation (transition-all duration-500)
- Modal open/close: Scale + fade (duration-300)
- No scroll-triggered or complex animations

## Images
No hero images required. This is a utility dashboard application. Use icons from lucide-react throughout:
- Dashboard sections: Bell (announcements), BarChart3 (polls), Lightbulb (ideas), Users (classes)
- Empty states: Relevant contextual icons
- User avatars: Initials in circular containers or placeholder icons