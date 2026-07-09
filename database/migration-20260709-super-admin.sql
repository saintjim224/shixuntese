ALTER TABLE users
  MODIFY role ENUM('APPLICANT', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'APPLICANT';

UPDATE users
SET password_hash = '6ec0934c65ba0f8e1a101ef13bf1e85678811342d21984fe7041d519cfc1c6d4',
    role = 'SUPER_ADMIN',
    full_name = 'Saintjim',
    email = 'saintjim@test1.com',
    status = 'ACTIVE'
WHERE username = 'Saintjim';

UPDATE users
SET username = 'Saintjim',
    password_hash = '6ec0934c65ba0f8e1a101ef13bf1e85678811342d21984fe7041d519cfc1c6d4',
    role = 'SUPER_ADMIN',
    full_name = 'Saintjim',
    email = 'saintjim@test1.com',
    status = 'ACTIVE'
WHERE username = 'admin'
  AND NOT EXISTS (SELECT 1 FROM (SELECT id FROM users WHERE username = 'Saintjim') AS existing_user);

INSERT INTO users (username, password_hash, role, full_name, email, phone, status)
SELECT 'Saintjim',
       '6ec0934c65ba0f8e1a101ef13bf1e85678811342d21984fe7041d519cfc1c6d4',
       'SUPER_ADMIN',
       'Saintjim',
       'saintjim@test1.com',
       '13800000000',
       'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'Saintjim');
