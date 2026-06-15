# NxtBiz Build Phases

## Phase 1 - Foundation

Status: complete

- Create `client/` and `server/` structure required by `spec.md`
- Establish NxtBiz branding
- Add Express app, health route, middleware, auth, role checks, Socket.IO bootstrap
- Add MongoDB/Mongoose models for core entities
- Add email intelligence, agent orchestration, workflow, and PDF service foundations
- Add Vite/React protected route shell and module pages
- Verify server and client builds

## Phase 2 - Auth And Admin Workflows

- Harden auth refresh behavior on the client
- Add user management forms and role-aware UI controls
- Add production secret validation tests
- Add protected-route API verification scripts

## Phase 3 - CRM And Customer Operations

- Build customer create/update/detail screens
- Add Customer 360 timeline with CRM activities, memory, emails, tickets, meetings, and invoices
- Implement health score calculation from real records

## Phase 4 - Email Intelligence And Agents

- Add email processing UI
- Add agent execution history detail view
- Add queue integration with BullMQ when `REDIS_URL` is configured
- Preserve synchronous fallback when Redis is unavailable

## Phase 5 - Workflows, PDFs, And Reporting

- Build workflow builder UI
- Add invoice and report generation forms
- Add PDF download UX and PDF content verification
- Add workflow execution logs and notifications

## Phase 6 - Realtime Polish And Verification

- Wire Socket.IO cache invalidation per module
- Add loading, error, and empty states across every operational workflow
- Run full verification checklist from `spec.md`
- Remove remaining legacy OpsPilot references if any appear
