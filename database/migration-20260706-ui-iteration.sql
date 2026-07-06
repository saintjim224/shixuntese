SET NAMES utf8mb4;

DELIMITER //
CREATE PROCEDURE qitoffer_add_column_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND column_name = p_column_name
  ) THEN
    SET @qitoffer_ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_definition);
    PREPARE qitoffer_stmt FROM @qitoffer_ddl;
    EXECUTE qitoffer_stmt;
    DEALLOCATE PREPARE qitoffer_stmt;
  END IF;
END//
DELIMITER ;

CALL qitoffer_add_column_if_missing('companies', 'banner_url', '`banner_url` VARCHAR(255) AFTER `logo_url`');
CALL qitoffer_add_column_if_missing('companies', 'founded_year', '`founded_year` INT AFTER `scale`');
CALL qitoffer_add_column_if_missing('companies', 'financing_stage', '`financing_stage` VARCHAR(80) AFTER `founded_year`');
CALL qitoffer_add_column_if_missing('companies', 'rating', '`rating` DECIMAL(3,1) DEFAULT 4.6 AFTER `financing_stage`');
CALL qitoffer_add_column_if_missing('jobs', 'highlights', '`highlights` VARCHAR(255) AFTER `headcount`');
CALL qitoffer_add_column_if_missing('applications', 'interview_response', '`interview_response` ENUM(''PENDING'', ''ACCEPTED'', ''DECLINED'') NOT NULL DEFAULT ''PENDING'' AFTER `message`');

DROP PROCEDURE qitoffer_add_column_if_missing;

CREATE TABLE IF NOT EXISTS resume_educations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  school VARCHAR(120) NOT NULL,
  degree VARCHAR(40),
  major VARCHAR(80),
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_education_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS resume_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  company VARCHAR(120) NOT NULL,
  position VARCHAR(120),
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_experience_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS resume_projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  role_name VARCHAR(120),
  tech_stack VARCHAR(255),
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_project_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS resume_skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(80) NOT NULL,
  level_name VARCHAR(40),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_skill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS resume_certificates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  issuer VARCHAR(120),
  acquired_date VARCHAR(20),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_certificate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS job_favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_id BIGINT NOT NULL,
  applicant_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_job_favorite (job_id, applicant_id),
  CONSTRAINT fk_favorite_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_user FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

UPDATE companies
SET banner_url = COALESCE(NULLIF(banner_url, ''), '/assets/enterprise/team-collaboration.jpg'),
    founded_year = COALESCE(founded_year, 2019),
    financing_stage = COALESCE(NULLIF(financing_stage, ''), '成长型企业'),
    rating = COALESCE(rating, 4.6);

UPDATE jobs
SET highlights = COALESCE(NULLIF(highlights, ''), '五险一金,弹性工作,技术氛围')
WHERE status = 'OPEN';
