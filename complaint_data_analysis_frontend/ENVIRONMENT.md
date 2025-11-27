# Frontend Environment and Routes

- The API base URL is read from REACT_APP_API_BASE; if not set, it falls back to REACT_APP_BACKEND_URL.
- Health page calls backend root `/` and falls back to `/health`.

Routes:
- `/` Dashboard with:
  - UploadPanel (CSV upload and analyze)
  - ResultsTable (sortable/filterable)
  - VerificationSidebar (mark complete/correct with note)
- `/health` Health status viewer.
