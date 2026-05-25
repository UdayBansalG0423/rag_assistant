# ChatRAG System Contract Map

## Scope Freeze

Do not rewrite these areas in this pass:

- Landing page
- Signup page
- Sign out behavior
- Document vault / document manager pages
- Global navbar / top-level shell chrome

Refactor only the chat workspace integration and left-side panel behavior:

- Left sidebar session list
- Chat thread rendering
- Async processing feedback
- Session switching sync
- Backend contract alignment

## 1. Backend API Contracts

### Auth

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| POST | `/auth/signup` | `{ "name": "...", "email": "...", "password": "..." }` | `{ "message": "...", "user_id": "...", "email": "...", "name": "..." }` |
| POST | `/auth/login` | `{ "email": "...", "password": "..." }` | `{ "access_token": "...", "refresh_token": "...", "user_id": "...", "email": "...", "token_type": "bearer" }` |
| GET | `/me` | Bearer token in `Authorization` header | `{ "id": "...", "email": "...", "name": "..." }` |
| POST | `/auth/refresh` | `refresh_token_str` as a query parameter in the current implementation | `{ "access_token": "...", "refresh_token": "...", "token_type": "bearer" }` |
| POST | `/auth/logout` | Bearer token in `Authorization` header | `{ "message": "Logged out successfully" }` |

Notes:

- Logout is currently stateless on the backend.
- Refresh is not using a JSON body today; it is declared as a plain parameter.

### Documents

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| GET | `/documents` | Bearer token | `{ "documents": [ ... ] }` |
| POST | `/upload` | `multipart/form-data` with `file` | `{ "message": "...", "id": "...", "user_id": "...", "file_name": "...", "storage_path": "...", "status": "processing", "progress": 0, "created_at": "...", "error": null }` |
| GET | `/upload/status/{document_id}` | Bearer token | File-backed progress JSON, shape depends on worker output |
| GET | `/upload/status_public/{document_id}` | `user` query parameter optional | File-backed progress JSON, unauthenticated test helper |

Important:

- There is no active DELETE document endpoint mounted in the current router set.

### Chat

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| POST | `/chat/session` | Bearer token only | `{ "id": "...", "user_id": "...", "title": "...", "created_at": "...", "updated_at": "..." }` |
| GET | `/chat/sessions` | Bearer token only | `{ "sessions": [ ... ] }` |
| POST | `/chat/message` | `{ "session_id": "...", "user_query": "...", "assistant_response": "...", "sources": [], "latency": 1.2, "title": "..." }` | `{ "id": "...", "session_id": "...", "user_id": "...", "user_query": "...", "assistant_response": "...", "sources": [], "latency": 1.2, "created_at": "..." }` |
| GET | `/chat/{session_id}` | Bearer token only | `{ "session": { ... }, "messages": [ ... ] }` |

Important:

- There is no dedicated streaming chat endpoint today.
- Message generation is separate from message persistence.
- Actual answer generation happens through `/ask`, then the result is saved through `/chat/message`.

### RAG Query

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| GET | `/ask?q=...` | `q` query parameter + Bearer token | `{ "answer": "...", "sources": [], "latency": 1.2 }` |

### Health

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| GET | `/health` | none | `{"status":"healthy"}` or `{"status":"unhealthy", "failed_components": [...], "services": {...}}` |

### Root

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| GET | `/` | none | Serves frontend static index when available, otherwise `{ "message": "NeuralDoc RAG API is running" }` |

## 2. Frontend State Flow

The frontend is currently a hybrid state model, not a single-state architecture.

- `AuthProvider` owns auth session state in React context.
- `useAppStore` uses Zustand for chrome-level UI state.
- `Dashboard.tsx` owns chat-local state with `useState`.
- `useDocumentPolling` owns document refresh polling locally.
- `localStorage` stores auth tokens and user id.

Current state owners:

- Auth context: `frontend/src/providers/AuthProvider.tsx`
- Global UI chrome: `frontend/src/store/useAppStore.ts`
 - Chat thread state: `frontend/src/features/chat/` (store, hooks, components)
- Upload progress polling: `frontend/src/hooks/use-document-polling.ts`
- Token persistence: `frontend/src/lib/auth.ts`

This is why the UI feels split: chat state is not owned by one single domain store.

## 3. Current Chat Flow

Current send flow in `frontend/src/pages/Chat.tsx`:

1. User types into the input.
2. `handleSend()` trims the input and exits if empty or already sending.
3. If no session exists, frontend creates one with `POST /chat/session`.
4. The user message is appended locally to `messages`.
5. `sending` is set to `true`.
6. Frontend calls `GET /ask?q=...` with auth headers.
7. Backend returns `{ answer, sources, latency }`.
8. Frontend saves the turn through `POST /chat/message`.
9. Frontend refreshes session list.
10. Frontend appends the assistant message locally.
11. `sending` is cleared and focus returns to the textarea.

