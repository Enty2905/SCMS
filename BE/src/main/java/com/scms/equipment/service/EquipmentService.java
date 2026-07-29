package com.scms.equipment.service;

import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.equipment.dto.request.EquipmentRequest;
import com.scms.equipment.dto.response.EquipmentResponse;
import com.scms.equipment.dto.response.EquipmentImageResponse;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.entity.EquipmentImage;
import com.scms.equipment.repository.EquipmentRepository;
import com.scms.equipment.repository.EquipmentSystemRepository;
import com.scms.equipment.repository.EquipmentImageRepository;
import com.scms.auth.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;


import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EquipmentService {

    EquipmentRepository equipmentRepository;
    EquipmentSystemRepository equipmentSystemRepository;
    EquipmentImageRepository equipmentImageRepository;
    UserRepository userRepository;

    // ── Tạo mới thiết bị ──────────────────────────────────────
    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        log.info("Creating equipment: {}", request.getEquipmentName());

        if (request.getSystemId() != null && !equipmentSystemRepository.existsById(request.getSystemId())) {
            throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
        }

        Equipment equipment = Equipment.builder()
                .kksCode(request.getKksCode())
                .equipmentName(request.getEquipmentName())
                .equipmentType(request.getEquipmentType())
                .status(request.getStatus())
                .location(request.getLocation())
                .systemId(request.getSystemId())
                .build();

        equipment = equipmentRepository.save(equipment);
        log.info("Equipment created with id: {}", equipment.getId());
        return toEquipmentResponse(equipment);
    }

    // ── Cập nhật thiết bị ─────────────────────────────────────
    @Transactional
    public EquipmentResponse updateEquipment(UUID id, EquipmentRequest request) {
        log.info("Updating equipment with id: {}", id);

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));

        if (request.getSystemId() != null && !equipmentSystemRepository.existsById(request.getSystemId())) {
            throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
        }

        equipment.setKksCode(request.getKksCode());
        equipment.setEquipmentName(request.getEquipmentName());
        equipment.setEquipmentType(request.getEquipmentType());
        equipment.setStatus(request.getStatus());
        equipment.setLocation(request.getLocation());
        equipment.setSystemId(request.getSystemId());

        return toEquipmentResponse(equipmentRepository.save(equipment));
    }

    // ── Lấy chi tiết thiết bị theo ID ────────────────────────
    public EquipmentResponse getEquipmentById(UUID id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));
        return toEquipmentResponse(equipment);
    }

    // ── Lấy tất cả thiết bị ───────────────────────────────────
    public List<EquipmentResponse> getAllEquipments() {
        return equipmentRepository.findAll().stream()
                .map(this::toEquipmentResponse)
                .toList();
    }

    // ── Tìm kiếm thiết bị theo từ khóa ───────────────────────
    public List<EquipmentResponse> searchEquipments(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllEquipments();
        }
        return equipmentRepository
                .findByKksCodeContainingIgnoreCaseOrEquipmentNameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(this::toEquipmentResponse)
                .toList();
    }

    // ── Xóa thiết bị ─────────────────────────────────────────
    @Transactional
    public void deleteEquipment(UUID id) {
        log.info("Deleting equipment with id: {}", id);
        if (!equipmentRepository.existsById(id)) {
            throw new AppException(ErrorCode.EQUIPMENT_NOT_FOUND);
        }
        equipmentRepository.deleteById(id);
    }

    // ── Helper: Map Equipment → EquipmentResponse ─────────────
    public EquipmentResponse toEquipmentResponse(Equipment equipment) {
        List<EquipmentImageResponse> images = equipmentImageRepository.findByEquipmentId(equipment.getId())
                .stream()
                .map(this::toEquipmentImageResponse)
                .toList();

        return EquipmentResponse.builder()
                .id(equipment.getId())
                .kksCode(equipment.getKksCode())
                .equipmentName(equipment.getEquipmentName())
                .equipmentType(equipment.getEquipmentType())
                .status(equipment.getStatus())
                .location(equipment.getLocation())
                .systemId(equipment.getSystemId())
                .images(images)
                .build();
    }

    public EquipmentImageResponse toEquipmentImageResponse(EquipmentImage img) {
        return EquipmentImageResponse.builder()
                .id(img.getImageId())
                .equipmentId(img.getEquipmentId())
                .imageUrl(img.getImageUrl())
                .caption(img.getCaption())
                .uploadedBy(img.getUploadedBy())
                .uploadedAt(img.getUploadedAt())
                .build();
    }

    // ── Quản lý hình ảnh thiết bị ──────────────────────────
    private static final String IMAGE_UPLOAD_DIR = "uploads/equipment-images";

    public List<EquipmentImageResponse> getEquipmentImages(UUID equipmentId) {
        return equipmentImageRepository.findByEquipmentId(equipmentId).stream()
                .map(this::toEquipmentImageResponse)
                .toList();
    }

    @Transactional
    public EquipmentImageResponse uploadEquipmentImage(UUID equipmentId, MultipartFile file) {
        log.info("Uploading image for equipment: {}", equipmentId);

        if (!equipmentRepository.existsById(equipmentId)) {
            throw new AppException(ErrorCode.EQUIPMENT_NOT_FOUND);
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên trống!");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Validate extension
        String extLower = extension.toLowerCase();
        if (!extLower.equals(".jpg") && !extLower.equals(".jpeg") && !extLower.equals(".png") 
            && !extLower.equals(".webp") && !extLower.equals(".gif")) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ (chỉ nhận JPG, PNG, WEBP, GIF)!");
        }

        try {
            Path uploadPath = Paths.get(IMAGE_UPLOAD_DIR).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = "equipment_" + equipmentId + "_" + System.currentTimeMillis() + extension;
            Path targetPath = uploadPath.resolve(filename).toAbsolutePath().normalize();
            Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Lấy ID người dùng hiện tại
            UUID currentUserId = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String username = auth.getName();
                var userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    currentUserId = userOpt.get().getUserId();
                }
            }

            EquipmentImage img = EquipmentImage.builder()
                    .equipmentId(equipmentId)
                    .imageUrl("/equipment/images/file/" + filename)
                    .caption(originalFilename)
                    .uploadedBy(currentUserId)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            img = equipmentImageRepository.save(img);
            return toEquipmentImageResponse(img);
        } catch (Exception e) {
            log.error("Lỗi khi lưu file ảnh cho thiết bị {}", equipmentId, e);
            throw new RuntimeException("Lỗi lưu file ảnh: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteEquipmentImage(UUID imageId) {
        log.info("Deleting equipment image with id: {}", imageId);
        EquipmentImage img = equipmentImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Xóa file vật lý
        try {
            String imageUrl = img.getImageUrl();
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            Path path = Paths.get(IMAGE_UPLOAD_DIR).resolve(filename).toAbsolutePath().normalize();
            Files.deleteIfExists(path);
        } catch (Exception e) {
            log.warn("Không thể xóa file ảnh vật lý của imageId {}", imageId, e);
        }

        equipmentImageRepository.delete(img);
    }

    public byte[] getEquipmentImageFile(String filename) {
        try {
            Path path = Paths.get(IMAGE_UPLOAD_DIR).resolve(filename).toAbsolutePath().normalize();
            if (!path.startsWith(Paths.get(IMAGE_UPLOAD_DIR).toAbsolutePath().normalize())) {
                throw new SecurityException("Không được phép truy cập tệp tin bên ngoài!");
            }
            if (!Files.exists(path)) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            return Files.readAllBytes(path);
        } catch (Exception e) {
            log.error("Lỗi đọc file ảnh {}", filename, e);
            throw new AppException(ErrorCode.NOT_FOUND);
        }
    }
}