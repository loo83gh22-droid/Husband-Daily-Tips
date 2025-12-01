# Code Statistics by File Type

## Actual Line Counts

### TypeScript (TS) Files
- **lib directory**: 4,160 lines across 21 files
- **Total TS files**: ~103 files (includes app/api routes)
- **Estimated TS lines**: ~8,000-10,000 lines

### TypeScript React (TSX) Files  
- **components directory**: 13,454 lines across 70 files
- **app directory**: 21,178 lines across 114 files
- **Total TSX lines**: **34,632 lines across 184 files**

### SQL Migration Files
- **supabase/migrations**: **7,553 lines across 93 files**

### Summary by File Type

| File Type | Lines of Code | Number of Files |
|-----------|---------------|-----------------|
| **TSX** (React Components) | **34,632** | **184** |
| **TS** (TypeScript) | **~8,000-10,000** | **~103** |
| **SQL** (Migrations) | **7,553** | **93** |
| **JS** (JavaScript) | ~500-1,000 | ~10-15 |
| **CSS** | ~100-200 | ~2-3 |
| **TOTAL** | **~50,000-53,000** | **~390-395** |

## Breakdown by Directory

### Components (React Components)
- **13,454 lines** across **70 files**
- Average: ~192 lines per file
- Largest: `DailyTipCard.tsx` (1,040 lines)
- Largest: `how-to-guides/[slug]/page.tsx` (4,000 lines)

### App Directory (Pages & API Routes)
- **21,178 lines** across **114 files**
- Includes:
  - Dashboard pages
  - API routes (~70+ files)
  - Blog pages
  - Legal pages

### Lib Directory (Utilities)
- **4,160 lines** across **21 files**
- Key files:
  - `action-selection.ts`: 623 lines
  - `email.ts`: 620 lines
  - `badges.ts`: 487 lines
  - `action-guide-mapping.ts`: 387 lines

### Database Migrations
- **7,553 lines** across **93 files**
- Average: ~81 lines per migration
- Largest: `028_enable_row_level_security.sql` (426 lines)
- Largest: `how-to-guides/[slug]/page.tsx` (4,000 lines - contains guide data)

## Notes

- Excludes: `node_modules`, `.next`, `dist`, `build`, `.git`
- The `app/dashboard/how-to-guides/[slug]/page.tsx` file contains 4,000 lines of guide data (should be refactored to separate data file)
- Most code is TypeScript/TSX (React/Next.js)
- Database migrations represent significant schema evolution

