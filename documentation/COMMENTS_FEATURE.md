# Log Comments Feature

A feedback and communication system for workflow logs, enabling clients to report issues and internal teams to respond.

---

## Overview

This feature allows:
- **Clients** to add comments on automation logs to report bugs, errors, or unexpected behavior
- **Internal Team** (support/developers) to reply to client comments
- **Status Tracking** to manage the lifecycle of reported issues (open → pending → resolved → closed)

---

## Database Schema

### `log_comments` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `log_id` | UUID | Foreign key to `workflow_logs` |
| `parent_id` | UUID | Self-reference for replies (NULL = top-level comment) |
| `user_id` | VARCHAR(255) | ID of the user who created the comment |
| `user_name` | VARCHAR(255) | Display name of the user |
| `user_type` | VARCHAR(50) | `client` or `internal` |
| `comment_text` | TEXT | The comment content |
| `status` | VARCHAR(50) | `open`, `pending`, `resolved`, `closed` |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | When last updated |

### Relationships

```
workflow_logs (1) ──────< log_comments (many)
                              │
                              └──< log_comments (replies)
```

---

## API Endpoints

Base URL: `/api/v1`

### Authentication

All endpoints require API key authentication:
```
Header: X-API-Key: sk_live_xxxxx
```

---

### 1. Create Comment

**POST** `/logs/{log_id}/comments`

Creates a new top-level comment on a log entry.

**Request Body:**
```json
{
  "user_id": "client-user-123",
  "user_name": "John from ProductLabs",
  "user_type": "client",
  "comment_text": "The automation clicked the wrong button on step 3",
  "status": "open"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | Unique identifier of the user |
| `user_name` | string | No | Display name for UI |
| `user_type` | string | Yes | `client` or `internal` |
| `comment_text` | string | Yes | The comment content |
| `status` | string | No | Default: `open`. Options: `open`, `pending`, `resolved`, `closed` |

**Response (201):**
```json
{
  "message": "Comment created successfully",
  "data": {
    "id": "eda23be3-4280-4556-a141-49b9633e5e2f",
    "log_id": "02ef51c5-d60f-4d76-a244-c5c2409a6b52",
    "parent_id": null,
    "user_id": "client-user-123",
    "user_name": "John from ProductLabs",
    "user_type": "client",
    "comment_text": "The automation clicked the wrong button on step 3",
    "status": "open",
    "created_at": "2026-02-11T19:38:45.008694+00:00",
    "updated_at": "2026-02-11T19:38:45.008694+00:00"
  }
}
```

---

### 2. Create Reply

**POST** `/comments/{comment_id}/replies`

Creates a reply to an existing comment.

**Request Body:**
```json
{
  "user_id": "support-agent-1",
  "user_name": "Sarah (Support)",
  "user_type": "internal",
  "comment_text": "Thanks for reporting! We are investigating this issue."
}
```

**Response (201):**
```json
{
  "message": "Reply created successfully",
  "data": {
    "id": "2f194630-e274-44c0-af45-7c8675dc7c17",
    "log_id": "02ef51c5-d60f-4d76-a244-c5c2409a6b52",
    "parent_id": "eda23be3-4280-4556-a141-49b9633e5e2f",
    "user_id": "support-agent-1",
    "user_name": "Sarah (Support)",
    "user_type": "internal",
    "comment_text": "Thanks for reporting! We are investigating this issue.",
    "status": "open",
    "created_at": "2026-02-11T19:39:04.995601+00:00",
    "updated_at": "2026-02-11T19:39:04.995601+00:00"
  }
}
```

---

### 3. Get Comments for a Log

**GET** `/logs/{log_id}/comments`

Returns all comments for a specific log with nested replies.

**Response (200):**
```json
{
  "data": [
    {
      "id": "eda23be3-4280-4556-a141-49b9633e5e2f",
      "log_id": "02ef51c5-d60f-4d76-a244-c5c2409a6b52",
      "parent_id": null,
      "user_id": "client-user-123",
      "user_name": "John from ProductLabs",
      "user_type": "client",
      "comment_text": "The automation clicked the wrong button on step 3",
      "status": "open",
      "created_at": "2026-02-11T19:38:45.008694+00:00",
      "updated_at": "2026-02-11T19:38:45.008694+00:00",
      "replies": [
        {
          "id": "2f194630-e274-44c0-af45-7c8675dc7c17",
          "log_id": "02ef51c5-d60f-4d76-a244-c5c2409a6b52",
          "parent_id": "eda23be3-4280-4556-a141-49b9633e5e2f",
          "user_id": "support-agent-1",
          "user_name": "Sarah (Support)",
          "user_type": "internal",
          "comment_text": "Thanks for reporting! We are investigating this issue.",
          "status": "open",
          "created_at": "2026-02-11T19:39:04.995601+00:00",
          "updated_at": "2026-02-11T19:39:04.995601+00:00"
        }
      ]
    }
  ],
  "count": 1
}
```

---

### 4. Get All Comments (Dashboard)

**GET** `/comments`

Returns all comments with optional filters. Useful for internal team dashboard.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `open`, `pending`, `resolved`, `closed` |
| `user_type` | string | Filter by user type: `client`, `internal` |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 50, max: 100) |

**Example:** `GET /comments?status=open&page=1&page_size=10`

**Response (200):**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 5,
    "pages": 1
  },
  "filters": {
    "status": "open",
    "user_type": null
  }
}
```

