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
- **AI Engines**: Ollama (Llama 3.1:8b - local LLM), Google Cloud TTS, FFmpeg/Remotion
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
   - Ollama (Llama 3.1:8b) for IT expert persona scripting
   - Context-aware narration generation
   - Local LLM - no external API dependencies

5. **Audio Synthesis** (Google Cloud TTS)
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
  NEXT_PUBLIC_FASTAPI_URL=http://localhost:8001
  FASTAPI_PORT=8001
  LOCAL_LLM_PROVIDER=ollama
  OLLAMA_URL=http://localhost:11434
  OLLAMA_MODEL=llama3.1:8b
  FFMPEG_PATH=C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe
  ```

## Code Patterns & Conventions

### ⚠️ CRITICAL: Windows Encoding Rules (CP949)

**NEVER use emojis or special Unicode characters in Python backend code!**

Windows uses CP949 encoding which **cannot handle emojis**. Using emojis in `print()` statements will cause:
```
UnicodeEncodeError: 'cp949' codec can't encode character '\U0001f504'
```

**Rules:**
1. ✅ **USE**: ASCII-only characters in all `print()` statements
2. ❌ **NEVER USE**: Emojis (✅, ❌, ⚠️, 🔄, 📄, 🎬, etc.) in backend logs
3. ✅ **ALLOWED**: Emojis in GUI widgets (Tkinter), frontend React components
4. ✅ **LOG FORMAT**: `[HH:MM:SS] [LEVEL] [STEP] message`

**Emoji → ASCII Conversion:**
- `✅` → `OK -`
- `❌` → `ERROR -`
- `⚠️` → `WARN -`
- `🔄` → `INFO -`

**Example:**
```python
# ❌ WRONG - Will crash on Windows!
print(f"[{timestamp}] [MAJOR] [OLLAMA] ✅ Ollama started successfully")

# ✅ CORRECT - ASCII only
print(f"[{timestamp}] [MAJOR] [OLLAMA] OK - Ollama started successfully")
```

**Full documentation**: [WINDOWS_ENCODING_RULES.md](../WINDOWS_ENCODING_RULES.md)

**Before writing ANY backend code:**
1. Check if it outputs to stdout/stderr
2. Verify NO emojis are used
3. Use ASCII characters only

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

- **Ollama API**: `http://localhost:11434/api/generate` - generates IT expert narration scripts (local LLM)
- **Google Cloud TTS**: Voice synthesis - multiple Korean voice options
- **FFmpeg**: Local video rendering with slides + audio synchronization
- **Cloudflare R2**: Asset storage (PPT files, generated videos)
- **Cloudflare Workers**: Serverless execution of CPU-intensive tasks
- **FastAPI Backend**: PPT parsing, orchestration, checkpoint management

## ⚠️ Common Mistakes to Avoid

### 1. Windows Encoding Errors (MOST COMMON!)
❌ **NEVER** use emojis in backend Python code:
```python
print(f"[{timestamp}] [MAJOR] [OLLAMA] ✅ Success")  # Will crash!
```
✅ **ALWAYS** use ASCII only:
```python
print(f"[{timestamp}] [MAJOR] [OLLAMA] OK - Success")  # Safe
```
**See**: [WINDOWS_ENCODING_RULES.md](../WINDOWS_ENCODING_RULES.md)

### 2. Wrong Ollama Model Name
❌ **WRONG**:
```
OLLAMA_MODEL=llama3.1  # Missing version suffix - 404 error!
```
✅ **CORRECT**:
```
OLLAMA_MODEL=llama3.1:8b  # Include :8b suffix
```
**Before configuring**: Run `ollama list` to verify exact model name

### 3. Wrong Ollama API Endpoint
❌ **WRONG**: `/api/chat` (OpenAI-style endpoint)
✅ **CORRECT**: `/api/generate` (Ollama official endpoint)

**Code Example**:
```python
# Correct implementation
url = f"{ollama_url}/api/generate"  # Not /api/chat
payload = {
    "model": "llama3.1:8b",
    "prompt": "...",  # Not messages array
    "stream": False
}
response = requests.post(url, json=payload)
content = response.json().get("response")  # Not message.content
```

### 4. Environment Variables Not Loading
**Issue**: `.env.local` exists but backend uses wrong values

✅ **Fix in backend/main.py**:
```python
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env.local"
load_dotenv(dotenv_path=str(ENV_FILE))  # Explicit path required!
```

### 5. FFmpeg Path Issues
❌ **WRONG**: `FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe` (default assumption)
✅ **CORRECT**: Verify actual installation path first:
```powershell
where ffmpeg
# or check manual installation
```
Then set in `.env.local`:
```
FFMPEG_PATH=C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe  # Actual path
```

### Verification Checklist Before Coding:
- [ ] `ollama list` → Verify model name includes `:8b`
- [ ] Check `.env.local` for all required variables
- [ ] NO emojis in any `print()` statements
- [ ] Ollama API uses `/api/generate` endpoint
- [ ] FFmpeg path exists at configured location

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

**Last Updated**: February 11, 2026  
**Status**: 🟢 Production Ready for Menus | 🟡 Backend Integration Pending

⚠️ **CRITICAL REMINDER**: Always follow [Windows Encoding Rules](../WINDOWS_ENCODING_RULES.md) - NO emojis in backend code!
