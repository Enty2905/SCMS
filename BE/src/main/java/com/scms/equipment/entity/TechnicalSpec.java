package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "technical_spec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicalSpec {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "spec_id", columnDefinition = "BINARY(16)")
    private UUID specId;

    @Column(name = "equipment_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID equipmentId;

    @Column(name = "param_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID paramId;

    @Column(name = "param_value", length = 255)
    private String paramValue;

    @Column(name = "unit_id", columnDefinition = "BINARY(16)")
    private UUID unitId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "param_id", referencedColumnName = "param_id", insertable = false, updatable = false)
    private TechnicalParam parameter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id", referencedColumnName = "unit_id", insertable = false, updatable = false)
    private Unit unit;
}
