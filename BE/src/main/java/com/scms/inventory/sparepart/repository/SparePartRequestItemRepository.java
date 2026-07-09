package com.scms.inventory.sparepart.repository;

import com.scms.inventory.sparepart.entity.SparePartRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SparePartRequestItemRepository extends JpaRepository<SparePartRequestItem, UUID> {
}
