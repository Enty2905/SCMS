package com.scms.common.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.scms.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception) {
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
                ApiResponse.error(ErrorCode.INVALID_KEY.getCode(), message));
    }

    /**
     * Lỗi quyền truy cập (Access Denied)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(ErrorCode.ACCESS_DENIED.getStatusCode()).body(
                ApiResponse.error(ErrorCode.ACCESS_DENIED.getCode(), ErrorCode.ACCESS_DENIED.getMessage()));
    }

    /**
     * Xử lý lỗi không tìm thấy tài nguyên (NotFoundException)
     */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFoundException(NotFoundException ex) {
        return ResponseEntity.status(404).body(
                ApiResponse.error(404, ex.getMessage())
        );
    }

    /**
     * Xử lý lỗi trùng lặp tài nguyên (DuplicateResourceException)
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateResourceException(DuplicateResourceException ex) {
        return ResponseEntity.status(409).body(
                ApiResponse.error(409, ex.getMessage())
        );
    }

    /**
     * Xử lý lỗi tham số không hợp lệ (IllegalArgumentException)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(
                ApiResponse.error(400, ex.getMessage())
        );
    }

    /**
     * Xử lý lỗi nghiệp vụ (BadRequestException)
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<?>> handleBadRequestException(BadRequestException ex) {
        return ResponseEntity.badRequest().body(
                ApiResponse.error(400, ex.getMessage())
        );
    }

    /**
     * Lỗi ràng buộc dữ liệu của cơ sở dữ liệu (trùng khóa duy nhất, vi phạm khóa ngoại...).
     * Lưới an toàn cho những trường hợp nghiệp vụ chưa kiểm tra trước: trả 409 dễ hiểu
     * thay vì 500 "Uncategorized error".
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Database constraint violated", ex);

        return ResponseEntity.status(409).body(ApiResponse.error(409,
                "Dữ liệu bị trùng hoặc vi phạm ràng buộc. Vui lòng kiểm tra lại các trường không được trùng."));
    }

    /**
     * Bắt tất cả lỗi chưa xử lý khác (fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception exception) {
        log.error("Unhandled exception occurred", exception);

        // Debugging: return the exception message in the response
        String errorMessage = exception.getMessage();
        if (exception.getCause() != null) {
            errorMessage += " | Cause: " + exception.getCause().getMessage();
        }

        return ResponseEntity.internalServerError().body(
                ApiResponse.error(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(),
                        "Uncategorized error: " + errorMessage));
    }
}
