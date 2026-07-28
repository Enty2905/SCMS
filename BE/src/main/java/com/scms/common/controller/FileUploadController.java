package com.scms.common.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/common/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Upload Test", description = "API test chức năng upload ảnh lên Cloudinary")
public class FileUploadController {

    CloudinaryService cloudinaryService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload 1 ảnh lên Cloudinary", description = "Upload ảnh vào thư mục SCMS")
    public ApiResponse<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "scms") String folder) {
        
        // Gọi service upload, truyền vào thư mục lưu trữ trên Cloudinary
        String imageUrl = cloudinaryService.uploadFile(file, folder);
        
        return ApiResponse.<String>builder()
                .status(200)
                .message("Upload ảnh thành công")
                .data(imageUrl)
                .build();
    }
}
