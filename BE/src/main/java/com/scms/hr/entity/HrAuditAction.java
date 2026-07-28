package com.scms.hr.entity;

import java.util.Arrays;
import java.util.List;

/**
 * Các thao tác nhân sự được ghi vào nhật ký.
 * Mã lưu vào cột hr_audit_log.action, nhãn tiếng Việt dùng để hiển thị và lọc trên giao diện.
 */
public enum HrAuditAction {

    CREATE_EMPLOYEE("Thêm nhân viên", HrAuditTarget.EMPLOYEE),
    UPDATE_EMPLOYEE("Cập nhật nhân viên", HrAuditTarget.EMPLOYEE),
    DELETE_EMPLOYEE("Xóa nhân viên", HrAuditTarget.EMPLOYEE),
    REMOVE_FROM_DEPARTMENT("Gỡ khỏi phòng ban", HrAuditTarget.EMPLOYEE),

    CREATE_DEPARTMENT("Thêm phòng ban", HrAuditTarget.DEPARTMENT),
    UPDATE_DEPARTMENT("Cập nhật phòng ban", HrAuditTarget.DEPARTMENT),
    DELETE_DEPARTMENT("Xóa phòng ban", HrAuditTarget.DEPARTMENT),

    CREATE_ACCOUNT("Cấp tài khoản", HrAuditTarget.ACCOUNT),
    UPDATE_ROLES("Cập nhật vai trò", HrAuditTarget.ACCOUNT),
    LOCK_ACCOUNT("Khóa tài khoản", HrAuditTarget.ACCOUNT),
    UNLOCK_ACCOUNT("Mở khóa tài khoản", HrAuditTarget.ACCOUNT),
    RESET_PASSWORD("Đặt lại mật khẩu", HrAuditTarget.ACCOUNT),
    DELETE_ACCOUNT("Xóa tài khoản", HrAuditTarget.ACCOUNT);

    private final String label;
    private final HrAuditTarget target;

    HrAuditAction(String label, HrAuditTarget target) {
        this.label = label;
        this.target = target;
    }

    public String getLabel() {
        return label;
    }

    public HrAuditTarget getTarget() {
        return target;
    }

    public static List<HrAuditAction> all() {
        return Arrays.asList(values());
    }
}
