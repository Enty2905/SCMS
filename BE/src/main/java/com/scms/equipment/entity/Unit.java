package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "unit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE unit SET is_deleted = true WHERE unit_id = ?")
@SQLRestriction("is_deleted = false")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "unit_id", columnDefinition = "BINARY(16)")
    private UUID unitId;

    @Column(name = "symbol", nullable = false, unique = true, length = 50)
    private String symbol;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
