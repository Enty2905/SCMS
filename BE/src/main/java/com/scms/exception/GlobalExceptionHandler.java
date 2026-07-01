package com.scms.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.scms.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.UUID;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý các exception do logic nghiệp vụ (custom AppException)
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse<?> apiResponse = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    /**
     * Xử lý các lỗi validate (ví dụ: @NotNull, @Size, @Email...)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode;
        try {
            errorCode = ErrorCode.valueOf(enumKey); // ánh xạ sang enum nếu khớp
        } catch (IllegalArgumentException e) {
            errorCode = ErrorCode.INVALID_KEY; // fallback nếu không khớp
        }

        ApiResponse<?> apiResponse = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    /**
     * Xử lý lỗi parse JSON — thường gặp khi UUID không đúng định dạng
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleJsonParseError(HttpMessageNotReadableException ex) {
        String message = "Invalid request format";

        if (ex.getCause() instanceof InvalidFormatException invalidFormatException) {
            if (invalidFormatException.getTargetType().equals(UUID.class)) {
                message = "Invalid UUID format";
            }
        }

        return ResponseEntity.badRequest().body(
                ApiResponse.error(ErrorCode.INVALID_KEY.getCode(), message)
        );
    }

    /**
     * Lỗi quyền truy cập (Access Denied)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(ErrorCode.ACCESS_DENIED.getStatusCode()).body(
                ApiResponse.error(ErrorCode.ACCESS_DENIED.getCode(), ErrorCode.ACCESS_DENIED.getMessage())
        );
    }

    /**
     * Bắt tất cả lỗi chưa xử lý khác (fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception exception) {
        log.error("Unhandled exception occurred", exception);

        return ResponseEntity.internalServerError().body(
                ApiResponse.error(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(), ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
        );
    }
}
