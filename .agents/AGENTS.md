# API Endpoint Documentation Rule

Whenever you create a new API endpoint or modify an existing API endpoint in the backend, you MUST update `backend/API_CALLS_INFO.md` to reflect the changes.

The documentation for each endpoint MUST include:
- The HTTP Method and route
- A description of the endpoint's purpose
- The request body schema (specifying types and if they are mandatory/optional)
- An example of how to test it using a PowerShell `Invoke-RestMethod` command
- An example of how to call it from the frontend using `axios`
