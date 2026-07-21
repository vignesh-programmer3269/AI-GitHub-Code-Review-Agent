# API Endpoints Documentation

This document serves as the source of truth for testing and understanding all active API endpoints in the backend. 

*Note: This file must be updated whenever a new API endpoint is created or an existing one is modified.*

---

### 1. Repository Validation
**Endpoint:** \`POST /api/repo/validate\`
**Purpose:** Quickly checks if a GitHub URL is valid, public, and accessible, without doing a deep architectural analysis. Returns basic metadata (stars, description).

**Request Body Schema:**
\`\`\`json
{
  "repoUrl": "https://github.com/owner/repo"  // Type: String, Required: Yes
}
\`\`\`

**Testing via PowerShell:**
\`\`\`powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/repo/validate" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"repoUrl":"https://github.com/expressjs/cors"}'
\`\`\`

**Calling from Frontend (using axios):**
\`\`\`javascript
const response = await api.post("/repo/validate", { 
  repoUrl: "https://github.com/expressjs/cors" 
});
console.log(response.data);
\`\`\`

---

### 2. Complete Repository Analysis (Context Engine + Planning Agent)
**Endpoint:** \`POST /api/repo/analyze\`
**Purpose:** Fetches the full GitHub codebase into memory, generates a \`RepositoryContext\`, asks the AI Planning Agent to evaluate the architecture, and returns the session ID with the completed \`planning\` result. (This is what the UI triggers when you press "Analyze").

**Request Body Schema:**
\`\`\`json
{
  "repoUrl": "https://github.com/owner/repo"  // Type: String, Required: Yes
}
\`\`\`

**Testing via PowerShell:**
\`\`\`powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/repo/analyze" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"repoUrl":"https://github.com/expressjs/cors"}'
\`\`\`

**Calling from Frontend:**
\`\`\`javascript
const response = await api.post("/repo/analyze", { 
  repoUrl: "https://github.com/expressjs/cors" 
});
// response.data contains { success: true, sessionId: "uuid", planning: { ... } }
\`\`\`

---

### 3. LLM Gateway Direct Test
**Endpoint:** \`POST /api/llm/test\`
**Purpose:** Directly tests the \`llm.service\` gateway to verify that your OpenRouter API key and model configurations are working correctly without having to fetch an entire GitHub repo.

**Request Body Schema:**
\`\`\`json
{
  "prompt": "Hello AI!",                    // Type: String, Required: Yes
  "provider": "OpenRouter",                 // Type: String, Required: No (Default is whatever llm.service uses)
  "model": "anthropic/claude-3.5-sonnet",   // Type: String, Required: No (Defaults to the Default agent model)
  "apiKey": "sk-or-v1-..."                  // Type: String, Required: No (Uses process.env if omitted)
}
\`\`\`

**Testing via PowerShell:**
\`\`\`powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/llm/test" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"prompt":"Are you working?", "model":"anthropic/claude-3.5-sonnet"}'
\`\`\`

**Calling from Frontend:**
\`\`\`javascript
const response = await api.post("/llm/test", { 
  prompt: "Write a haiku about code." 
});
\`\`\`

---

### 4. Health Check
**Endpoint:** \`GET /api/health\`
**Purpose:** Validates that the backend server is running and the Node process is healthy. No body required.

**Testing via PowerShell:**
\`\`\`powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get
\`\`\`
