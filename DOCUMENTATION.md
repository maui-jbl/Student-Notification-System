# Student Notification and Academic Announcement System

## Documentation

---

## 1. System Description

The Student Notification and Academic Announcement System is a web-based platform designed to facilitate real-time communication between teachers and students within an academic institution. The system enables teachers to create, manage, and dispatch notifications to specific sections and subjects, while students receive these notifications instantly through a responsive web dashboard.

The system leverages MQTT (Message Queuing Telemetry Transport) protocol for real-time message distribution and Web Push technology for push notifications, allowing students to receive alerts on their mobile devices even when the browser is closed. It features role-based access control with three distinct user roles — Admin, Teacher, and Student — each with tailored capabilities and interfaces.

Built with a modern technology stack comprising React (Vite) for the frontend, Node.js (Express) for the backend API, MySQL for data persistence, and Mosquitto as the MQTT broker, the system provides a scalable, maintainable, and responsive solution for academic communication needs.

---

## 2. Statement of the Problem

Educational institutions often struggle with effective communication between faculty and students. Traditional methods such as bulletin boards, email broadcasts, and verbal announcements suffer from several limitations:

- **Delayed Delivery**: Information posted on physical bulletin boards or sent via email may not reach students in a timely manner.
- **Lack of Targeting**: Announcements are often broadcast to all students regardless of relevance, causing information overload.
- **No Read Tracking**: Teachers have no way of knowing whether students have received and read important announcements.
- **Fragmented Channels**: Communication is spread across multiple platforms (email, messaging apps, social media), making it difficult to manage.
- **No Mobile Reach**: Students away from campus may miss urgent notifications about schedule changes, exam updates, or events.

There is a need for a centralized, real-time notification system that allows targeted delivery of announcements to specific sections and subjects, provides read receipts, and reaches students on their mobile devices.

---

## 3. Objectives

### General Objective

To develop a web-based Student Notification and Academic Announcement System that enables real-time, targeted communication between teachers and students using MQTT protocol and Web Push notifications.

### Specific Objectives

1. To design and implement a role-based access control system with Admin, Teacher, and Student user roles.
2. To provide teachers with the ability to create, schedule, and manage notifications targeted to specific sections and subjects.
3. To enable students to receive real-time notifications through a responsive web dashboard accessible on desktop and mobile browsers.
4. To implement Web Push notifications (PWA) so students receive alerts on their mobile devices even when the browser is closed.
5. To provide read tracking functionality allowing teachers and administrators to monitor notification engagement.
6. To utilize MQTT protocol for efficient real-time message distribution.
7. To provide administrative tools for managing users (teachers, students), sections, subjects, courses, and assignments.

---

## 4. User Roles and Access

The system implements a role-based access control (RBAC) model with three distinct user roles. Each role has a defined set of permissions governing what data they can view, create, modify, or delete. Access is enforced through JWT token verification and role-based middleware on the backend.

### 4.1 Permission Matrix

| Permission | Admin | Teacher | Student |
|-----------|:-----:|:-------:|:-------:|
| Login / Authenticate | ✅ | ✅ | ✅ |
| View dashboard analytics | ✅ | ❌ | ❌ |
| Manage teachers (CRUD) | ✅ | ❌ | ❌ |
| Manage students (CRUD) | ✅ | ❌ | ❌ |
| Manage sections (CRUD) | ✅ | ❌ | ❌ |
| Manage subjects (CRUD) | ✅ | ❌ | ❌ |
| Manage courses (CRUD) | ✅ | ❌ | ❌ |
| Manage assignments | ✅ | ❌ | ❌ |
| View all notifications | ✅ | Own only | Own only |
| Create notifications | ❌ | ✅ | ❌ |
| Edit pending notifications | ❌ | ✅ | ❌ |
| Complete / dispatch notifications | ❌ | ✅ | ❌ |
| Cancel notifications | ❌ | ✅ (own) | ❌ |
| View notification history | ✅ | ✅ (own) | ✅ (own) |
| View read receipts | ✅ | ✅ (own) | ❌ |
| View enrolled subjects | ❌ | ✅ (assigned) | ✅ (enrolled) |
| Receive notifications | ❌ | ❌ | ✅ |
| Mark notifications as read/unread | ❌ | ❌ | ✅ |
| Subscribe to web push | ❌ | ❌ | ✅ |

