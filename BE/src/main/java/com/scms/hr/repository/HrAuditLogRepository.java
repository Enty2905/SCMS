package com.scms.hr.repository;

import com.scms.hr.entity.HrAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HrAuditLogRepository
        extends JpaRepository<HrAuditLog, UUID>, JpaSpecificationExecutor<HrAuditLog> {
}
