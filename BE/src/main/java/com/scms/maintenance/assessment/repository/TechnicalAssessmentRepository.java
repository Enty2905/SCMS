package com.scms.maintenance.assessment.repository;

import com.scms.maintenance.assessment.entity.TechnicalAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TechnicalAssessmentRepository extends JpaRepository<TechnicalAssessment, UUID> {

    @Query("""
        SELECT DISTINCT ta FROM TechnicalAssessment ta
        LEFT JOIN FETCH ta.equipment
        LEFT JOIN FETCH ta.createdBy cb
        LEFT JOIN FETCH cb.position
        LEFT JOIN FETCH ta.repairSignedBy rsb
        LEFT JOIN FETCH rsb.position
        LEFT JOIN FETCH ta.operationSignedBy osb
        LEFT JOIN FETCH osb.position
        WHERE ta.assessmentId = :id
    """)
    Optional<TechnicalAssessment> findByIdWithDetails(@Param("id") UUID id);
}