### 4.2 Access Method

All access is handled through a RESTful API with JWT-based authentication:

#### Authentication Flow
1. User submits credentials via `POST /api/auth/login`
2. Server validates credentials and returns a JWT token + user object
3. Client stores the token in `localStorage`
4. All subsequent API requests include the token in the `Authorization: Bearer <token>` header
5. Backend middleware verifies the token and extracts user role and ID
6. Role-specific middleware (`authorize('admin', 'teacher', 'student')`) enforces access control

#### Frontend Access Control
- UI elements (tabs, buttons, pages) are conditionally rendered based on `user.role`
- Unauthorized API calls return HTTP 401 (Unauthorized) or 403 (Forbidden)
- Session is persisted across page refreshes via `localStorage`
- Auto-logout on token invalidity via axios response interceptor

### 4.3 Admin

- Full access to all system features
- Manage teachers (create, edit, archive, restore, permanently delete)
- Manage students (create, edit, archive, restore)
- Manage sections (create, edit, archive, restore)
- Manage subjects (create, edit, archive, restore)
- Manage courses (create, edit, delete)
- Manage teacher-subject-section assignments
- View all notifications across the system
- View analytics dashboard (sent, pending, cancelled notification counts)
- **Access Method**: Admin-specific API routes under `/api/admin/*` with `authorize('admin')` middleware

**Default Account**: `admin@school.com` / `admin123`

### 4.4 Teacher

- View assigned sections and subjects
- Create and send notifications to assigned sections and subjects
- Schedule notifications for future delivery
- Edit pending notifications
- Cancel pending/scheduled notifications
- View notification history (pending, completed, cancelled, archived)
- Delete cancelled notifications
- View read receipts for sent notifications
- **Access Method**: Teacher-specific API routes under `/api/teacher/*` with `authorize('teacher', 'admin')` middleware. Notification creation is restricted to the teacher's assigned subject-section combinations.

**Default Account**: `teacher1@school.com` / `teacher123`

### 4.5 Student

- View enrolled subjects
- Receive real-time notifications for enrolled subjects and assigned section
- Mark notifications as read or unread
- View notification history with read/unread status
- Receive push notifications on mobile devices via PWA (Progressive Web App)
- Filter notifications by subject
- **Access Method**: Student-specific API routes under `/api/student/*` with `authorize('student')` middleware. Notifications are filtered to only include those matching the student's section and enrolled subjects.

**Default Account**: `student1@school.com` / `student123`

---

## 5. System Features

### 5.1 Authentication and Authorization
- JWT-based login system
- Role-based access control (Admin, Teacher, Student)
- Session persistence via localStorage
- Auto-logout on token expiration or invalidity

### 5.2 Dashboard Analytics
- Overview page showing counts of teachers, students, sections, and subjects (Admin)
- Sent notifications summary with search and pagination
- Quick navigation to management sections

### 5.3 Notification Management
- Create notifications with title, message, section, subject, and priority (Normal, Urgent, Exam, Event)
- Schedule notifications for future delivery
- Edit pending/scheduled notifications
- Complete (dispatch) pending notifications
- Cancel pending/scheduled notifications
- Teacher notification history with filters: Pending, Completed, Cancelled, Archived
- Notification search by title, section, or subject

### 5.4 Real-Time Delivery
- MQTT-based real-time message publishing
- Web Push notifications via PWA service worker
- Notification delivery to students based on section and subject enrollment

### 5.5 Read Tracking
- Students can mark notifications as read or unread
- Teachers and admins can view read status for each notification
- Per-student read receipt tracking

### 5.6 User Management (Admin)
- Teacher CRUD with subject assignments
- Student CRUD with section and subject enrollment
- Archive/restore functionality for soft deletion
- Search and pagination for user lists

### 5.7 Academic Structure Management (Admin)
- Course management (create, edit, delete)
- Section management (create, edit, archive, restore)
- Subject management (create, edit, archive, restore)
- Teacher-Subject-Section assignment management

### 5.8 PWA and Push Notifications
- Progressive Web App with install prompt
- Web Push notifications via VAPID protocol
- Service worker for background notification handling
- Notification click handling (opens/focuses app)

