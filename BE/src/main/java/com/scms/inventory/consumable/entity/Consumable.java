package com.scms.inventory.consumable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "consumable")
@SQLDelete(sql = "UPDATE consumable SET is_deleted = true WHERE consumable_id = ?")
@SQLRestriction("is_deleted = false")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Consumable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "consumable_id")
    UUID consumableId;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    String code;

    @Column(name = "name", length = 255, nullable = false)
    String name;

    @Column(name = "unit", length = 50)
    String unit;

    @Column(name = "min_quantity")
    Integer minQuantity;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "is_deleted")
    @Builder.Default
    Boolean isDeleted = false;
}
