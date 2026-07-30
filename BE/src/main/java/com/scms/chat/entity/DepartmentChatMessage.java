package com.scms.chat.entity;

import com.scms.auth.entity.User;
import com.scms.department.entity.Department;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "department_chat_message",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_chat_sender_client_message",
                columnNames = {"sender_user_id", "client_message_id"}
        ),
        indexes = {
                @Index(
                        name = "idx_chat_department_sequence",
                        columnList = "department_id, message_sequence"
                ),
                @Index(
                        name = "idx_chat_department_created",
                        columnList = "department_id, created_at"
                ),
                @Index(name = "idx_chat_sender", columnList = "sender_user_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_sequence")
    Long sequence;

    @Column(name = "message_id", nullable = false, unique = true)
    UUID messageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    Department department;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_user_id", nullable = false)
    User sender;

    @Column(name = "client_message_id", nullable = false)
    UUID clientMessageId;

    @Column(name = "content", nullable = false, length = 2000)
    String content;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (messageId == null) {
            messageId = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
