package com.scms.inventory.tool.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "tool")
@SQLDelete(sql = "UPDATE tool SET is_deleted = true WHERE tool_id = ?")
@SQLRestriction("is_deleted = false")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Tool {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tool_id")
    UUID toolId;

    @Column(name = "name", length = 255, nullable = false)
    String name;

    @Column(name = "category", length = 100)
    String category;

    @Column(name = "total_quantity", nullable = false)
    Integer totalQuantity;

    @Column(name = "available_quantity", nullable = false)
    Integer availableQuantity;

    @Column(name = "damaged_quantity", nullable = false, columnDefinition = "INT NOT NULL DEFAULT 0")
    Integer damagedQuantity;

    // 'available' | 'damaged'
    @Column(name = "status", length = 20, nullable = false)
    String status;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "is_deleted")
    @Builder.Default
    Boolean isDeleted = false;

    @Column(name = "image_url", length = 500)
    String imageUrl;
}
