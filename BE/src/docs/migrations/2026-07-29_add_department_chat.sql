USE scms_db;

CREATE TABLE IF NOT EXISTS department_chat_message (
    message_sequence BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    message_id BINARY(16) NOT NULL,
    department_id BINARY(16) NOT NULL,
    sender_user_id BINARY(16) NOT NULL,
    client_message_id BINARY(16) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (message_sequence),
    UNIQUE KEY uk_chat_message_id (message_id),
    UNIQUE KEY uk_chat_sender_client_message (sender_user_id, client_message_id),
    KEY idx_chat_department_sequence (department_id, message_sequence),
    KEY idx_chat_department_created (department_id, created_at),
    KEY idx_chat_sender (sender_user_id),
    CONSTRAINT fk_chat_message_department
        FOREIGN KEY (department_id) REFERENCES department (department_id),
    CONSTRAINT fk_chat_message_sender
        FOREIGN KEY (sender_user_id) REFERENCES `user` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tin nhắn nội bộ theo phòng ban';

CREATE TABLE IF NOT EXISTS department_chat_read_state (
    read_state_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    last_read_sequence BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (read_state_id),
    UNIQUE KEY uk_chat_read_department_user (department_id, user_id),
    KEY idx_chat_read_user (user_id),
    CONSTRAINT fk_chat_read_department
        FOREIGN KEY (department_id) REFERENCES department (department_id),
    CONSTRAINT fk_chat_read_user
        FOREIGN KEY (user_id) REFERENCES `user` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Vị trí đọc gần nhất của từng tài khoản trong phòng chat';
