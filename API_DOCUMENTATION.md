# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Auth Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "APPLICANT"  // Optional, defaults to APPLICANT
}

Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "user-123",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "APPLICANT"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {...}
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": "user-123",
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "APPLICANT",
  "active": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}

Response (200):
{
  "message": "Profile updated",
  "user": {...}
}
```

## Program Endpoints

### List All Programs
```http
GET /programs

Response (200):
{
  "programs": [
    {
      "id": "prog-001",
      "code": "CS101",
      "name": "Bachelor of Science in Computer Science",
      "college": "College of Science and Technology",
      "capacity": 50,
      "acceptsReb": true,
      "acceptsTvet": true,
      "minMathSkill": 60,
      "minTechnicalSkill": 55,
      "minScienceSkill": 50,
      "minCommunication": 50,
      "minProblemSolving": 55,
      "mathWeight": 0.3,
      ...
    }
  ]
}
```

### Get Program Details
```http
GET /programs/:id

Response (200):
{
  "id": "prog-001",
  "code": "CS101",
  "name": "Bachelor of Science in Computer Science",
  "college": "College of Science and Technology",
  "capacity": 50,
  "applicationCount": 245,
  "availableSlots": 50,
  ...
}
```

### Create Program (Admin Only)
```http
POST /programs
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "DATA101",
  "name": "Bachelor of Science in Data Science",
  "college": "College of Science and Technology",
  "capacity": 35,
  "acceptsReb": true,
  "acceptsTvet": false,
  "minMathSkill": 70,
  "minTechnicalSkill": 65,
  "minScienceSkill": 60,
  "minCommunication": 50,
  "minProblemSolving": 70,
  "mathWeight": 0.35,
  "technicalWeight": 0.25,
  "scienceWeight": 0.2,
  "communicationWeight": 0.1,
  "problemSolvingWeight": 0.1
}

Response (201):
{
  "message": "Program created",
  "program": {...}
}
```

### Update Program (Admin Only)
```http
PUT /programs/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "capacity": 55,
  "minMathSkill": 65
}

Response (200):
{
  "message": "Program updated",
  "program": {...}
}
```

### Delete Program (Admin Only)
```http
DELETE /programs/:id
Authorization: Bearer <admin_token>

Response (200):
{
  "message": "Program deleted"
}
```

## Application Endpoints

### Submit Application
```http
POST /applications
Authorization: Bearer <applicant_token>
Content-Type: application/json

{
  "programId": "prog-001",
  "choicePriority": 1,
  "pathway": "REB",
  "rebResults": {
    "subjects": "{\"Mathematics\": \"A\", \"Physics\": \"B\", \"Chemistry\": \"B\"}",
    "totalPoints": 42,
    "gradeAverage": 3.8,
    "yearCompleted": 2023,
    "schoolName": "Lycée de Kigali",
    "schoolCode": "LYC_KGL_001"
  }
}

Response (201):
{
  "message": "Application submitted successfully",
  "application": {
    "id": "app-001",
    "programId": "prog-001",
    "choicePriority": 1,
    "status": "SUBMITTED",
    "scores": {
      "competencyScore": 82.5,
      "eligibilityScore": 90,
      "finalScore": 85
    },
    "eligibility": true,
    "mlPrediction": {
      "admissionProbability": 0.82,
      "successProbability": 0.75,
      "confidence": 0.85,
      "reasoning": "..."
    }
  }
}
```

### Get My Applications
```http
GET /applications
Authorization: Bearer <applicant_token>

Response (200):
{
  "applications": [
    {
      "id": "app-001",
      "program": {...},
      "choicePriority": 1,
      "status": "ADMITTED",
      "competencyScore": 82.5,
      ...
    }
  ]
}
```

### Get Application Details & Explanation
```http
GET /applications/:id
Authorization: Bearer <applicant_token>

Response (200):
{
  "application": {...},
  "explanation": "You have been admitted to Computer Science..."
}
```

## Admission Endpoints (Admin Only)

### Process Admissions
```http
POST /admissions/process
Authorization: Bearer <admin_token>

Response (200):
{
  "message": "Admissions processed successfully",
  "resultsCount": 4,
  "totalAdmitted": 180,
  "totalWaitlisted": 45,
  "totalRejected": 890,
  "fairnessMetrics": {
    "byGender": {...},
    "byDistrict": {...},
    "byPathway": {...},
    "adverseImpact": 0.85,
    "disparateImpact": 0.92
  }
}
```

### Get Admissions List
```http
GET /admissions/list?programId=prog-001&status=ADMITTED
Authorization: Bearer <admin_token>

Response (200):
{
  "admissions": [
    {
      "id": "adm-001",
      "applicantId": "app-001",
      "applicant": {...},
      "program": {...},
      "status": "ADMITTED",
      "rank": 1,
      "finalScore": 92.5,
      "reason": "Top ranked applicant with excellent competency scores"
    }
  ]
}
```

### Get Program Rankings
```http
GET /admissions/program/:programId/rankings
Authorization: Bearer <admin_token>

Response (200):
{
  "rankings": [
    {
      "rank": 1,
      "applicantId": "app-123",
      "applicantName": "John Doe",
      "pathway": "REB",
      "choicePriority": 1,
      "competencyScore": 88.5,
      "finalScore": 90.2,
      "status": "ADMITTED"
    }
  ]
}
```

### Override Admission Decision
```http
PUT /admissions/:admissionId/override
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newStatus": "ADMITTED",
  "reason": "Exceptional case - community leader"
}

Response (200):
{
  "message": "Admission decision overridden",
  "admission": {...}
}
```

### Get Fairness Report
```http
GET /admissions/report/fairness
Authorization: Bearer <admin_token>

Response (200):
{
  "currentMetrics": {
    "byGender": {
      "Male": {"admitted": 120, "total": 600, "rate": 0.20},
      "Female": {"admitted": 110, "total": 650, "rate": 0.169}
    },
    "byDistrict": {...},
    "byPathway": {
      "REB": {"admitted": 180, "total": 750, "rate": 0.24},
      "TVET": {"admitted": 50, "total": 500, "rate": 0.10}
    },
    "adverseImpact": 0.85,
    "disparateImpact": 0.92
  },
  "history": [...],
  "alerts": [
    "Adverse impact detected: one group has <80% of another group's admission rate",
    "Significant pathway imbalance in admissions"
  ]
}
```

### Get My Admissions (Applicant)
```http
GET /admissions/applicant/my-admissions
Authorization: Bearer <applicant_token>

Response (200):
{
  "admissions": [
    {
      "id": "adm-001",
      "program": {...},
      "status": "ADMITTED",
      "rank": 25,
      "finalScore": 85.5
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Program not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details (only in development)"
}
```

## Rate Limiting

Sensitive endpoints are rate limited:

```
Max 100 requests per 15 minutes per IP address
```

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705328400
```

## Pagination

List endpoints support pagination:

```
GET /endpoint?page=1&limit=20
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```
