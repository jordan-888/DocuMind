# Documind App – Improvement Suggestions

## High Priority Fixes
- Fix chat history race condition in `ChatInterface`.
- Avoid storing auth tokens in `localStorage`; use HttpOnly cookies.
- Replace unsupported `loading` prop on MUI `Button` with `LoadingButton`.

## UX Improvements
- Add ARIA labels and focus management in chat.
- Improve accessibility for `DocumentUpload`.
- Add alt text and roles to interactive UI elements.

## Performance
- Virtualize long lists in chat and documents.
- Debounce search and summarize inputs.
- Memoize heavy computations.

## Security
- Enforce backend file validation.
- Apply rate limiting to chat/search endpoints.
- Hide internal model metadata if not required.

## Bugs & Defensive Coding
- Guard `doc.user_id` in `DocumentsList`.
- Replace simulated upload progress with real progress.
- Improve Supabase auth error handling.

## Testing & CI
- Add unit tests for chat, upload, and auth flows.
- Add E2E tests for full document pipeline.
- Add ESLint, Prettier, and TypeScript checks in CI.

## API & Error Handling
- Strengthen axios response typing.
- Gracefully handle malformed API responses.

## Small Improvements
- Add keyboard shortcut to focus chat input.
- Add copy-citation button.
- Use server-provided ingestion progress.
