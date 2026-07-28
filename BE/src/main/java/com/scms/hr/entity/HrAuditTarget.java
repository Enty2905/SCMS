package com.scms.hr.entity;

/**
 * Loại đối tượng bị tác động trong một thao tác nhân sự.
 */
public enum HrAuditTarget {

    EMPLOYEE("Nhân viên"),
    DEPARTMENT("Phòng ban"),
    ACCOUNT("Tài khoản");

    private final String label;

    HrAuditTarget(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