Important mismatch:

- The generation request and persistence request are separate.
- The current system is request/response, not streaming.
- Session state is tracked in more than one place, so switching is easy to desync.

## 4. Current Folder Structure

Relevant frontend structure today:

- `frontend/src/pages`
  - `LandingPage.tsx`
  - `LoginPage.tsx`
  - `SignupPage.tsx`
  - `Dashboard.tsx`
  - `Chat.tsx`
  - `KnowledgeBase.tsx`
  - `Settings.tsx`
  - `Profile.tsx`
- `frontend/src/components`
  - `layout/`
  - `chat/`
  - `modals/`
  - `ui/`
  - document and upload widgets
- `frontend/src/services`
  - `auth.service.ts`
  - `chat.service.ts`
  - `document.service.ts`
  - `rag.service.ts`
- `frontend/src/hooks`
  - `use-auth.ts`
  - `use-document-polling.ts`
- `frontend/src/providers`
  - `AuthProvider.tsx`
- `frontend/src/store`
  - `useAppStore.ts`
- `frontend/src/lib`
  - low-level API and token helpers

Important structural note:

- Chat implementation is consolidated under `frontend/src/features/chat/*` (preferred single source of truth).

## 5. Current Response Shapes

### Successful chat response

```json
{
  "answer": "The Cognizant placement hiring process consists of the following steps...",
  "sources": ["b0229ffc-d5bd-46b4-9fab-be382ec17ccf", "5804a837-eceb-40f5-acac-7fd6e5ab5672"],
  "latency": 15.42
}
```

### Document list response

```json
{
  "documents": [
    {
      "id": "...",
      "user_id": "...",
      "file_name": "file.pdf",
      "storage_path": "...",
      "status": "processing",
      "progress": 42,
      "created_at": "2026-05-21T...",
      "error": null
    }
  ]
}
```

### Session response

```json
{
  "id": "...",
  "user_id": "...",
  "title": "My first question",
  "created_at": "2026-05-21T...",
  "updated_at": "2026-05-21T..."
}
```

### Chat history response

```json
{
  "session": {
    "id": "...",
    "user_id": "...",
    "title": "..."
  },
  "messages": [
    {
      "id": "...",
      "role": "user",
      "content": "Tell me cognizant placement hiring process",
      "sources": [],
      "latency": null,
      "timestamp": "2026-05-21T..."
    },
    {
      "id": "...",
      "role": "assistant",
      "content": "The Cognizant placement hiring process consists of...",
      "sources": ["..."],
      "latency": 15.42,
      "timestamp": "2026-05-21T..."
    }
  ]
}
```

## 6. Current Problems List

1. Chat is split across two implementations, so state and rendering are inconsistent.
2. Route navigation and shell navigation are not aligned with actual mounted routes.
3. The app does not use one unified chat store for sessions, messages, and pending requests.
4. Assistant answers are generated by `/ask` and stored separately, which makes async UX harder to reason about.
5. There is no streaming token path, so the app can only show request-level progress.
6. Session switching can desync because `currentChat`, `activeSessionId`, and route params are not fully unified.
7. Document progress is polled, but the results are not centralized into the same domain state as chat.
8. `/auth/refresh` and `/auth/logout` exist, but frontend usage is minimal and not centrally orchestrated.

## 7. What To Keep vs Rebuild

Keep:

- Landing page
- Signup and login screens
- Sign out behavior
- Document vault and upload surfaces
- Navbar and top-level workspace shell

Rebuild or refactor:

- Chat workspace thread rendering
- Left-side session list behavior
- Sending flow and pending state visualization
- Session switching sync
- Backend contract adapter layer
- Message formatting and source rendering

## 8. Screen Flow

Observed flow:

1. Landing
2. Login or signup
3. Dashboard / workspace shell
4. Document upload / vault
5. Chat workspace
6. Session selection or new session creation
7. Query submission
8. Answer rendering

Current route reality:

- `/` -> `LandingPage`
- `/login` -> `LoginPage`
- `/signup` -> `SignupPage`
- `/dashboard` -> `Dashboard`
- `/dashboard/chat/:id` -> `Dashboard`
- `/settings/*` -> `Settings`

Important note:

- The shell navigation advertises routes like `/knowledge-base`, `/chat`, and `/profile`, but those routes are not currently mounted in `App.tsx`.

## 9. Suggestions

1. Pick one chat owner and delete the duplicate flow.
2. Treat `/ask` as the generation contract and `/chat/message` as persistence only.
3. Move session and message state into one domain store or one query cache layer.
4. Normalize backend field names in one adapter so the UI never depends on mixed shapes.
5. Keep the visual system stable and only change the chat workspace mechanics.
6. Add a visible pending assistant bubble for every send, even before streaming exists.
7. If streaming is added later, make it an incremental upgrade, not a rewrite.
