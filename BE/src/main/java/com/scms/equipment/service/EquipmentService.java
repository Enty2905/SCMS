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
import com.scms.equipment.repository.TechnicalSpecRepository;
import com.scms.equipment.repository.TechnicalParamRepository;
import com.scms.equipment.repository.UnitRepository;
import com.scms.equipment.entity.TechnicalSpec;
import com.scms.equipment.dto.request.TechnicalSpecRequest;
import com.scms.equipment.dto.response.TechnicalSpecResponse;
import com.scms.equipment.dto.response.TechnicalParamResponse;
import com.scms.equipment.dto.response.UnitResponse;
import com.scms.auth.repository.UserRepository;
import com.scms.common.service.CloudinaryService;
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
    TechnicalSpecRepository technicalSpecRepository;
    TechnicalParamRepository technicalParamRepository;
    UnitRepository unitRepository;
    CloudinaryService cloudinaryService;

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

        if (request.getSpecs() != null) {
            for (var specReq : request.getSpecs()) {
                if (specReq.getParamId() != null) {
                    TechnicalSpec spec = TechnicalSpec.builder()
                            .equipmentId(equipment.getId())
                            .paramId(specReq.getParamId())
                            .paramValue(specReq.getParamValue())
                            .unitId(specReq.getUnitId())
                            .build();
                    technicalSpecRepository.save(spec);
                }
            }
        }

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

        Equipment saved = equipmentRepository.save(equipment);

        // Delete existing specs and insert new ones
        technicalSpecRepository.deleteByEquipmentId(id);
        if (request.getSpecs() != null) {
            for (var specReq : request.getSpecs()) {
                if (specReq.getParamId() != null) {
                    TechnicalSpec spec = TechnicalSpec.builder()
                            .equipmentId(id)
                            .paramId(specReq.getParamId())
                            .paramValue(specReq.getParamValue())
                            .unitId(specReq.getUnitId())
                            .build();
                    technicalSpecRepository.save(spec);
                }
            }
        }

        return toEquipmentResponse(saved);
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

    public List<EquipmentResponse> getFilteredEquipments(String kksCode, String name, UUID systemId, String type, String status) {
        List<Equipment> list = equipmentRepository.findAll();
        
        java.util.Set<UUID> allowedSystemIds = null;
        if (systemId != null) {
            allowedSystemIds = new java.util.HashSet<>();
            allowedSystemIds.add(systemId);
            java.util.List<UUID> queue = new java.util.ArrayList<>();
            queue.add(systemId);
            
            var allSystems = equipmentSystemRepository.findAll();
            while (!queue.isEmpty()) {
                UUID currentId = queue.remove(0);
                for (var sys : allSystems) {
                    if (currentId.equals(sys.getParentSystemId())) {
                        if (!allowedSystemIds.contains(sys.getSystemId())) {
                            allowedSystemIds.add(sys.getSystemId());
                            queue.add(sys.getSystemId());
                        }
                    }
                }
            }
        }
        
        final java.util.Set<UUID> finalSystemIds = allowedSystemIds;
        
        return list.stream()
                .filter(eq -> {
                    if (kksCode != null && !kksCode.isBlank()) {
                        String kksLower = kksCode.trim().toLowerCase();
                        if (eq.getKksCode() == null || !eq.getKksCode().toLowerCase().contains(kksLower)) {
                            return false;
                        }
                    }
                    if (name != null && !name.isBlank()) {
                        String nameLower = name.trim().toLowerCase();
                        if (eq.getEquipmentName() == null || !eq.getEquipmentName().toLowerCase().contains(nameLower)) {
                            return false;
                        }
                    }
                    if (finalSystemIds != null) {
                        if (eq.getSystemId() == null || !finalSystemIds.contains(eq.getSystemId())) {
                            return false;
                        }
                    }
                    if (type != null && !type.isBlank() && !type.equalsIgnoreCase("all")) {
                        if (eq.getEquipmentType() == null || !eq.getEquipmentType().equalsIgnoreCase(type.trim())) {
                            return false;
                        }
                    }
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
                        if (eq.getStatus() == null || !eq.getStatus().equalsIgnoreCase(status.trim())) {
                            return false;
                        }
                    }
                    return true;
                })
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

        List<TechnicalSpecResponse> specs = technicalSpecRepository.findByEquipmentId(equipment.getId())
                .stream()
                .map(spec -> TechnicalSpecResponse.builder()
                        .specId(spec.getSpecId())
                        .paramId(spec.getParamId())
                        .paramName(spec.getParameter() != null ? spec.getParameter().getParamName() : null)
                        .paramValue(spec.getParamValue())
                        .unitId(spec.getUnitId())
                        .unitSymbol(spec.getUnit() != null ? spec.getUnit().getSymbol() : null)
                        .build())
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
                .specs(specs)
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
            // Upload to Cloudinary under folder "scms/equipment"
            String imageUrl = cloudinaryService.uploadFile(file, "scms/equipment");

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
                    .imageUrl(imageUrl)
                    .caption(originalFilename)
                    .uploadedBy(currentUserId)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            img = equipmentImageRepository.save(img);
            return toEquipmentImageResponse(img);
        } catch (Exception e) {
            log.error("Lỗi khi tải ảnh lên Cloudinary cho thiết bị {}", equipmentId, e);
            throw new RuntimeException("Lỗi tải ảnh lên Cloudinary: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteEquipmentImage(UUID imageId) {
        log.info("Deleting equipment image with id: {}", imageId);
        EquipmentImage img = equipmentImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Xóa file vật lý hoặc trên Cloudinary
        try {
            String imageUrl = img.getImageUrl();
            if (imageUrl != null && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
                String publicId = extractPublicId(imageUrl);
                if (publicId != null) {
                    cloudinaryService.deleteFile(publicId);
                }
            } else if (imageUrl != null) {
                // Xóa file vật lý local đối với dữ liệu cũ
                String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                Path path = Paths.get(IMAGE_UPLOAD_DIR).resolve(filename).toAbsolutePath().normalize();
                Files.deleteIfExists(path);
            }
        } catch (Exception e) {
            log.warn("Không thể xóa file ảnh (Cloudinary hoặc local) của imageId {}", imageId, e);
        }

        equipmentImageRepository.delete(img);
    }

    private String extractPublicId(String url) {
        if (url == null || !url.contains("image/upload/")) {
            return null;
        }
        try {
            String afterUpload = url.substring(url.indexOf("image/upload/") + "image/upload/".length());
            if (afterUpload.startsWith("v")) {
                int firstSlash = afterUpload.indexOf("/");
                if (firstSlash != -1) {
                    afterUpload = afterUpload.substring(firstSlash + 1);
                }
            }
            int lastDot = afterUpload.lastIndexOf(".");
            if (lastDot != -1) {
                afterUpload = afterUpload.substring(0, lastDot);
            }
            return afterUpload;
        } catch (Exception e) {
            log.warn("Không thể parse publicId từ url: {}", url, e);
            return null;
        }
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

    public List<TechnicalParamResponse> getAllTechnicalParams() {
        return technicalParamRepository.findAll().stream()
                .map(param -> TechnicalParamResponse.builder()
                        .paramId(param.getParamId())
                        .paramName(param.getParamName())
                        .dataType(param.getDataType())
                        .build())
                .toList();
    }

    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(unit -> UnitResponse.builder()
                        .unitId(unit.getUnitId())
                        .symbol(unit.getSymbol())
                        .fullName(unit.getFullName())
                        .build())
                .toList();
    }
}