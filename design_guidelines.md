# S402 API & SDK Design Guidelines

## Design Approach

**Selected Approach**: Developer-First Design System
- **Justification**: This is a utility-focused, developer infrastructure project requiring clarity, trust, and efficiency over visual flair
- **Primary References**: Stripe (API design excellence), Vercel (developer dashboard), Linear (clean data presentation)
- **Core Principle**: Technical precision meets minimal aesthetics - every element serves a functional purpose

## Scope Clarification

This project is primarily a headless API/SDK system. Design guidelines cover:
1. **Documentation Site** (primary UI need)
2. **Developer Dashboard** (optional monitoring interface)
3. **API Explorer/Playground** (testing interface)
4. **Error Response Formatting** (developer experience)

---

## Typography System

**Font Stack**:
- Primary: Inter (via Google Fonts) - exceptional for technical content
- Monospace: JetBrains Mono - code snippets and API responses

**Hierarchy**:
- Hero Headlines: 48px (3rem), font-weight: 700, tracking tight
- Section Headers: 32px (2rem), font-weight: 600
- Subsections: 24px (1.5rem), font-weight: 600
- Body Text: 16px (1rem), font-weight: 400, line-height: 1.6
- Code Inline: 14px, JetBrains Mono
- Labels/Captions: 14px (0.875rem), font-weight: 500

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 8, 12, 16**
- Micro spacing (padding/gaps): p-2, p-4
- Component spacing: m-4, m-8
- Section spacing: py-12, py-16
- Large containers: p-16

**Grid System**:
- Container: max-w-7xl with px-4/px-8 gutters
- Documentation content: max-w-4xl (optimal reading width)
- Two-column layouts: 60/40 split (content/sidebar navigation)

**Responsive Breakpoints**:
- Mobile: Single column, stack all elements
- Tablet (md:): Two-column docs layout
- Desktop (lg:): Full navigation sidebar + content

---

## Component Library

### Documentation Site Components

**Hero Section** (if documentation site exists):
- Height: 60vh (not full viewport - allows immediate scroll to content)
- Layout: Centered content with code preview card
- Elements: Headline, 2-sentence value prop, primary CTA ("Get Started"), secondary CTA ("View Docs"), trust indicator ("Used by X developers")
- Visual: Subtle grid pattern background, terminal/code preview showing quick integration example

**Navigation**:
- Top nav: Logo left, docs/API ref/dashboard links center, GitHub star count + "Get API Key" button right
- Sidebar (docs): Sticky, hierarchical tree nav with active state indicators
- Breadcrumbs: Show current location in docs hierarchy

**Code Blocks**:
- Tabbed interface for multi-language examples (TypeScript/Python/cURL)
- Syntax highlighting via Prism.js
- Copy button (top-right corner)
- Line numbers for longer examples
- Dark theme default (better for developer eyes)

**API Reference Cards**:
- Endpoint name + HTTP method badge (GET/POST colored appropriately)
- Request/response schemas in expandable sections
- Parameter tables: name, type, required, description columns
- Live "Try It" button opening API playground

**Response Examples**:
- Side-by-side request/response panels
- JSON formatting with collapsible sections
- Status code badges (200 green, 402 amber, 500 red)
- Highlight payment-specific fields (facilitator, typedData, nonce)

### Developer Dashboard Components (Optional)

**Stats Overview**:
- 4-column grid: Total API Calls, Total Payments, USD1 Volume, Success Rate
- Large numbers (32px) with trend indicators (↑/↓ with percentage)
- Sparkline graphs showing 7-day trend

**Payment Activity Table**:
- Columns: Timestamp, Endpoint, Owner Address (truncated), Amount, Status, TX Hash (link)
- Status badges: Settled (green), Pending (amber), Failed (red)
- Pagination controls
- Export to CSV button

**API Usage Chart**:
- Line chart showing calls over time
- Filterable by endpoint, time range
- Lightweight charting library (Chart.js or Recharts)

**Integration Status Panel**:
- Connection status indicators: RPC connection (green/red dot), Contract verified, USD1 balance
- Quick diagnostics section

### Forms & Inputs

**Configuration Forms** (if dashboard exists):
- Input fields: border, rounded corners, focus ring, helper text below
- Label above input, 14px font-weight 500
- Validation states: error (red border + message), success (green checkmark)
- API key display: monospace font, masked with reveal button
- Recipient address input: ENS resolution indicator

