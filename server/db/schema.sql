CREATE DATABASE mirrova;

\c mirrova;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  avatar_initials VARCHAR(4),
  mode VARCHAR(50) DEFAULT 'choosing',
  theme VARCHAR(20) DEFAULT 'ivory',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_field VARCHAR(255),
  dream_direction VARCHAR(255),
  top_skill VARCHAR(255),
  biggest_fear TEXT,
  recent_rejection TEXT,
  success_vision TEXT,
  resume_text TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE future_selves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path_index INT,
  job_title VARCHAR(255),
  company_type VARCHAR(255),
  city VARCHAR(100),
  year INT DEFAULT 2029,
  salary_min INT,
  salary_max INT,
  intro_quote TEXT,
  full_persona TEXT,
  is_chosen BOOLEAN DEFAULT false,
  resonance_score INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  future_self_id UUID REFERENCES future_selves(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  resonance_signal INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blind_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  future_self_id UUID REFERENCES future_selves(id),
  recruiter_impression TEXT,
  critical_gaps JSONB,
  soft_gaps JSONB,
  strengths JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE spark_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  future_self_id UUID REFERENCES future_selves(id),
  month1_theme VARCHAR(100),
  month2_theme VARCHAR(100),
  month3_theme VARCHAR(100),
  tasks JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_number INT,
  rating INT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_future_selves_user ON future_selves(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(future_self_id);
CREATE INDEX idx_blind_spots_user ON blind_spots(user_id);
CREATE INDEX idx_spark_plans_user ON spark_plans(user_id);