# Backend API Specification: Support Tickets

## Context

- **Backend Base URL:** `{API_BASE_URL}/api/v1/` (set via env variable)
- **Auth:** All requests come with `Authorization: Bearer <supabase_jwt>` header
- **User identification:** Extract `user_id` from the JWT token (same as existing endpoints)
- **Response format:** Match existing pattern → `{ "data": {...} }` or `{ "data": [...] }`
- **Framework:** Your existing Python backend (FastAPI/Flask)

---

## Authentication & User Extraction

All requests from the frontend include a Supabase JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Extracting User Data from JWT

The JWT token contains user information in its payload. You need to:

1. **Verify the JWT signature** using your Supabase JWT secret (from Supabase dashboard)
2. **Extract the payload** after verification

**JWT Payload Structure:**
```json
{
  "sub": "uuid-of-the-user",           // This is the user_id
  "email": "user@example.com",
  "aud": "authenticated",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Python Implementation Example (FastAPI)

```python
import jwt
from fastapi import HTTPException, Header
from typing import Optional

# Get this from your Supabase project settings under API > JWT Secret
SUPABASE_JWT_SECRET = "your-supabase-jwt-secret"

def get_current_user(authorization: str = Header(...)):
    """
    Extract and verify user from Supabase JWT token
    """
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = authorization.replace("Bearer ", "")
        
        # Verify and decode JWT
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        # Extract user info
        user_id = payload.get("sub")
        user_email = payload.get("email")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        return {
            "user_id": user_id,
            "email": user_email
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Usage in your endpoints:
@app.post("/support/tickets")
async def create_ticket(
    ticket: TicketCreate,
    current_user: dict = Depends(get_current_user)
):
    # Access user_id and email from current_user
    user_id = current_user["user_id"]
    user_email = current_user["email"]
    
    # Create ticket with user info
    new_ticket = {
        "user_id": user_id,
        "user_email": user_email,
        "subject": ticket.subject,
        "description": ticket.description,
        # ... rest of fields
    }
    
    # Insert into database
    # ...
```

### Where to Find Your JWT Secret

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to **JWT Settings**
4. Copy the **JWT Secret** value
5. Add it to your backend environment variables

**Important:** This is the same JWT verification logic you should already be using for your existing `/metrics` and `/logs` endpoints.

---

## Database Table: `support_tickets`

```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,                         -- from JWT token
    user_email VARCHAR(255) NOT NULL,              -- from JWT token
    
    -- Ticket content
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,                 -- 'bug' | 'feature_request' | 'question' | 'account_issue'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high'
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'open',    -- 'open' | 'in_progress' | 'resolved' | 'closed'
    
    -- Admin response
    admin_reply TEXT,                               -- reply from Tixa team
    admin_replied_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
```

---

## API Endpoints

### 1. `POST /support/tickets` — Create a ticket

**Request:**
```json
{
    "subject": "API key not working",
    "description": "I generated a new API key but getting 401 errors when...",
    "category": "bug",
    "priority": "high"
}
```

**Validation:**

| Field         | Rules                                                            |
| ------------- | ---------------------------------------------------------------- |
| `subject`     | Required, string, 5-255 chars                                    |
| `description` | Required, string, 10-5000 chars                                  |
| `category`    | Required, one of: `bug`, `feature_request`, `question`, `account_issue` |
| `priority`    | Optional (default: `medium`), one of: `low`, `medium`, `high`   |

**Response (201):**
```json
{
    "data": {
        "id": "uuid-here",
        "subject": "API key not working",
        "description": "I generated a new API key but getting 401 errors when...",
        "category": "bug",
        "priority": "high",
        "status": "open",
        "admin_reply": null,
        "admin_replied_at": null,
        "created_at": "2026-02-13T10:30:00Z",
        "updated_at": "2026-02-13T10:30:00Z"
    }
}
```

**Error (422):**
```json
{
    "error": "Validation failed",
    "details": {
        "subject": "Subject must be between 5 and 255 characters"
    }
}
```

---

### 2. `GET /support/tickets` — List user's tickets

Returns only tickets belonging to the authenticated user (filter by `user_id` from JWT).

**Query Params:**

| Param       | Type   | Default | Description                                              |
| ----------- | ------ | ------- | -------------------------------------------------------- |
| `page`      | int    | 1       | Page number                                              |
| `page_size` | int    | 20      | Items per page (max 50)                                  |
| `status`    | string | (all)   | Filter by status: `open`, `in_progress`, `resolved`, `closed` |

**Response (200):**
```json
{
    "data": {
        "items": [
            {
                "id": "uuid-1",
                "subject": "API key not working",
                "category": "bug",
                "priority": "high",
                "status": "open",
                "admin_reply": null,
                "created_at": "2026-02-13T10:30:00Z",
                "updated_at": "2026-02-13T10:30:00Z"
            },
            {
                "id": "uuid-2",
                "subject": "How to integrate SDK?",
                "category": "question",
                "priority": "medium",
                "status": "resolved",
                "admin_reply": "You can follow our docs at...",
                "created_at": "2026-02-10T08:00:00Z",
                "updated_at": "2026-02-11T14:00:00Z"
            }
        ],
        "total": 2,
        "page": 1,
        "page_size": 20
    }
}
```

---

### 3. `GET /support/tickets/:id` — Get ticket detail

Returns full ticket with description. Only if `user_id` matches.

**Response (200):**
```json
{
    "data": {
        "id": "uuid-1",
        "subject": "API key not working",
        "description": "I generated a new API key but getting 401 errors when...",
        "category": "bug",
        "priority": "high",
        "status": "in_progress",
        "admin_reply": "We're looking into this. Can you share your client_id?",
        "admin_replied_at": "2026-02-13T12:00:00Z",
        "created_at": "2026-02-13T10:30:00Z",
        "updated_at": "2026-02-13T12:00:00Z"
    }
}
```

**Error (404):**
```json
{
    "error": "Ticket not found"
}
```

---

### 4. `PATCH /support/tickets/:id` — Update ticket (user can add more info or close)

Users can only update their own tickets. They can add extra description or close the ticket.

**Request:**
```json
{
    "additional_info": "Here's my client_id: abc123",
    "status": "closed"
}
```

**Validation:**

| Field             | Rules                                                        |
| ----------------- | ------------------------------------------------------------ |
| `additional_info` | Optional, string, max 5000 chars. Appends to description     |
| `status`          | Optional, users can only set to `closed`                     |

**Response (200):**
```json
{
    "data": {
        "id": "uuid-1",
        "subject": "API key not working",
        "description": "Original text...\n\n---\nAdditional info (Feb 13):\nHere's my client_id: abc123",
        "status": "closed",
        "updated_at": "2026-02-13T15:00:00Z"
    }
}
```

---

### 5. (Admin Only) `PATCH /support/admin/tickets/:id` — Admin reply

For internal use by Tixa team (separate admin auth or role check).

**Request:**
```json
{
    "admin_reply": "We've fixed the issue. Please regenerate your API key.",
    "status": "resolved"
}
```

---

## Enum Values Summary

```python
# Category
TICKET_CATEGORIES = ["bug", "feature_request", "question", "account_issue"]

# Priority  
TICKET_PRIORITIES = ["low", "medium", "high"]

# Status
TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"]
```

---

## Frontend Call Flow

```
Frontend Component
    ↓
services/supportApi.ts
    ↓
/api/proxy/support/tickets   ← Next.js proxy (already exists)
    ↓
Backend /support/tickets      ← These endpoints need to be built
    ↓
PostgreSQL (support_tickets table)
```

The `/api/proxy` prefix is handled by the Next.js proxy — backend only sees `/support/tickets`.

```
POST   /api/proxy/support/tickets          → Backend receives: POST   /support/tickets
GET    /api/proxy/support/tickets          → Backend receives: GET    /support/tickets
GET    /api/proxy/support/tickets/:id      → Backend receives: GET    /support/tickets/:id
PATCH  /api/proxy/support/tickets/:id      → Backend receives: PATCH  /support/tickets/:id
```