### 5.9 Responsive Design
- Mobile-responsive interface
- Touch-friendly controls (minimum 44px tap targets)
- Scrollable tables and tabs on small screens
- Full-screen modals on mobile devices

---

## 6. System Architecture Design

### 6.1 Architectural Overview

The system follows a **client-server architecture** with a **single-page application (SPA)** frontend communicating with a **RESTful API backend** over HTTP. Real-time message delivery is handled by an **MQTT broker** operating alongside the main application server. The architecture is designed to be modular, scalable, and deployable behind a reverse proxy for production use.

**Development Flow (without Nginx):**

```
┌──────────────────────────────────┐
│     Web Browser (Client)         │
│  React SPA (localhost:5173)      │
│                                  │
│  ┌─ React App ─────────────────┐ │
│  │  • Landing Page / Login     │ │
│  │  • Admin Dashboard          │ │
│  │  • Teacher Dashboard        │ │
│  │  • Student Dashboard        │ │
│  │  • PWA Service Worker       │ │
│  └─────────────────────────────┘ │
└──────────┬───────────────────────┘
           │
           │ HTTP requests
           │
           ▼ (Vite proxies /api → localhost:5000)
┌──────────────────────┐     ┌─────────────────┐
│   Express API Server  │────▶│  MySQL Database  │
│   (localhost:5000)    │     │  (port 3306)     │
│                      │     └─────────────────┘
│  ┌────────────────┐  │
│  │  /api/auth/*   │  │     ┌─────────────────┐
│  │  /api/admin/*  │  │     │  Mosquitto MQTT  │
│  │  /api/teacher/*│──┼────▶│  (port 1885)     │
│  │  /api/student/*│  │     │  (WS port 9001)  │
│  │  /api/push/*   │  │     └─────────────────┘
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ Notification   │  │
│  │ Service        │──┼────▶ Web Push (VAPID)
│  │ • MQTT publish │  │      to PWA subscribers
│  │ • Web Push     │  │
│  └────────────────┘  │
└──────────────────────┘
```

**Production Flow (with Nginx):**

```
┌─────────────────────────────────────────────┐
│            Client Browser                    │
│  (Desktop / Mobile / Tablet)                │
└──────────────────┬──────────────────────────┘
                   │
             HTTPS :443
                   │
            ┌──────▼──────┐
            │   Nginx      │  Reverse Proxy
            │              │
            │  /api/* ─────┼────▶ Express :5000
            │  /*     ─────┼────▶ Static files
            └──────────────┘
```

### 6.2 Component Descriptions

#### 6.2.1 Frontend (React + Vite)

The frontend is a single-page application built with React 19 and bundled with Vite. It uses client-side routing (state-based, no router library) to switch between the Landing Page, Login, and Dashboard views. The Dashboard component dynamically renders different interfaces based on the authenticated user's role (Admin, Teacher, or Student).

Key characteristics:
- **State management**: React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- **HTTP client**: Axios with JWT Bearer token authentication
- **PWA**: Service worker for push notifications, manifest.json for installability
- **Styling**: Plain CSS with responsive design breakpoints (mobile-first)
- **Build output**: Static files served from `dist/` directory
- **Development server**: Vite dev server on port 5173 with HMR (Hot Module Replacement)

#### 6.2.2 Backend API (Express)

The backend is a Node.js REST API server built with Express 5. It handles authentication, CRUD operations for all entities, and notification management.

Key characteristics:
- **Authentication**: JWT-based with configurable secret
- **Authorization**: Role-based middleware (`authenticate` + `authorize`)
- **Database**: mysql2 connection pool with prepared statements
- **Scheduling**: node-cron runs every minute to dispatch scheduled notifications
- **Server port**: 5000 (configurable via environment variable)

#### 6.2.3 MQTT Broker (Mosquitto)

Mosquitto acts as the real-time message broker. When a notification is dispatched, the backend publishes it to a topic structured as `school/{section}/{subject}`. MQTT clients (mobile apps, browser clients) can subscribe to these topics.

- **MQTT port**: 1885 (standard MQTT protocol)
- **WebSocket port**: 9001 (for browser-based MQTT clients)
- **Authentication**: Anonymous (can be configured with username/password)

