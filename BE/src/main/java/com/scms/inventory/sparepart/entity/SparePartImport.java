package com.scms.inventory.sparepart.entity;

import com.scms.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "spare_part_import")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartImport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "import_id")
    UUID importId;

    @Column(name = "import_number", length = 50, nullable = false, unique = true)
    String importNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imported_by")
    User importedBy;

    @Column(name = "imported_at", nullable = false)
    LocalDateTime importedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @OneToMany(mappedBy = "sparePartImport", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<SparePartImportItem> items;

    @PrePersist
    public void prePersist() {
        if (importedAt == null) {
            importedAt = LocalDateTime.now();
        }
    }
}
