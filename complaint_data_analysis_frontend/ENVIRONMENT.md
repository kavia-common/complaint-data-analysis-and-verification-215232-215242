# Frontend Environment and Routes

- The API base URL is read from REACT_APP_API_BASE; if not set, it falls back to REACT_APP_BACKEND_URL.
- Default local dev backend URL: http://localhost:3001
- Health page calls backend root `/` and falls back to `/health`.

CORS:
- The frontend runs on port 3000 and backend on 3001. Ensure backend CORS allows origin http://localhost:3000 and the following endpoints:
  - POST /api/complaints/upload (multipart/form-data)
  - POST /api/complaints/analyze (x-www-form-urlencoded)
  - GET  /api/complaints/report/{analysis_id}
  - GET  / and optionally /health

Routes:
- `/` Dashboard with:
  - UploadPanel (CSV upload and analyze)
  - ResultsTable (sortable/filterable)
  - VerificationSidebar (mark complete/correct with note)
- `/health` Health status viewer.
