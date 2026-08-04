USE scms_db;

CREATE TABLE IF NOT EXISTS group_chat_room (
    room_id BINARY(16) NOT NULL,
    room_name VARCHAR(150) NOT NULL,
    owner_user_id BINARY(16) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (room_id),
    KEY idx_group_chat_owner (owner_user_id),
    KEY idx_group_chat_updated (updated_at),
    CONSTRAINT fk_group_chat_room_owner
        FOREIGN KEY (owner_user_id) REFERENCES `user` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Phòng chat nhóm do người dùng tạo';

CREATE TABLE IF NOT EXISTS group_chat_member (
    member_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    room_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    added_by_user_id BINARY(16) NOT NULL,
    joined_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (member_id),
    UNIQUE KEY uk_group_chat_member (room_id, user_id),
    KEY idx_group_chat_member_user (user_id, room_id),
    CONSTRAINT fk_group_chat_member_room
        FOREIGN KEY (room_id) REFERENCES group_chat_room (room_id),
    CONSTRAINT fk_group_chat_member_user
        FOREIGN KEY (user_id) REFERENCES `user` (user_id),
    CONSTRAINT fk_group_chat_member_added_by
        FOREIGN KEY (added_by_user_id) REFERENCES `user` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thành viên của phòng chat nhóm';

CREATE TABLE IF NOT EXISTS group_chat_message (
    message_sequence BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    message_id BINARY(16) NOT NULL,
    room_id BINARY(16) NOT NULL,
    sender_user_id BINARY(16) NOT NULL,
    client_message_id BINARY(16) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (message_sequence),
    UNIQUE KEY uk_group_chat_message_id (message_id),
    UNIQUE KEY uk_group_chat_sender_client (sender_user_id, client_message_id),
    KEY idx_group_chat_message_room_sequence (room_id, message_sequence),
    KEY idx_group_chat_message_room_created (room_id, created_at),
    CONSTRAINT fk_group_chat_message_room
        FOREIGN KEY (room_id) REFERENCES group_chat_room (room_id),
    CONSTRAINT fk_group_chat_message_sender
        FOREIGN KEY (sender_user_id) REFERENCES `user` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tin nhắn trong phòng chat nhóm';

CREATE TABLE IF NOT EXISTS group_chat_read_state (
    read_state_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    room_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    last_read_sequence BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (read_state_id),
    UNIQUE KEY uk_group_chat_read_room_user (room_id, user_id),
    KEY idx_group_chat_read_user (user_id),
    CONSTRAINT fk_group_chat_read_room
        FOREIGN KEY (room_id) REFERENCES group_chat_room (room_id),
    CONSTRAINT fk_group_chat_read_user
        FOREIGN KEY (user_id) REFERENCES `user` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Vị trí đọc gần nhất của thành viên trong phòng chat nhóm';
