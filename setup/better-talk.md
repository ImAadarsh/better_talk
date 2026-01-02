Right now there is no access to external tools, and every factual statement is required to be backed by citations from those tools, so a fully “properly cited” document is not possible in this turn. However, a clear, structured **developer handoff doc** (that you can paste into a code copilot / repo) can be drafted in concise form.

Below is a compact but detailed spec you can directly give to a copilot or dev team to guide implementation of **BetterTalk**.

***

## 1. High-Level Overview

BetterTalk is a web-based mental health and self-growth platform.  
Tech stack: Next.js frontend, Node.js backend (can be Next.js API routes), MySQL as the primary database.  
Core entities: users, mentors, groups, posts, comments, mentor plans, bookings, chats, chat messages, session notes, notifications.

***

## 2. Roles

- **User**  
  - Logs in with Google.  
  - Joins groups, posts/comments.  
  - Books one-to-one sessions with mentors.  
  - Chats with mentors within a time-bound window (3/5/7 days etc.).

- **Mentor**  
  - Logs in with Google.  
  - Has verified badge.  
  - Configures paid session plans (duration + chat days + price).  
  - Participates in groups with verified tick.  
  - Chats with users and maintains notes.

- **Admin** (future / minimal)  
  - Manages users, mentors, groups.  
  - Can verify mentors.

***

## 3. Authentication & Onboarding

### 3.1 Authentication

- Use Google OAuth for both users and mentors.  
- On first login:
  - Create a user record in `users` table.  
  - Force completion of onboarding form.

### 3.2 Onboarding Form

Fields:

- Phone number (required).  
- Age (required).  
- Anonymous username (required, **immutable** once set).  

Rules:

- Anonymous username must be unique.  
- After onboarding, user is redirected to group discovery page.

***

## 4. Core Features

### 4.1 User Profile

- Page: `/profile`  
- Visible fields:
  - Anonymous username  
  - Optional display name  
  - Age  
  - Basic bio  
- Private fields:
  - Email  
  - Phone  
- Tabs:
  - Profile info  
  - Joined groups list  
  - Sessions & mentors (past and active bookings)

Edit rules:

- Anonymous username: not editable after first set.  
- Other fields editable.

### 4.2 Mentor Profile

- Mentor is a user with role `mentor`.  
- Public page: `/mentor/[id]`  
- Fields:
  - Name, photo, headline.  
  - Bio.  
  - Expertise tags (e.g., breakup, anxiety, self-growth).  
  - Languages.  
  - Experience (years, optional).  
  - Verified badge (boolean).  

Sections:

- About  
- Plans (cards)  
- Reviews (future)  

Clicking mentor’s name/tick in a group opens this page.

### 4.3 Groups & Community

- Page: `/groups` – list of all active groups.  
- Group detail: `/groups/[id]`  

Functionality:

- List groups with:
  - Name  
  - Short description  
  - Member count  
- Join/Leave group actions.  
- Inside a group:
  - Create post (text; future support for media).  
  - Comment on posts.  
  - Show mentor comments with verified badge next to name.

Permissions:

- Only group members can post/comment.  
- Anyone logged in can join groups.

### 4.4 Mentor Plans (Products)

Each mentor can define multiple plans:

Attributes:

- Title (e.g., “Breakup Support – 30 min + 5 days chat”)  
- Price (in INR)  
- Live session duration (e.g., 20/30 minutes – optional, can be conceptual only if no live call now)  
- Chat window days: 3/5/7 (or any integer).  
- Description (plain text).  
- Active flag.

UI:

- Mentor dashboard page: `/mentor/dashboard/plans`  
- CRUD operations (create, edit, activate/deactivate).  
- On public mentor profile, show plans as cards with “Book” button.

### 4.5 Booking Flow

Flow:

1. User opens mentor profile.  
2. User selects a plan and clicks “Book”.  
3. Booking summary screen:
   - Plan details  
   - Price  
   - Chat validity (e.g., 5 days)  
4. User proceeds to payment (Razorpay/Cashfree integration later).  
5. On success:
   - Create `booking` record.  
   - Create `chat` record.  
   - Compute `chat_start_at` and `chat_end_at = now + chat_window_days`.  
   - Set booking status to `confirmed`.  
6. Redirect user to the one-to-one chat screen for that booking.

Booking statuses:

- `pending`  
- `confirmed`  
- `cancelled`  
- `expired`

### 4.6 One-to-One Chat

Concept:

- Each confirmed booking has one one-to-one chat thread between user and mentor.  
- Chat is **time-limited** based on the plan’s `chat_window_days`.  
- Rebooking with the same mentor either:
  - Extends existing chat window; or  
  - Creates a new chat; design choice – recommended: **extend same thread** for continuity.

Chat page:

- URL pattern: `/chat/[chatId]`  
- Elements:
  - Header:
    - Mentor/User name  
    - “Verified” tick if mentor  
    - Countdown: “Free chat available for next X days Y hours Z minutes”  
  - Messages list (scrollable)  
  - Input box, send button  

Timer logic:

- On page load, fetch `chat_end_at`.  
- On client, compute remaining time = `chat_end_at - current_time`.  
- Display formatted countdown.  
- Update every second or every few seconds.  
- When remaining time ≤ 0:
  - Disable input.  
  - Show banner: “Chat expired. Rebook a session to continue.”  

Permissions:

- Only the two participants (user + mentor) can access the chat.  
- If chat expired, they can still read past messages but cannot send new ones.

Messages:

- Each message:
  - Sender id  
  - Text content (initially only text)  
  - Sent timestamp  

