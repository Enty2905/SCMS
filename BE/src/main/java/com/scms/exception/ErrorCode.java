package com.scms.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    // Lỗi chung
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND(404, "Resource not found", HttpStatus.NOT_FOUND),
    ACCESS_DENIED(403, "Access Denied", HttpStatus.FORBIDDEN),
    INVALID_KEY(400, "Invalid request or ID format", HttpStatus.BAD_REQUEST),

    // Lỗi Auth / User
    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    USER_EXISTED(1001, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "User not found", HttpStatus.NOT_FOUND),
    USERNAME_ALREADY_EXISTS(1003, "Username already exists", HttpStatus.BAD_REQUEST),
    ACCOUNT_DISABLED(1004, "Account is disabled", HttpStatus.FORBIDDEN),
    TOKEN_INVALID(1005, "Token is invalid or expired", HttpStatus.UNAUTHORIZED),
    EMPLOYEE_NOT_FOUND(1006, "Employee not found", HttpStatus.NOT_FOUND),
    EMPLOYEE_ALREADY_HAS_ACCOUNT(1007, "Employee already has an account", HttpStatus.BAD_REQUEST),
    USER_ACCOUNT_NOT_FOUND(1008, "User account not found", HttpStatus.NOT_FOUND),

    // Lỗi thiết bị (Equipment)
    EQUIPMENT_NOT_FOUND(2001, "Equipment not found", HttpStatus.NOT_FOUND),
    EQUIPMENT_SYSTEM_NOT_FOUND(2002, "Equipment system not found", HttpStatus.NOT_FOUND),

    // Lỗi phiếu công tác / Sự cố (Work Order / Repair Request)
    REPAIR_REQUEST_NOT_FOUND(3001, "Repair request not found", HttpStatus.NOT_FOUND),
    WORK_ORDER_NOT_FOUND(3002, "Work order not found", HttpStatus.NOT_FOUND),
    WORK_ORDER_INVALID_STATUS(3003, "Invalid status transition for work order", HttpStatus.BAD_REQUEST),

    // Lỗi vật tư (Material / Consumable / Spare Part)
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
