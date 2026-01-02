-- 1. Global Conventions
-- Engine: InnoDB
-- Charset: utf8mb4, collation: utf8mb4_unicode_ci

-- 2. Users & Mentors

-- 2.1 users
CREATE TABLE users (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  google_id             VARCHAR(191) NOT NULL,
  name                  VARCHAR(191) DEFAULT NULL,
  email                 VARCHAR(191) NOT NULL,
  phone_number          VARCHAR(30) NOT NULL,
  age                   INT NOT NULL,
  anonymous_username    VARCHAR(50) NOT NULL,
  role                  ENUM('user','mentor','admin') NOT NULL DEFAULT 'user',
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_users_google_id (google_id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_anon_username (anonymous_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 mentors
CREATE TABLE mentors (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL,
  headline              VARCHAR(191) DEFAULT NULL,
  bio                   TEXT,
  expertise_tags        VARCHAR(255) DEFAULT NULL, -- e.g. "breakup,anxiety,self-growth"
  languages             VARCHAR(255) DEFAULT NULL, -- e.g. "English,Hindi"
  experience_years      INT DEFAULT NULL,
  is_verified           TINYINT(1) NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_mentors_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Groups, Posts, Comments

-- 3.1 groups
CREATE TABLE groups (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                  VARCHAR(191) NOT NULL,
  slug                  VARCHAR(191) NOT NULL,
  description           TEXT,
  created_by            BIGINT UNSIGNED DEFAULT NULL, -- admin or system user
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_groups_slug (slug),
  CONSTRAINT fk_groups_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2 group_members
CREATE TABLE group_members (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id              BIGINT UNSIGNED NOT NULL,
  user_id               BIGINT UNSIGNED NOT NULL,
  joined_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_group_members (group_id, user_id),
  CONSTRAINT fk_group_members_group
    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_group_members_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.3 group_posts
CREATE TABLE group_posts (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id              BIGINT UNSIGNED NOT NULL,
  user_id               BIGINT UNSIGNED NOT NULL,
  content               TEXT NOT NULL,
  is_deleted            TINYINT(1) NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_group_posts_group_id (group_id),
  INDEX idx_group_posts_user_id (user_id),
  CONSTRAINT fk_group_posts_group
    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_group_posts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.4 group_comments
CREATE TABLE group_comments (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id               BIGINT UNSIGNED NOT NULL,
  user_id               BIGINT UNSIGNED NOT NULL,
  content               TEXT NOT NULL,
  is_deleted            TINYINT(1) NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_group_comments_post_id (post_id),
  INDEX idx_group_comments_user_id (user_id),
  CONSTRAINT fk_group_comments_post
    FOREIGN KEY (post_id) REFERENCES group_posts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_group_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Mentor Plans, Bookings, Chats

-- 4.1 mentor_plans
CREATE TABLE mentor_plans (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mentor_id             BIGINT UNSIGNED NOT NULL,
  title                 VARCHAR(191) NOT NULL,
  description           TEXT,
  price_in_inr          INT NOT NULL,
  session_duration_min  INT DEFAULT NULL, -- optional
  chat_window_days      INT NOT NULL,     -- e.g. 3/5/7
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_mentor_plans_mentor_id (mentor_id),
  CONSTRAINT fk_mentor_plans_mentor
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2 bookings
CREATE TABLE bookings (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL,
  mentor_id             BIGINT UNSIGNED NOT NULL,
  mentor_plan_id        BIGINT UNSIGNED NOT NULL,
  status                ENUM('pending','confirmed','cancelled','expired') NOT NULL DEFAULT 'pending',
  payment_reference     VARCHAR(191) DEFAULT NULL,
  amount_paid_in_inr    INT NOT NULL,
  session_start_at      DATETIME DEFAULT NULL,
  session_end_at        DATETIME DEFAULT NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_bookings_user_id (user_id),
  INDEX idx_bookings_mentor_id (mentor_id),
  INDEX idx_bookings_plan_id (mentor_plan_id),
  INDEX idx_bookings_status (status),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_mentor
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_plan
    FOREIGN KEY (mentor_plan_id) REFERENCES mentor_plans(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.3 chats
CREATE TABLE chats (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id            BIGINT UNSIGNED NOT NULL,
  user_id               BIGINT UNSIGNED NOT NULL,
  mentor_id             BIGINT UNSIGNED NOT NULL,
  chat_start_at         DATETIME NOT NULL,
  chat_end_at           DATETIME NOT NULL,
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_chats_booking (booking_id),
  INDEX idx_chats_user_id (user_id),
  INDEX idx_chats_mentor_id (mentor_id),
  INDEX idx_chats_active (is_active),
  CONSTRAINT fk_chats_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_chats_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_chats_mentor
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.4 chat_messages
CREATE TABLE chat_messages (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chat_id               BIGINT UNSIGNED NOT NULL,
  sender_id             BIGINT UNSIGNED NOT NULL,
  message_text          TEXT NOT NULL,
  sent_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_chat_messages_chat_id (chat_id),
  INDEX idx_chat_messages_sender_id (sender_id),
  INDEX idx_chat_messages_sent_at (sent_at),
  CONSTRAINT fk_chat_messages_chat
    FOREIGN KEY (chat_id) REFERENCES chats(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_chat_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Session Notes

-- 5.1 session_notes
CREATE TABLE session_notes (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id            BIGINT UNSIGNED NOT NULL,
  mentor_id             BIGINT UNSIGNED NOT NULL,
  user_id               BIGINT UNSIGNED NOT NULL,
  notes_text            TEXT,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_session_notes_booking (booking_id),
  CONSTRAINT fk_session_notes_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_session_notes_mentor
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_session_notes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notifications / Email Logs

-- 6.1 notification_logs
CREATE TABLE notification_logs (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL,
  type                  VARCHAR(50) NOT NULL, -- e.g. booking_confirmed, chat_started, new_message
  reference_type        VARCHAR(50) DEFAULT NULL, -- booking, chat, message
  reference_id          BIGINT UNSIGNED DEFAULT NULL,
  sent_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status                ENUM('success','failed') NOT NULL DEFAULT 'success',
  error_message         VARCHAR(255) DEFAULT NULL,

  INDEX idx_notification_logs_user_id (user_id),
  INDEX idx_notification_logs_type (type),
  CONSTRAINT fk_notification_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
