package com.scms.inventory.tool.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tool_borrow")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToolBorrow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "borrow_id")
    UUID borrowId;

    @Column(name = "tool_id", nullable = false)
    UUID toolId;

    @Column(name = "borrowed_by", nullable = false)
    UUID borrowedBy;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "remaining_quantity", nullable = false)
    Integer remainingQuantity;

    @Column(name = "borrowed_at", nullable = false)
    LocalDateTime borrowedAt;

    @Column(name = "due_date")
    LocalDateTime dueDate;

    @Column(name = "returned_at")
    LocalDateTime returnedAt;

    // 'borrowing' | 'returned' | 'overdue'
    @Column(name = "status", length = 20, nullable = false)
    String status;

    @Column(name = "note", length = 500)
    String note;
}