#### 6.2.4 Database (MySQL)

MySQL stores all persistent data including users, notifications, academic structure, and read receipts. The schema is relational with foreign key constraints ensuring data integrity.

#### 6.2.5 Web Push Service (VAPID)

When a notification is dispatched, the system also sends Web Push notifications to all subscribed students via the Web Push API using VAPID (Voluntary Application Server Identification). This enables push notifications on mobile devices without requiring a native app.

### 6.3 Data Flow: Notification Lifecycle

```
Teacher creates         Backend stores         Backend publishes      Student receives
notification           in MySQL               via MQTT + Web Push    notification
───────┬─────────     ───────┬─────────      ───────┬───────────    ───────┬─────────
       │                      │                      │                     │
  ┌────▼────┐          ┌─────▼─────┐          ┌──────▼──────┐       ┌──────▼──────┐
  │ Teacher  │  POST   │  Express   │  INSERT  │   MySQL     │       │              │
  │ Dashboard│ ───────▶│  /api/     │ ───────▶│ notifications│       │              │
  │ (Browser)│         │  teacher/  │          │ table       │       │              │
  │          │         │  notifica- │          └─────────────┘       │              │
  │  Submit  │         │  tions     │                                │              │
  │  Form    │         └─────┬──────┘                                │              │
  └──────────┘               │                                       │              │
                             │                                       │              │
                     Teacher clicks ✓ (Complete)                     │              │
                             │                                       │              │
                      ┌──────▼──────┐                                │              │
                      │  Express     │  UPDATE status='sent'          │              │
                      │  PUT /api/   │ ──────────────────────────────▶│              │
                      │  teacher/    │                                │              │
                      │  :id/complete│                                │              │
                      │              │                                │              │
                      │  dispatch-   │──── MQTT Publish ──────────────┼──▶ MQTT     │
                      │  Notification│     school/{sec}/{sub}         │    Broker   │
                      │              │                                │              │
                      │              │──── Web Push (VAPID) ──────────┼──▶ Browser  │
                      │              │     to PWA subscribers         │    (Student)│
                      └──────────────┘                                └─────────────┘
```

### 6.4 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React 19 + Vite |
| Backend Framework | Express 5 (Node.js) |
| Database | MySQL 8+ |
| MQTT Broker | Mosquitto |
| Authentication | JWT (jsonwebtoken) |
| Push Notifications | Web Push API (VAPID) |
| Real-Time Protocol | MQTT 5.0 |
| ORM/Database Driver | mysql2 |
| Scheduling | node-cron |
| Deployment | Nginx reverse proxy |

### 6.3 Database Schema

The database consists of the following tables:

- **users** — User accounts with role (admin, teacher, student), personal information, section assignment
- **courses** — Academic courses (e.g., BSIT, BSCS)
- **sections** — Class sections (e.g., BSIT2A, BSIT3B) linked to courses
- **subjects** — Academic subjects linked to teachers and courses
- **student_subjects** — Many-to-many relationship between students and subjects
- **teacher_subject_sections** — Assignments linking teachers, subjects, and sections
- **notifications** — Notification records with title, message, priority, scheduling, and status
- **notification_reads** — Read receipts tracking per student per notification
- **push_subscriptions** — PWA push notification subscriptions per user
- **fcm_tokens** — (Legacy) Firebase Cloud Messaging tokens (unused)

### 6.4 API Endpoints

#### Authentication
- `POST /api/auth/login` — User login