---

### 5. Get Single Comment

**GET** `/comments/{comment_id}`

Returns a single comment with its replies.

**Response (200):**
```json
{
  "data": {
    "id": "eda23be3-4280-4556-a141-49b9633e5e2f",
    "log_id": "02ef51c5-d60f-4d76-a244-c5c2409a6b52",
    "parent_id": null,
    "user_id": "client-user-123",
    "user_name": "John from ProductLabs",
    "user_type": "client",
    "comment_text": "The automation clicked the wrong button on step 3",
    "status": "pending",
    "created_at": "2026-02-11T19:38:45.008694+00:00",
    "updated_at": "2026-02-11T19:39:48.674520+00:00",
    "replies": [...]
  }
}
```

---

### 6. Update Comment

**PUT** `/comments/{comment_id}`

Update a comment's text and/or status.

**Request Body:**
```json
{
  "comment_text": "Updated comment content",
  "status": "resolved"
}
```

Both fields are optional, but at least one must be provided.

**Response (200):**
```json
{
  "message": "Comment updated successfully",
  "data": {...}
}
```

---

### 7. Delete Comment

**DELETE** `/comments/{comment_id}`

Permanently deletes a comment and all its replies.

**Response (200):**
```json
{
  "message": "Comment deleted successfully",
  "deleted_id": "eda23be3-4280-4556-a141-49b9633e5e2f"
}
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input (e.g., invalid `user_type` or `status`) |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Not Found - Comment or log not found |
| 500 | Internal Server Error |

**Example Error:**
```json
{
  "detail": "user_type must be one of ['client', 'internal']"
}
```

---

## Frontend Integration Guide

### Recommended UI Components

#### 1. Log Detail Page - Comments Section

```
┌─────────────────────────────────────────────────────────────┐
│ Log: TICKET-123 - Automation Error                          │
│ Status: ERROR | Category: ui_issue                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💬 Comments (2)                          [+ Add Comment]    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤 John from ProductLabs (Client)     🏷️ Open          │ │
│ │ Feb 11, 2026 at 3:38 PM                                 │ │
│ │                                                         │ │
│ │ The automation clicked the wrong button on step 3.      │ │
│ │ This caused the order to fail completely.               │ │
│ │                                                         │ │
│ │ [Reply] [Edit] [Delete]           [Change Status ▼]     │ │
│ │                                                         │ │
│ │   ┌─────────────────────────────────────────────────┐   │ │
│ │   │ 👷 Sarah (Support) (Internal)                   │   │ │
│ │   │ Feb 11, 2026 at 3:39 PM                         │   │ │
│ │   │                                                 │   │ │
│ │   │ Thanks for reporting! We are investigating.    │   │ │
│ │   │                                                 │   │ │
│ │   │ [Edit] [Delete]                                 │   │ │
│ │   └─────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Comments Dashboard (Internal Team)

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Issue Tracker                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Filters:                                                    │
│ [Status: All ▼] [User Type: All ▼] [Search...        🔍]   │
│                                                             │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ● Open (3)  ○ Pending (2)  ○ Resolved (5)  ○ Closed (10)││
│ └──────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌──────┬──────────────┬──────────────┬────────┬───────────┐│
│ │Status│ Comment      │ Log          │ User   │ Date      ││
│ ├──────┼──────────────┼──────────────┼────────┼───────────┤│
│ │ 🟡   │ Wrong button │ TICKET-123   │ John   │ Feb 11    ││
│ │ 🟡   │ Timeout err  │ TICKET-456   │ Alice  │ Feb 10    ││
│ │ 🟢   │ Fixed now    │ TICKET-789   │ Bob    │ Feb 09    ││
│ └──────┴──────────────┴──────────────┴────────┴───────────┘│
│                                                             │
│ Page 1 of 3  [< Prev] [Next >]                              │
└─────────────────────────────────────────────────────────────┘
```

---

### React Component Examples

#### 1. Comment Card Component

```tsx
interface Comment {
  id: string;
  log_id: string;
  parent_id: string | null;
  user_id: string;
  user_name: string | null;
  user_type: 'client' | 'internal';
  comment_text: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => {
  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className={`${comment.user_type === 'internal' ? 'text-blue-600' : 'text-gray-600'}`}>
            {comment.user_type === 'internal' ? '👷' : '👤'}
          </span>
          <span className="font-medium">{comment.user_name || comment.user_id}</span>
          <span className="text-sm text-gray-500">
            ({comment.user_type})
          </span>
        </div>
        {!comment.parent_id && (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[comment.status]}`}>
            {comment.status}
          </span>
        )}
      </div>
      
      <p className="mt-2 text-gray-700">{comment.comment_text}</p>
      
      <div className="mt-3 flex gap-2 text-sm text-gray-500">
        <span>{new Date(comment.created_at).toLocaleString()}</span>
        {comment.updated_at !== comment.created_at && (
          <span>(edited)</span>
        )}
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-4 border-l-2 pl-4">
          {comment.replies.map(reply => (
            <CommentCard key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 2. Add Comment Form

```tsx
interface CommentFormData {
  comment_text: string;
  user_type: 'client' | 'internal';
  status?: string;
}

const AddCommentForm: React.FC<{ 
  logId: string; 
  onSuccess: () => void;
  currentUser: { id: string; name: string };
}> = ({ logId, onSuccess, currentUser }) => {
  const [text, setText] = useState('');
  const [userType, setUserType] = useState<'client' | 'internal'>('client');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/logs/${logId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY, // From your auth context
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_type: userType,
          comment_text: text,
          status: 'open',
        }),
      });
      
