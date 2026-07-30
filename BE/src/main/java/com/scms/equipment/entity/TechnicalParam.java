package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "technical_param")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE technical_param SET is_deleted = true WHERE param_id = ?")
@SQLRestriction("is_deleted = false")
public class TechnicalParam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "param_id", columnDefinition = "BINARY(16)")
    private UUID paramId;

    @Column(name = "param_name", nullable = false, unique = true, length = 150)
    private String paramName;

    @Column(name = "data_type", nullable = false, length = 30)
    @Builder.Default
    private String dataType = "text";

    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