**Buttons**:
- Primary: Solid background, white text, rounded, px-6 py-3
- Secondary: Border only, transparent background
- Danger: Red for destructive actions
- Disabled: Reduced opacity
- Loading state: Spinner icon replacing text

---

## Color Palette Strategy

**Instructions for Implementation**:
- Use a technical, trust-focused palette
- Suggested approach: Dark mode primary with light mode option
- Color roles: Primary (brand), Success (green), Warning (amber), Error (red), Neutral (grays)
- Code blocks: Dark background with syntax highlighting
- Status indicators: Green (success/settled), Amber (pending), Red (failed/error)
- Data visualization: Distinct, accessible colors for charts

---

## Content Structure

### Documentation Site Sections:

1. **Hero Section**: Value proposition + quick start code snippet preview
2. **Key Features** (3-column grid):
   - Pay-per-API-call simplicity
   - On-chain settlement verification
   - Auto-retry SDK clients
3. **Quick Start Guide**: Step-by-step integration (numbered cards)
4. **Architecture Overview**: Diagram + explanation of payment flow
5. **Code Examples**: Tabbed examples for TypeScript SDK, Python SDK, cURL
6. **API Reference**: Searchable endpoint documentation
7. **Smart Contract Details**: Facilitator address, ABI, chain info
8. **FAQ**: Common integration questions
9. **Footer**: Links to GitHub, documentation sections, contact

### Dashboard Sections (if built):

1. **Overview**: Stats cards + usage chart
2. **Payment Activity**: Filterable transaction table
3. **API Keys**: Generate/revoke keys interface
4. **Settings**: Configure recipient, pricing, webhooks
5. **Logs**: Real-time API request logs with filtering

---

## Developer Experience Principles

1. **Code First**: Show working code examples immediately - developers want to see implementation, not marketing copy
2. **Copy-Paste Ready**: Every code example should be runnable with minimal modification
3. **Progressive Disclosure**: Start with simplest use case, link to advanced patterns
4. **Error Clarity**: 402 responses include exact payment parameters and next steps
5. **Type Safety**: Highlight TypeScript support prominently
6. **Testing Tools**: Provide sandbox/testnet instructions before mainnet

---

## Visual Hierarchy Rules

- **Most Important**: Code examples, API endpoints, payment parameters
- **Supporting**: Explanatory text, diagrams, navigation
- **Background**: Trust indicators, stats, footer links

**Reading Flow**: 
- Docs: F-pattern (nav left, content center, TOC right if needed)
- Dashboard: Z-pattern (stats top, primary content middle, actions bottom)

---

## Accessibility Standards

- Keyboard navigation for all interactive elements
- Focus indicators on all clickable items
- Sufficient color contrast (WCAG AA minimum)
- Code blocks with high-contrast syntax highlighting
- Screen reader labels for icon-only buttons
- Alt text for diagrams

---

## Icons

**Library**: Heroicons (via CDN)
- Navigation: Menu, X (close), ChevronRight (breadcrumbs)
- Actions: DocumentDuplicate (copy code), ExternalLink (view on chain)
- Status: CheckCircle (success), XCircle (error), Clock (pending)
- Features: LightningBolt (fast), ShieldCheck (secure), Code (developer-friendly)

---

## Images

**Hero Section Image**:
- Terminal/code editor screenshot showing S402Client usage
- Alternatively: Diagram of payment flow (client → 402 → settle → retry)
- Size: 600x400px, positioned right side on desktop, below text on mobile

**Documentation Images**:
- Architecture diagram: Payment flow from user → API → blockchain
- Sequence diagram: 402 response → sign → settle → success
- Smart contract interaction visualization

**No decorative imagery** - all images serve educational/technical purposes

---

## Animation Guidelines

**Minimal animations only**:
- Code block copy button: Brief scale on click
- Table row hover: Subtle background color shift
- Chart data: Smooth transitions when filtering
- Loading states: Simple spinner, no elaborate animations

**Avoid**: Parallax, excessive transitions, auto-playing demos

---

This design system prioritizes **developer trust, technical clarity, and functional efficiency** over visual experimentation. The aesthetic should feel professional, modern, and invisible - letting the technical content shine.