# Peblo Notes QA Checklist

## AUTH
- [ ] Signup with new email works
- [ ] Login works
- [ ] Wrong password shows error message
- [ ] Logout works
- [ ] Visiting `/notes` without login redirects to `/login`

## NOTES
- [ ] Create new note works
- [ ] Title auto-saves after 1 second
- [ ] Content auto-saves after 1 second
- [ ] "Saved" indicator appears and disappears
- [ ] Archive note removes it from list
- [ ] Archived section shows at bottom
- [ ] Restore note works

## AI
- [ ] Generate summary works (needs `ANTHROPIC_API_KEY`)
- [ ] Summary panel shows with action items
- [ ] Suggested title chip appears
- [ ] Click suggested title → title updates
- [ ] `aiUsageCount` increments (check dashboard)

## SEARCH & FILTER
- [ ] Search bar filters notes in real time
- [ ] Tag chips filter correctly
- [ ] Category filter works
- [ ] Clear search shows all notes

## SHARE
- [ ] Share button generates a link
- [ ] Opening link in incognito works (no login needed)
- [ ] Shared note shows content correctly

## DASHBOARD
- [ ] All 4 stat cards show correct numbers
- [ ] Top tags render with actual tag names (not just `#`)
- [ ] Recent notes list shows 5 notes
- [ ] Counter animation plays on load

## DARK MODE
- [ ] Toggle works
- [ ] Persists on page refresh