#### Admin (`/api/admin`)
- `GET /api/admin/teachers` — List teachers
- `POST /api/admin/teachers` — Create teacher
- `PUT /api/admin/teachers/:id` — Update teacher
- `DELETE /api/admin/teachers/:id` — Archive teacher
- `POST /api/admin/teachers/:id/restore` — Restore teacher
- `DELETE /api/admin/teachers/:id/permanent` — Permanently delete teacher
- `GET /api/admin/teachers/archived` — List archived teachers
- `GET /api/admin/teachers/:id/subjects` — Get teacher's subjects
- `PUT /api/admin/teachers/:id/subjects` — Assign subjects to teacher
- `GET /api/admin/teachers/:id/assignments` — Get teacher's assignments
- `GET /api/admin/students` — List students
- `POST /api/admin/students` — Create student
- `PUT /api/admin/students/:id` — Update student
- `DELETE /api/admin/students/:id` — Archive student
- `POST /api/admin/students/:id/restore` — Restore student
- `GET /api/admin/students/archived` — List archived students
- `GET /api/admin/sections` — List sections
- `POST /api/admin/sections` — Create section
- `PUT /api/admin/sections/:id` — Update section
- `DELETE /api/admin/sections/:id` — Archive section
- `POST /api/admin/sections/:id/restore` — Restore section
- `GET /api/admin/sections/archived` — List archived sections
- `GET /api/admin/subjects` — List subjects
- `POST /api/admin/subjects` — Create subject
- `PUT /api/admin/subjects/:id` — Update subject
- `DELETE /api/admin/subjects/:id` — Archive subject
- `POST /api/admin/subjects/:id/restore` — Restore subject
- `GET /api/admin/subjects/archived` — List archived subjects
- `GET /api/admin/courses` — List courses
- `POST /api/admin/courses` — Create course
- `PUT /api/admin/courses/:id` — Update course
- `DELETE /api/admin/courses/:id` — Delete course
- `GET /api/admin/assignments` — List assignments
- `POST /api/admin/assignments` — Create assignment
- `PUT /api/admin/assignments/:id` — Update assignment
- `DELETE /api/admin/assignments/:id` — Delete assignment

#### Teacher (`/api/teacher`)
- `GET /api/teacher/my-subjects` — Get assigned subjects
- `GET /api/teacher/all-subjects` — Get all subjects
- `GET /api/teacher/sections` — Get assigned sections
- `GET /api/teacher/assigned-combos` — Get subject-section combinations
- `POST /api/teacher/notifications` — Create notification
- `GET /api/teacher/notifications/history` — Get notification history
- `PUT /api/teacher/notifications/:id/complete` — Complete and dispatch notification
- `PUT /api/teacher/notifications/:id/edit` — Edit pending notification
- `PUT /api/teacher/notifications/:id/cancel` — Cancel notification
- `DELETE /api/teacher/notifications/:id` — Delete cancelled notification

#### Student (`/api/student`)
- `GET /api/student/subjects` — Get enrolled subjects
- `GET /api/student/notifications` — Get notifications
- `POST /api/student/notifications/:id/read` — Mark as read
- `POST /api/student/notifications/:id/unread` — Mark as unread

#### Push (`/api/push`)
- `POST /api/push/subscribe` — Subscribe to web push
- `DELETE /api/push/unsubscribe` — Unsubscribe from web push

---

## 7. Procedures

### 7.1 Installation and Setup

#### Prerequisites
- Node.js 20+
- MySQL 8+
- Mosquitto MQTT Broker
- Nginx (for production deployment)

#### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with database credentials
npm install
npm start
```

#### Frontend Setup (Development)
```bash
cd web-dashboard
npm install
npx vite --host
```

#### Database Setup
```bash
mysql -u root < database.sql
mysql -u root student_notification_system < database.migration.sql
```

### 7.2 Notification Lifecycle

1. **Teacher creates notification** — Enters title, message, selects section and subject, sets priority, optionally schedules delivery
2. **Notification status set to 'pending'** (or 'scheduled' if a future date is set)
3. **Teacher reviews pending notifications** — Can edit, cancel, or complete the notification
4. **Teacher completes notification** — Status changes to 'sent', system dispatches via MQTT and Web Push
5. **Students receive notification** — Visible in the dashboard; push notification appears on device
6. **Student reads notification** — Can mark as read; teacher can track read status
7. **Automatic scheduling** — Node-cron runs every minute, dispatching scheduled notifications whose time has arrived

### 7.3 User Management Workflow (Admin)

1. **Create sections** — Define academic sections (e.g., BSIT2A) under courses
2. **Create subjects** — Define subjects and optionally assign to teachers
3. **Create teachers** — Add teacher accounts and assign to subjects
4. **Create students** — Add student accounts with section and subject enrollment
5. **Manage assignments** — Link teachers to subject-section combinations

### 7.4 Deployment Procedure

1. Clone repository to server
2. Import database schema
3. Configure backend `.env` with production values
4. Install backend dependencies and start via PM2
5. Configure and start Mosquitto MQTT broker
6. Build frontend (`npm run build`)
7. Configure Nginx as reverse proxy with SSL
8. Open firewall ports

---

## 8. MQTT Broker Setup

### 8.1 Overview

The system uses the Mosquitto MQTT broker for real-time message distribution. MQTT is a lightweight publish-subscribe protocol ideal for IoT and real-time applications. The broker runs locally on the server and handles message routing between the backend and any MQTT-capable clients.

### 8.2 Configuration

The broker is configured in `mosquitto-custom.conf`:

```conf
listener 1885 0.0.0.0
protocol mqtt

