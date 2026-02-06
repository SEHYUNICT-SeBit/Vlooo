# AI Coding Agent Instructions - Vlooo

> **Note**: Guidance for AI coding agents working on Vlooo - the AI service that converts PPT presentations into professional video content.

## Project Overview

**Project**: Vlooo - "내 PPT가 전문가의 영상으로 흐르다"  
**Status**: 🟢 MVP Development Phase  
**Core Value**: Professionalism × Ease × Speed

**Purpose**: B2C web platform that transforms PPT documents into professional video presentations with AI-generated voiceovers using IT expert persona.

**Tech Stack**:
- **Frontend**: Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Backend/Edge**: Cloudflare Workers, FastAPI
- **Storage**: Cloudflare R2
- **AI Engines**: OpenAI (GPT-4o-mini), ElevenLabs (TTS), FFmpeg/Remotion
- **Deployment**: Cloudflare Pages (frontend), Workers (serverless backend)

## Architecture & Key Components

### Core System
1. **Frontend Layer** (`src/components/`, `src/pages/`)
   - Navigation system (4 main entry points: Header, Dashboard, Conversion, Account, Footer)
   - Real-time preview rendering
   - Responsive design for mobile/tablet/desktop

2. **Menu & Navigation System** (`src/data/menuItems.ts`, `src/types/menu.ts`)
   - Centralized menu configuration (JSON + TypeScript hybrid)
   - 6-step conversion wizard UI
   - Dashboard sidebar with sections: Projects, Analytics, Settings
   - Fully localized in Korean

3. **PPT Processing Engine** (Backend via FastAPI)
   - Slide extraction (python-pptx)
   - Image & text parsing
   - Layout analysis

4. **AI Script Generation** (Backend)
   - OpenAI GPT-4o-mini for IT expert persona scripting
   - Context-aware narration generation

5. **Audio Synthesis** (ElevenLabs API)
   - Multiple voice options (professional male/female, friendly variants)
   - Real-time preview generation

6. **Video Rendering** (FFmpeg/Remotion)
   - Client-side preview (browser-based)
   - On-demand server-side rendering (for finalization)
   - Configurable output: 720p/1080p/4K

### Data Flow
```
User PPT Upload → PPT Parsing → AI Script Generation → 
Voice Selection → TTS Rendering → Video Composition → 
Client Preview → Final Export
```

## Development Workflows

### Building & Testing
```bash
npm run dev          # Next.js development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # TypeScript & ESLint check
npm run type-check   # Type checking only
```

### Menu & Navigation Development
- **Menu configuration**: Edit `src/data/menuItems.ts` or `src/config/menu.json`
- **New navigation item**: Add to appropriate array (HEADER_MENU, DASHBOARD_MENU, etc.)
- **Component updates**: Modify `src/components/Navigation.tsx`, `DashboardSidebar.tsx`, etc.

### Debug Configuration
- Set breakpoints in VSCode (F5 to start debugging)
- Environment variables in `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  OPENAI_API_KEY=sk-...
  ELEVENLABS_API_KEY=...
  CLOUDFLARE_R2_KEY=...
  ```

## Code Patterns & Conventions

### Critical Patterns

1. **Menu Item Definition** - All UI navigation comes from centralized `menuItems.ts`
   ```typescript
   // src/data/menuItems.ts
   export const HEADER_MENU: MenuItem[] = [
     {
       id: 'home',
       label: '홈',  // Always Korean
       path: '/',
       icon: 'home'
     }
   ];
   ```
   **Why**: Single source of truth for all menu content enables consistent UX updates and multilingual support.

2. **Component Composition** - Navigation components consume menu data via `menuItems.ts`
   ```typescript
   // src/components/Navigation.tsx
   import { HEADER_MENU } from '@/data/menuItems';
   // Render HEADER_MENU array directly
   ```
   **Why**: Separates UI logic from content, allowing design changes without touching menu data.

3. **TypeScript Menu Types** - All menu structures use strict typing
   ```typescript
   // src/types/menu.ts
   export interface MenuItem {
     id: string;
     label: string;
     path?: string;
     children?: MenuItem[];
   }
   ```

### Project-Specific Rules

- **Naming**: PascalCase for components (Navigation.tsx), camelCase for utilities
- **Korean Localization**: All UI labels in Korean from `menuItems.ts` - never hardcode English
- **File Organization**:
  - Components in `src/components/` (re-usable UI)
  - Data/config in `src/data/` and `src/config/` (content)
  - Types in `src/types/` (TypeScript definitions)
  - Hooks in `src/hooks/` (custom React logic)
- **Import Alias**: Use `@/` for all imports (configured in `tsconfig.json` or `next.config.js`)

## Integration Points

- **OpenAI API**: `NEXT_PUBLIC_API_URL/api/script` - generates IT expert narration scripts
- **ElevenLabs API**: Voice synthesis - multiple Korean voice options
- **Cloudflare R2**: Asset storage (PPT files, generated videos)
- **Cloudflare Workers**: Serverless execution of CPU-intensive tasks
- **FastAPI Backend**: PPT parsing, orchestration

## Common Tasks

### Adding a New Menu Item
1. Edit `src/data/menuItems.ts`
2. Add object to appropriate array (HEADER_MENU, DASHBOARD_MENU, CONVERSION_STEPS, etc.)
3. Include `id`, `label` (Korean), `path`, and optionally `icon`, `badge`
4. Components automatically reflect changes (no re-rendering needed if using proper imports)

**Example**:
```typescript
export const HEADER_MENU: MenuItem[] = [
  // ... existing items
  {
    id: 'blog',
    label: '블로그',
    path: '/blog',
    icon: 'newspaper',
  },
];
```

### Creating New Navigation Component
1. Import menu data from `src/data/menuItems.ts`
2. Implement with React hooks for state management
3. Use Tailwind CSS for styling (no inline styles)
4. Accept `activeId` prop to highlight current menu item
5. Export component in `src/components/index.ts`

### Debugging Menu Issues
- Check `menuItems.ts` for typos or missing `id` fields (must be unique)
- Verify paths are accessible in Next.js routing (`src/app/` or `src/pages/`)
- Use browser DevTools to inspect active menu state
- Check `useMenu()` hook return values if using menu utilities

## Key Files Reference

- [src/types/menu.ts](src/types/menu.ts) - Menu TypeScript interfaces
- [src/data/menuItems.ts](src/data/menuItems.ts) - All Korean menu content & structure
- [src/config/menu.json](src/config/menu.json) - Alternative JSON-based menu config
- [src/components/Navigation.tsx](src/components/Navigation.tsx) - Header navigation component
- [src/components/DashboardSidebar.tsx](src/components/DashboardSidebar.tsx) - Dashboard sidebar menu
- [src/components/ConversionSteps.tsx](src/components/ConversionSteps.tsx) - 6-step conversion wizard UI
- [src/components/Footer.tsx](src/components/Footer.tsx) - Footer menu & links
- [src/hooks/useMenu.ts](src/hooks/useMenu.ts) - Menu state & utility hooks
- [README_MENU.md](README_MENU.md) - Comprehensive menu system documentation

---

**Last Updated**: February 5, 2026  
**Status**: 🟢 Production Ready for Menus | 🟡 Backend Integration Pending
