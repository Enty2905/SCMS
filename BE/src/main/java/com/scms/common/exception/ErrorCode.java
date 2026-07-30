package com.scms.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND(404, "Resource not found", HttpStatus.NOT_FOUND),
    ACCESS_DENIED(403, "Access Denied", HttpStatus.FORBIDDEN),
    INVALID_KEY(400, "Invalid request or ID format", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(400, "Invalid request parameter", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    USER_EXISTED(1001, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "User not found", HttpStatus.NOT_FOUND),
    USERNAME_ALREADY_EXISTS(1003, "Username already exists", HttpStatus.BAD_REQUEST),
    ACCOUNT_DISABLED(1004, "Account is disabled", HttpStatus.FORBIDDEN),
    TOKEN_INVALID(1005, "Token is invalid or expired", HttpStatus.UNAUTHORIZED),
    EMPLOYEE_NOT_FOUND(1006, "Employee not found", HttpStatus.NOT_FOUND),
    EMPLOYEE_ALREADY_HAS_ACCOUNT(1007, "Employee already has an account", HttpStatus.BAD_REQUEST),
    WRONG_PASSWORD(1008, "Wrong password", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD(1009, "New password must be different from old password", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1010, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(1011, "Role already exists", HttpStatus.BAD_REQUEST),
    USER_INACTIVE(1012, "User account is inactive", HttpStatus.FORBIDDEN),
    USER_ACCOUNT_NOT_FOUND(1013, "User account not found", HttpStatus.NOT_FOUND),

    EQUIPMENT_NOT_FOUND(2001, "Equipment system not found", HttpStatus.NOT_FOUND),
    EQUIPMENT_SYSTEM_NOT_FOUND(2002, "Equipment system not found", HttpStatus.NOT_FOUND),

    REPAIR_REQUEST_NOT_FOUND(3001, "Repair request not found", HttpStatus.NOT_FOUND),
    WORK_ORDER_NOT_FOUND(3002, "Work order not found", HttpStatus.NOT_FOUND),
    WORK_ORDER_INVALID_STATUS(3003, "Invalid status transition for work order", HttpStatus.BAD_REQUEST),
    DUPLICATE_ORDER_NUMBER(3004, "Work order number already exists", HttpStatus.BAD_REQUEST),
    SAFETY_SUPERVISOR_MUST_BE_UNIQUE(3005, "Giám sát an toàn phải khác Lãnh đạo thi công, Chỉ huy trực tiếp và Thành viên thi công", HttpStatus.BAD_REQUEST),
    DAILY_LOG_ALREADY_OPEN(3006, "Trong ngày đã có phiên làm việc đang mở. Vui lòng đóng trước khi mở phiên mới.", HttpStatus.BAD_REQUEST),
    NO_ACTIVE_LOG_TO_CLOSE(3007, "Không có phiên làm việc nào đang mở để đóng.", HttpStatus.BAD_REQUEST),
    WORK_ORDER_NOT_LOCKED(3008, "Phiếu công tác chưa hoàn thành (locked), không thể upload PDF đã ký", HttpStatus.BAD_REQUEST),

    MATERIAL_NOT_FOUND(4001, "Material not found", HttpStatus.NOT_FOUND),
    NOT_ENOUGH_INVENTORY(4002, "Not enough inventory to issue", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
