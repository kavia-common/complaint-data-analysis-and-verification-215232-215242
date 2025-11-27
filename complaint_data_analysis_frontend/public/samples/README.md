# Sample Complaints CSV

This folder contains a small sample dataset for quick end-to-end testing of the upload and analysis flow.

File:
- complaints.csv

Columns:
- id, date, device, description, severity, customer_id

The data intentionally includes:
- Missing description (row with id 1003)
- Duplicate id (two rows with id 1003)
- Malformed date (2025-13-01)
- Missing customer_id (row with id 1006)
- Missing date (row with id 1007)
- Mixed severities and device types

How to use in the app:
1. Start the frontend (default http://localhost:3000) and ensure the backend is running (default http://localhost:3001).
2. Open the Dashboard ("/").
3. Click “Choose File” and select complaints.csv from public/samples.
   - In most setups you can navigate to: complaint_data_analysis_frontend/public/samples/complaints.csv
4. Click “Upload” to send the file to the backend.
5. Click “Analyze” to run validation checks.
6. View issues and summary in the Analysis Results table. Click a row to see details in the Verification panel and optionally add a verification note.

Expected behaviors to look for:
- Columns detected should include: id, date, device, description, severity, customer_id.
- Issues should flag:
  - Duplicate id (id 1003)
  - Missing description (id 1003 first entry)
  - Malformed date (2025-13-01)
  - Missing customer_id (id 1006)
  - Missing date (id 1007)
- Summary row should list total row_count and columns; completeness metrics may vary by backend implementation.

Troubleshooting:
- If CORS or URL issues occur, verify REACT_APP_API_BASE or REACT_APP_BACKEND_URL in your environment matches the backend address described in ENVIRONMENT.md.