      if (response.ok) {
        setText('');
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the issue..."
        className="w-full p-3 border rounded-lg"
        rows={3}
        required
      />
      
      <div className="flex justify-between items-center">
        <select 
          value={userType} 
          onChange={(e) => setUserType(e.target.value as 'client' | 'internal')}
          className="px-3 py-2 border rounded"
        >
          <option value="client">Client</option>
          <option value="internal">Internal Team</option>
        </select>
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};
```

#### 3. Status Dropdown

```tsx
const StatusDropdown: React.FC<{
  commentId: string;
  currentStatus: string;
  onUpdate: () => void;
}> = ({ commentId, currentStatus, onUpdate }) => {
  const statuses = ['open', 'pending', 'resolved', 'closed'];
  
  const handleChange = async (newStatus: string) => {
    await fetch(`/api/v1/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  };

  return (
    <select 
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      className="px-2 py-1 border rounded text-sm"
    >
      {statuses.map(status => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
};
```

---

### API Integration Hook (React)

```tsx
import { useState, useEffect, useCallback } from 'react';

const API_KEY = 'your-api-key'; // From environment or auth context

export function useComments(logId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/logs/${logId}/comments`, {
        headers: { 'X-API-Key': API_KEY },
      });
      const data = await response.json();
      setComments(data.data);
    } catch (err) {
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [logId]);

  const addComment = async (commentData: CommentFormData) => {
    const response = await fetch(`/api/v1/logs/${logId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(commentData),
    });
    
    if (response.ok) {
      await fetchComments(); // Refresh list
      return true;
    }
    return false;
  };

  const addReply = async (parentId: string, replyData: ReplyFormData) => {
    const response = await fetch(`/api/v1/comments/${parentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(replyData),
    });
    
    if (response.ok) {
      await fetchComments();
      return true;
    }
    return false;
  };

  const updateComment = async (commentId: string, updates: Partial<Comment>) => {
    const response = await fetch(`/api/v1/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(updates),
    });
    
    if (response.ok) {
      await fetchComments();
      return true;
    }
    return false;
  };

  const deleteComment = async (commentId: string) => {
    const response = await fetch(`/api/v1/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': API_KEY },
    });
    
    if (response.ok) {
      await fetchComments();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    addReply,
    updateComment,
    deleteComment,
    refresh: fetchComments,
  };
}
```

---

## Workflow Example

```
1. Client sees error in automation log
   ↓
2. Client clicks "Add Comment" on log detail page
   ↓
3. POST /logs/{log_id}/comments
   { user_type: "client", comment_text: "Bot clicked wrong button", status: "open" }
   ↓
4. Internal team sees new "open" comment in dashboard
   ↓
5. Support agent replies
   POST /comments/{comment_id}/replies
   { user_type: "internal", comment_text: "Investigating..." }
   ↓
6. Agent updates status to "pending"
   PUT /comments/{comment_id}
   { status: "pending" }
   ↓
7. After fix deployed, agent marks as "resolved"
   PUT /comments/{comment_id}
   { status: "resolved" }
   ↓
8. Client confirms fix works → status: "closed"
```

---

## Files Reference

| File | Description |
|------|-------------|
| `app/db/models.py` | SQLAlchemy `LogComment` model |
| `app/services/comment_service.py` | Business logic |
| `app/api/comments.py` | API endpoints |
| `scripts/add_log_comments_table.sql` | Database migration |

---

## Testing

Run the test script:
```bash
cd central-logger
python scripts/test_comments_api.py
```

Or test individual endpoints with curl:
```bash
# Create comment
curl -X POST "http://localhost:8000/api/v1/logs/{log_id}/comments" \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","user_type":"client","comment_text":"Test comment"}'

# Get comments
curl -X GET "http://localhost:8000/api/v1/logs/{log_id}/comments" \
  -H "X-API-Key: your_api_key"
```