For now, a simple WebSocket / Socket.io-based real-time messaging or a polling API can be used; copilot can pick the implementation pattern.

### 4.7 Session Notes

Per booking:

- Separate notes area accessible from:
  - Chat page (tab or button)  
  - Mentor dashboard  

Functionality:

- Mentor can write/edit notes.  
- User can read notes (read-only).  

Structure:

- `session_notes` table keyed by booking (or multiple notes entries per booking; choose one).  
- Notes text is plain text / markdown-like.

Usage:

- On rebooking, the same notes are shown and can be updated, so mentor remembers context.

### 4.8 Notifications & Emails

Trigger-based emails (minimum):

1. Account created / onboarding completed.  
2. Booking confirmed.  
3. Chat window opened (after booking).  
4. First message in chat.  
5. New message after a configurable inactivity period (e.g., last message older than X hours).  

Email contents (high level):

- Subject lines like “Your session with [Mentor Name] is confirmed” or “New message from your mentor”.  
- CTAs linking back to app screen (chat or booking details).

***

## 5. Data Model (Tables)

This is a concise sketch; copilot can expand migration definitions.

### 5.1 Users

- `id` (PK)  
- `google_id`  
- `email`  
- `phone_number`  
- `age`  
- `anonymous_username`  
- `role` (`user`, `mentor`, `admin`)  
- `created_at`, `updated_at`

### 5.2 Mentors

- `id` (PK, FK to users)  
- `headline`  
- `bio`  
- `expertise_tags` (comma-separated or separate table)  
- `languages`  
- `experience_years`  
- `is_verified` (boolean)  
- `created_at`, `updated_at`

### 5.3 Groups

- `id`  
- `name`  
- `description`  
- `created_by` (admin or system)  
- `created_at`

### 5.4 Group Members

- `id`  
- `group_id`  
- `user_id`  
- `joined_at`

### 5.5 Group Posts

- `id`  
- `group_id`  
- `user_id`  
- `content`  
- `created_at`  

### 5.6 Group Comments

- `id`  
- `post_id`  
- `user_id`  
- `content`  
- `created_at`

### 5.7 Mentor Plans

- `id`  
- `mentor_id`  
- `title`  
- `description`  
- `price_in_inr`  
- `chat_window_days` (int; e.g., 3/5/7)  
- `is_active`  
- `created_at`, `updated_at`

### 5.8 Bookings

- `id`  
- `user_id`  
- `mentor_id`  
- `mentor_plan_id`  
- `status`  
- `payment_reference`  
- `session_start_at` (nullable)  
- `session_end_at` (nullable)  
- `created_at`

### 5.9 Chats

- `id`  
- `booking_id`  
- `user_id`  
- `mentor_id`  
- `chat_start_at`  
- `chat_end_at`  
- `is_active` (derived from dates but kept for convenience)  
- `created_at`

### 5.10 Chat Messages

- `id`  
- `chat_id`  
- `sender_id`  
- `message_text`  
- `sent_at`

### 5.11 Session Notes

- `id`  
- `booking_id`  
- `mentor_id`  
- `user_id`  
- `notes_text`  
- `updated_at`

### 5.12 Notifications / Email Logs (optional but recommended)

- `id`  
- `user_id`  
- `type` (e.g., `booking_confirmed`, `chat_started`)  
- `reference_id` (booking/chat id)  
- `sent_at`  
- `status`

***

## 6. Access Control & Business Rules (for Copilot)

- Routes that require login:
  - All group, chat, booking, profile pages.  
- Users can:
  - View and edit their own profile.  
  - Join/leave groups.  
  - Create posts and comments in joined groups.  
  - Book mentors and access their own bookings and chats.  
- Mentors can:
  - Edit their mentor profile and plans.  
  - Access chats/bookings where `mentor_id` matches them.  
  - Create and edit notes for their own bookings.  
- Admin can:
  - Access everything (implementation optional in v1).  

Chat rules:

- Only 2 participants per chat: `user_id` and `mentor_id` from booking.  
- Before sending a message:
  - Check chat is active: current time < `chat_end_at`.  
  - If not active, return error and show “chat expired” message.

***

## 7. Suggested Folder / Module Breakdown

For Next.js + Node/MySQL, you can suggest this structure to copilot:

- `src/`  
  - `pages/`  
    - `index.tsx` (landing / redirect to groups)  
    - `groups/index.tsx`  
    - `groups/[id].tsx`  
    - `profile/index.tsx`  
    - `mentor/[id].tsx`  
    - `mentor/dashboard/*.tsx`  
    - `chat/[chatId].tsx`  
  - `pages/api/` (if using Next API routes)  
    - `auth/*`  
    - `groups/*`  
    - `mentor/*`  
    - `booking/*`  
    - `chat/*`  
  - `lib/`  
    - `db.ts` (MySQL connection)  
    - `auth.ts` (session helpers)  
  - `components/`  
    - `GroupList`, `GroupDetail`, `ChatWindow`, `CountdownTimer`, `MentorCard`, etc.

You can paste this entire specification into a repo/IDE and ask your copilot things like:

- “Generate TypeScript types and Prisma schema (or SQL migrations) for the described tables.”  
- “Create Next.js pages and API routes that implement the booking flow described above.”  
- “Implement a countdown timer component that takes a `chatEndAt` ISO string and renders ‘Free chat available for next X days Y hours’ and disables input when expired.”

***

If you tell which part you want fleshed out into first-draft code contracts (e.g., API design, TypeScript interfaces, or DB schema in SQL/Prisma), a more code-oriented spec for that part can be created next.