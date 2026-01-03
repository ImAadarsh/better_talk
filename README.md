# BetterTalk 🌿
> *Your Journey to Mental Wellness Starts Here.*

**BetterTalk** is a comprehensive mental health platform designed to bridge the gap between users seeking support and qualified mentors or therapists. Built with a focus on privacy, accessibility, and community, BetterTalk offers a seamless experience for booking sessions, joining support groups, and fostering meaningful connections.

---

## 🌟 Comprehensive Feature Guide

BetterTalk provides a tailored experience for three distinct user roles: **Patients**, **Therapists**, and **Administrators**.

### 👤 For Patients (Users)

#### 1. **Anonymous & Safe Environment**
   - **Privacy First**: Users can create profiles with anonymous usernames, ensuring their identity remains protected while interacting in public spaces like groups.
   - **Secure Data**: All personal data is encrypted and securely stored.

#### 2. **Mental Health Stories**
   - **Community Sharing**: Users can share their personal mental health journeys or "Stories" to inspire and support others.
   - **Engagement**: Read stories from others, leave supportive comments, and build a sense of belonging.
   - **Rich Media**: Stories support rich text and emotional expression.

#### 3. **Support Groups**
   - **Thematic Groups**: Join groups focused on specific topics like "Anxiety", "Depression", "Self-Growth", etc.
   - **Discussion Forums**: Post questions, share experiences, and reply to others within the group.
   - **Moderation**: All group content is moderated to ensure a safe and positive environment.

#### 4. **Therapist Discovery & Booking**
   - **Advanced Search**: Filter therapists by expertise (e.g., CBT, Trauma, Relationships), language, and experience level.
   - **Detailed Profiles**: View comprehensive therapist profiles including:
     - **Bio & Headline**: Get to know the therapist's approach.
     - **Expertise Tags**: Quickly identify their specializations.
     - **Ratings & Reviews**: See feedback from other patients.
   - **Flexible Booking**: Choose from available time slots that fit your schedule.
   - **Multiple Plans**: Select from various pricing plans (one-time consultation, monthly packages, etc.).

#### 5. **Session Experience**
   - **Integrated Video/Chat**: Join sessions directly through the platform via secure video links or chat windows.
   - **Session History**: Keep track of all past and upcoming appointments.
   - **Rescheduling**: Easily request to reschedule a session if something comes up.

---

### 🧠 For Therapists (Mentors)

#### 1. **Professional Profile Management**
   - **Brand Building**: customizable profile with a professional headline, bio, and profile picture.
   - **Expertise Showcase**: Add tags for specializations (e.g., Anxiety, Career Counseling) and languages spoken.
   - **Verification Badge**: Earn a "Verified" badge after admin approval, increasing trust with patients.

#### 2. **Practice Management Dashboard**
   - **Overview**: Get a snapshot of upcoming sessions, earnings, and new booking requests.
   - **Slot Management**: Set availability for specific days and times.
   - **Session Control**: Mark sessions as completed, cancelled, or rescheduled.

#### 3. **Patient Interaction Tools**
   - **Secure Notes**: Take private notes for each patient session to track progress over time. These are only visible to the therapist.
   - **Chat System**: A dedicated chat window for each active booking allows for pre-session or post-session communication (active for a set duration, e.g., 3-7 days).
   - **Resource Sharing**: Send helpful links or documents to patients via chat.

#### 4. **Financial Tracking**
   - **Earnings Reports**: View detailed breakdowns of income from sessions.
   - **Payout History**: Track previous payouts and pending balances.

---

### 🛡️ For Administrators

#### 1. **Master Dashboard**
   - **Analytics**: View real-time statistics on:
     - Total Users & Therapists
     - Total Bookings (Daily/Monthly/Yearly)
     - Revenue & Commission stats
   - **Growth Metrics**: Track platform growth and engagement trends.

#### 2. **User & Content Management**
   - **User Control**: View, edit, or ban users who violate community guidelines.
   - **Therapist Approval**: Review and approve new therapist applications to ensure quality.
   - **Content Moderation**: Monitor and moderate stories, group posts, and comments to maintain safety.

#### 3. **Booking & Financial Oversight**
   - **Transaction Logs**: View a complete history of all payments and refunds.
   - **Booking Management**: Intervene in bookings if necessary (e.g., manual cancellation or rescheduling disputes).
   - **Commissions**: Configure and manage the platform's commission rates.

---

## 🛠️ Technical Specifications

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router) for high performance and SEO.
- **Styling**: Tailwind CSS with custom design tokens for a premium, accessible UI.
- **Backend API**: Next.js API Routes (Serverless functions).
- **Database**: MySQL with a normalized schema for data integrity.
- **Authentication**: JWT-based auth with support for OAuth (Google).
- **Real-time**: Polling/SWR for near real-time updates on chats and bookings.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)

### Installation Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/better-talk.git
   cd better-talk
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env.local`:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=better_talk

   # App
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Initialize Database**
   Run the SQL scripts provided in `setup/better-talk-db.md` to create the schema.

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to see the app live.

---

## 👨‍💻 Developer Team

**Developed by Endeavour Digital**

*We craft digital experiences that empower communities.*

- **Company Website**: [endeavourdigital.in](https://endeavourdigital.in)
- **Contact**: +91 6363380920

---

> © 2026 BetterTalk. All rights reserved.