listener 9001 0.0.0.0
protocol websockets

allow_anonymous true
```

- Port **1885** — Standard MQTT protocol (for backend and native MQTT clients)
- Port **9001** — WebSocket protocol (for browser-based MQTT clients)
- Anonymous access is enabled for simplicity (can be secured with username/password in production)

### 8.3 Topic Structure

Notifications are published to topics following this convention:

```
school/{section_name}/{subject_name}
```

For example, a notification for the WebDev subject in BSIT2A section would be published to:

```
school/BSIT2A/WebDev
```

This topic structure allows clients to subscribe to specific sections, subjects, or both using MQTT wildcards:
- `school/BSIT2A/+` — All subjects in BSIT2A
- `school/+/WebDev` — WebDev across all sections
- `school/#` — All notifications

### 8.4 Message Payload

When a notification is dispatched, the backend publishes a JSON payload:

```json
{
  "id": 1,
  "title": "Exam Schedule Updated",
  "message": "The final exam has been moved to December 15.",
  "priority": "Urgent",
  "section": "BSIT2A",
  "subject": "WebDev",
  "created_at": "2026-06-01T10:00:00.000Z"
}
```

### 8.5 Setup Commands

```bash
# Install Mosquitto
apt install -y mosquitto mosquitto-clients

# Apply custom configuration
cp mosquitto-custom.conf /etc/mosquitto/conf.d/studnet.conf

# Restart broker
systemctl restart mosquitto
systemctl enable mosquitto

# Verify broker is running
mosquitto_sub -t "school/#" -p 1885

# Test publishing
mosquitto_pub -t "school/test" -m "Hello" -p 1885
```

### 8.6 Integration with Backend

The backend connects to the MQTT broker via the `mqtt` npm package. When a notification is completed, the `dispatchNotification` function in `notificationService.js` publishes the message to the appropriate topic and also triggers Web Push delivery.

---

## 9. Summary

The Student Notification and Academic Announcement System successfully addresses the communication gap between teachers and students in academic institutions. By combining a responsive web dashboard with MQTT real-time messaging and PWA push notifications, the system ensures that important announcements reach students promptly regardless of their device or location.

Key achievements of the system include:

- **Centralized Communication** — A single platform for all academic announcements
- **Targeted Delivery** — Notifications routed to specific sections and subjects
- **Real-Time Distribution** — MQTT protocol enables instant message delivery
- **Mobile Reach** — Web Push notifications alert students even when the browser is closed
- **Read Tracking** — Teachers can monitor which students have read their notifications
- **Scheduling** — Future-dated notifications are automatically dispatched
- **Comprehensive Management** — Admin tools cover the full academic structure (courses, sections, subjects, users)

---

## 10. Conclusion

The system demonstrates an effective integration of modern web technologies to solve a practical educational challenge. The use of MQTT as the real-time messaging layer provides a lightweight, efficient mechanism for notification distribution, while the PWA implementation ensures cross-platform compatibility without requiring a native mobile application.

The system is production-ready with Nginx reverse proxy support, database migration scripts, and a comprehensive setup guide. Security features include JWT-based authentication, role-based access control, and HTTPS support (via Nginx with Let's Encrypt).

Future enhancements could include:
- Two-factor authentication for enhanced security
- Email notification fallback
- Real-time WebSocket-based dashboard updates (currently using manual refresh)
- Advanced analytics and reporting for notification engagement
- Integration with Learning Management Systems (LMS)
- File attachments in notifications
- Multi-language support
