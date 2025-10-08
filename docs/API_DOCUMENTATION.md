# BAJEEVA API Documentation

## API Versioning
All API endpoints are versioned using URL path versioning: `/api/v1/`, `/api/v2/`, etc.

Current stable version: **v1**

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Base URL
- Production: `https://yourdomain.com/api`
- Development: `http://localhost:3000/api`

---

## Health & Status Endpoints

### GET /health
Check system health and service status

**Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-07T23:59:15.156Z",
  "responseTime": 125,
  "services": [
    {
      "service": "database",
      "status": "healthy",
      "responseTime": 45
    },
    {
      "service": "auth",
      "status": "healthy",
      "responseTime": 30
    }
  ]
}
```

---

## Assessment Endpoints

### POST /api/v1/assessments
Create a new assessment

**Request Body**
```json
{
  "fundingGoal": "500000",
  "prototype": true,
  "revenue": false,
  "team": "3-5 members",
  "traction": "Early traction"
}
```

**Response**
```json
{
  "id": "uuid",
  "created_at": "timestamp",
  "user_id": "uuid"
}
```

### GET /api/v1/assessments/:id
Get a specific assessment

**Response**
```json
{
  "id": "uuid",
  "funding_goal": "500000",
  "prototype": true,
  "created_at": "timestamp"
}
```

---

## Organization Endpoints

### POST /api/v1/organizations
Create a new organization (authenticated)

**Request Body**
```json
{
  "name": "Acme Inc",
  "slug": "acme-inc",
  "subscription_tier": "premium"
}
```

**Response**
```json
{
  "id": "uuid",
  "name": "Acme Inc",
  "slug": "acme-inc",
  "created_at": "timestamp"
}
```

### GET /api/v1/organizations/:id/members
List organization members

**Response**
```json
{
  "members": [
    {
      "user_id": "uuid",
      "role": "owner",
      "joined_at": "timestamp"
    }
  ]
}
```

---

## Scheduled Reports

### POST /api/v1/reports/schedule
Create a scheduled report

**Request Body**
```json
{
  "report_name": "Monthly Summary",
  "report_type": "investment_summary",
  "frequency": "monthly",
  "format": "pdf",
  "recipients": ["email@example.com"]
}
```

---

## Rate Limiting
- **Free tier**: 100 requests/hour
- **Premium**: 1000 requests/hour
- **Enterprise**: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Webhooks
Configure webhooks to receive real-time updates

### Events
- `assessment.created`
- `assessment.scored`
- `report.generated`
- `organization.member_added`

### Webhook Payload
```json
{
  "event": "assessment.scored",
  "timestamp": "2025-01-07T23:59:15.156Z",
  "data": {
    "assessment_id": "uuid",
    "total_score": 75
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { BajeevaClient } from '@bajeeva/sdk';

const client = new BajeevaClient({
  apiKey: 'your-api-key',
  version: 'v1'
});

const assessment = await client.assessments.create({
  fundingGoal: '500000',
  prototype: true
});
```

### Python
```python
from bajeeva import Client

client = Client(api_key='your-api-key')
assessment = client.assessments.create(
    funding_goal='500000',
    prototype=True
)
```

---

## Changelog

### v1.0.0 (2025-01-07)
- Initial API release
- Assessment endpoints
- Organization management
- Health monitoring
- Scheduled reports

---

For support, contact: [email protected]