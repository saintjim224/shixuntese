SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS resume_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120),
  file_size BIGINT NOT NULL DEFAULT 0,
  parsed_text MEDIUMTEXT,
  analysis_json MEDIUMTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @has_resume_document_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'applications'
    AND COLUMN_NAME = 'resume_document_id'
);

SET @add_resume_document_id := IF(
  @has_resume_document_id = 0,
  'ALTER TABLE applications ADD COLUMN resume_document_id BIGINT NULL AFTER applicant_id',
  'SELECT 1'
);
PREPARE stmt FROM @add_resume_document_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_fk_application_resume_document := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'applications'
    AND CONSTRAINT_NAME = 'fk_application_resume_document'
);

SET @add_fk_application_resume_document := IF(
  @has_fk_application_resume_document = 0,
  'ALTER TABLE applications ADD CONSTRAINT fk_application_resume_document FOREIGN KEY (resume_document_id) REFERENCES resume_documents(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @add_fk_application_resume_document;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
