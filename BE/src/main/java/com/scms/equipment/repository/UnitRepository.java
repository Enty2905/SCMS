package com.scms.equipment.repository;

import com.scms.equipment.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UnitRepository extends JpaRepository<Unit, UUID> {
}
