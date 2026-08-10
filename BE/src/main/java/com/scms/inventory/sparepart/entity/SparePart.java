package com.scms.inventory.sparepart.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.SQLDelete;

import java.util.UUID;

@Entity
@Table(name = "spare_part")
@SQLDelete(sql = "UPDATE spare_part SET is_deleted = true WHERE spare_part_id = ?")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "spare_part_id")
    UUID sparePartId;

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
