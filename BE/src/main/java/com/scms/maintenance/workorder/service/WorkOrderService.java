package com.scms.maintenance.workorder.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.common.response.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import java.util.Optional;
import com.scms.repairrequest.entity.RepairRequest;
import com.scms.repairrequest.repository.RepairRequestRepository;
import com.scms.maintenance.workorder.dto.request.CreateWorkOrderRequest;
import com.scms.maintenance.workorder.dto.response.WorkOrderResponse;
import com.scms.maintenance.workorder.entity.WorkOrder;
import com.scms.maintenance.workorder.entity.WorkOrderMember;
import com.scms.maintenance.workorder.repository.WorkOrderMemberRepository;
import com.scms.maintenance.workorder.repository.WorkOrderRepository;
import org.springframework.web.multipart.MultipartFile;
import com.scms.common.service.CloudinaryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.scms.maintenance.workorder.dto.request.CloseDailyLogRequest;
import com.scms.maintenance.workorder.dto.request.UpdateWorkOrderMembersRequest;
import com.scms.maintenance.workorder.dto.response.WorkOrderDailyLogResponse;
import com.scms.maintenance.workorder.entity.WorkOrderDailyLog;
import com.scms.maintenance.workorder.repository.WorkOrderDailyLogRepository;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkOrderService {

        WorkOrderRepository workOrderRepository;
        WorkOrderMemberRepository workOrderMemberRepository;
        WorkOrderDailyLogRepository workOrderDailyLogRepository;
        RepairRequestRepository repairRequestRepository;
        EmployeeRepository employeeRepository;
        UserRepository userRepository;
        CloudinaryService cloudinaryService;

        /**
         * Chức năng 2: Tạo phiếu công tác (PCT) từ một repair request
         *
         * @param req      dữ liệu tạo PCT
         * @param username username của người đang đăng nhập (từ JWT)
         */
        @Transactional
        public WorkOrderResponse createWorkOrder(CreateWorkOrderRequest req, String username) {

                // 1. Tự sinh số phiếu công tác dạng PCT-XXXX (4 chữ số, liên tục, unique)
                String orderNumber = generateOrderNumber();

                // 2. Lấy repair request nếu có (tuỳ chọn) và cập nhật trạng thái sang in_progress
                RepairRequest repairRequest = null;
                if (req.getRequestId() != null) {
                        repairRequest = repairRequestRepository.findById(req.getRequestId())
                                        .orElseThrow(() -> new AppException(ErrorCode.REPAIR_REQUEST_NOT_FOUND));
                        repairRequest.setStatus("done");
                        repairRequestRepository.save(repairRequest);
                }

                // 3. Lấy user đang đăng nhập
                User createdBy = userRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                // 4. Lấy 3 nhân sự phụ trách
                Employee workLeader = getEmployeeOrThrow(req.getWorkLeaderId());
                Employee directCommander = getEmployeeOrThrow(req.getDirectCommanderId());
                Employee safetySupervisor = getEmployeeOrThrow(req.getSafetySupervisorId());

                // Ràng buộc 3 vị trí lãnh đạo không được trùng nhau
                if (req.getSafetySupervisorId().equals(req.getWorkLeaderId()) ||
                    req.getSafetySupervisorId().equals(req.getDirectCommanderId())) {
                    throw new AppException(ErrorCode.SAFETY_SUPERVISOR_MUST_BE_UNIQUE);
                }

                // Tự động xoá các vị trí lãnh đạo khỏi danh sách thành viên thi công nếu bị trùng ở backend
                List<UUID> cleanMemberIds = new ArrayList<>();
                if (req.getMemberIds() != null) {
                    for (UUID mId : req.getMemberIds()) {
                        if (mId != null &&
                            !mId.equals(req.getWorkLeaderId()) &&
                            !mId.equals(req.getDirectCommanderId()) &&
                            !mId.equals(req.getSafetySupervisorId())) {
                            cleanMemberIds.add(mId);
                        }
                    }
                }

                // 5. Tạo WorkOrder (status = draft)
                WorkOrder workOrder = WorkOrder.builder()
                                .orderNumber(orderNumber) // số tự sinh
                                .request(repairRequest)
                                .content(req.getContent())
                                .status("draft")
                                .startDate(req.getStartDate())
                                .endDate(req.getEndDate())
                                .workLeader(workLeader)
                                .directCommander(directCommander)
                                .safetySupervisor(safetySupervisor)
                                .createdBy(createdBy)
                                .members(new ArrayList<>())
                                .build();

                workOrderRepository.save(workOrder);

                // 6. Thêm danh sách thành viên (sau khi đã tự động làm sạch các ID trùng lãnh đạo)
                if (!cleanMemberIds.isEmpty()) {
                        List<WorkOrderMember> members = cleanMemberIds.stream()
                                        .map(memberId -> {
                                                Employee emp = getEmployeeOrThrow(memberId);
                                                return WorkOrderMember.builder()
                                                                .order(workOrder)
                                                                .employee(emp)
                                                                .build();
                                        })
                                        .toList();
                        workOrderMemberRepository.saveAll(members);
                        workOrder.getMembers().addAll(members);
                }

                return toResponse(workOrder);
        }

        /**
         * Xem chi tiết một phiếu công tác theo ID
         */
        @Transactional(readOnly = true)
        public WorkOrderResponse getWorkOrderById(UUID orderId) {
                WorkOrder wo = workOrderRepository.findByIdWithDetails(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));
                // Load members riêng để tránh MultipleBagFetchException
                List<WorkOrderMember> members = workOrderMemberRepository.findByOrderIdWithEmployee(orderId);
                wo.getMembers().clear();
                wo.getMembers().addAll(members);
                return toResponse(wo);
        }

        /**
         * Cập nhật danh sách nhân viên tham gia phiếu công tác
         */
        @Transactional
        public WorkOrderResponse updateWorkOrderMembers(UUID orderId, UpdateWorkOrderMembersRequest req) {
                WorkOrder workOrder = workOrderRepository.findById(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));

                // Không cho phép chỉnh sửa nếu PCT đã hoàn thành (locked)
                if ("locked".equals(workOrder.getStatus())) {
                        throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS);
                }

                // Loại bỏ các ID nhân sự trùng với các vị trí lãnh đạo
                List<UUID> cleanMemberIds = new ArrayList<>();
                if (req.getMemberIds() != null) {
                        for (UUID mId : req.getMemberIds()) {
                                if (mId != null &&
                                    (workOrder.getWorkLeader() == null || !mId.equals(workOrder.getWorkLeader().getEmployeeId())) &&
                                    (workOrder.getDirectCommander() == null || !mId.equals(workOrder.getDirectCommander().getEmployeeId())) &&
                                    (workOrder.getSafetySupervisor() == null || !mId.equals(workOrder.getSafetySupervisor().getEmployeeId()))) {
                                        cleanMemberIds.add(mId);
                                }
                        }
                }

                // Lấy danh sách thành viên hiện tại để đối chiếu
                List<WorkOrderMember> currentMembers = workOrderMemberRepository.findByOrderIdWithEmployee(orderId);

                // Map để tra cứu nhanh các thành viên cũ
                java.util.Map<UUID, WorkOrderMember> currentMemberMap = new java.util.HashMap<>();
                for (WorkOrderMember m : currentMembers) {
                        if (m.getEmployee() != null) {
                                currentMemberMap.put(m.getEmployee().getEmployeeId(), m);
                        }
                }

                List<WorkOrderMember> updatedMembers = new ArrayList<>();
                List<WorkOrderMember> toDelete = new ArrayList<>();

                // Thêm hoặc giữ lại các thành viên mới
                for (UUID newEmpId : cleanMemberIds) {
                        if (currentMemberMap.containsKey(newEmpId)) {
                                // Nếu thành viên đã tồn tại, giữ nguyên đối tượng cũ (giữ checkInAt/checkOutAt)
                                updatedMembers.add(currentMemberMap.get(newEmpId));
                        } else {
                                // Nếu thành viên mới, tạo mới WorkOrderMember
                                Employee emp = getEmployeeOrThrow(newEmpId);
                                WorkOrderMember newMember = WorkOrderMember.builder()
                                                .order(workOrder)
                                                .employee(emp)
                                                .build();
                                updatedMembers.add(newMember);
                        }
                }

                // Xác định thành viên cần xóa
                java.util.Set<UUID> cleanMemberIdSet = new java.util.HashSet<>(cleanMemberIds);
                for (WorkOrderMember m : currentMembers) {
                        if (m.getEmployee() != null && !cleanMemberIdSet.contains(m.getEmployee().getEmployeeId())) {
                                toDelete.add(m);
                        }
                }

                // Xóa các thành viên cũ khỏi DB
                if (!toDelete.isEmpty()) {
                        workOrderMemberRepository.deleteAll(toDelete);
                }

                // Lưu các thành viên mới tạo vào DB
                List<WorkOrderMember> toSave = updatedMembers.stream()
                                .filter(m -> m.getId() == null)
                                .toList();
                if (!toSave.isEmpty()) {
                        workOrderMemberRepository.saveAll(toSave);
                }

                // Cập nhật lại list members trên entity WorkOrder
                workOrder.getMembers().clear();
                workOrder.getMembers().addAll(updatedMembers);

                return toResponse(workOrder);
        }

        /**
         * Lấy danh sách phiếu công tác có lọc theo số PCT và mã KKS thiết bị
         */
        @Transactional(readOnly = true)
        public List<WorkOrderResponse> getAllWorkOrders(String orderNumber, String kksCode) {
            String on = (orderNumber != null && !orderNumber.isBlank()) ? orderNumber.trim() : null;
            String kks = (kksCode != null && !kksCode.isBlank()) ? kksCode.trim() : null;
            List<WorkOrder> orders = workOrderRepository.findAllWithFilters(on, kks);
            for (WorkOrder wo : orders) {
                    List<WorkOrderMember> members = workOrderMemberRepository.findByOrderIdWithEmployee(wo.getOrderId());
                    wo.getMembers().clear();
                    wo.getMembers().addAll(members);
            }
            return orders.stream()
                            .map(this::toResponse)
                            .toList();
        }

        /**
         * Lấy danh sách phiếu công tác có tìm kiếm và phân trang
         */
        @Transactional(readOnly = true)
        public PagedResponse<WorkOrderResponse> searchWorkOrders(String keyword, String status, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
                Page<WorkOrder> workOrderPage = workOrderRepository.searchWorkOrders(keyword, status, pageable);
                
                List<WorkOrderResponse> content = workOrderPage.getContent().stream().map(wo -> {
                        List<WorkOrderMember> members = workOrderMemberRepository.findByOrderIdWithEmployee(wo.getOrderId());
                        wo.getMembers().clear();
                        wo.getMembers().addAll(members);
                        return toResponse(wo);
                }).toList();

                return PagedResponse.<WorkOrderResponse>builder()
                                .content(content)
                                .page(workOrderPage.getNumber())
                                .size(workOrderPage.getSize())
                                .totalElements(workOrderPage.getTotalElements())
                                .totalPages(workOrderPage.getTotalPages())
                                .last(workOrderPage.isLast())
                                .build();
        }

        // ── Daily Log (Mở / Đóng Phiếu Công Tác) ────────────────────────────────

        @Transactional
        public WorkOrderDailyLogResponse openDailyLog(UUID orderId, String username) {
                WorkOrder workOrder = workOrderRepository.findById(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));

                if ("locked".equals(workOrder.getStatus())) {
                        throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS); // Cannot open locked order
                }

                // Check if there is already an active log
                workOrderDailyLogRepository.findActiveLogByOrderId(orderId).ifPresent(log -> {
                        throw new AppException(ErrorCode.DAILY_LOG_ALREADY_OPEN);
                });

                User openedBy = userRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                WorkOrderDailyLog newLog = WorkOrderDailyLog.builder()
                                .workOrder(workOrder)
                                .date(LocalDate.now())
                                .openedBy(openedBy)
                                .openedAt(LocalDateTime.now())
                                .build();

                workOrderDailyLogRepository.save(newLog);

                // Update work order status if needed (e.g., from draft or paused to open)
                if ("draft".equals(workOrder.getStatus()) || "paused".equals(workOrder.getStatus())) {
                        workOrder.setStatus("open");
                        workOrderRepository.save(workOrder);
                }

                return toLogResponse(newLog);
        }

        @Transactional
        public WorkOrderDailyLogResponse closeDailyLog(UUID orderId, CloseDailyLogRequest req, String username) {
                WorkOrderDailyLog activeLog = workOrderDailyLogRepository.findActiveLogByOrderId(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.NO_ACTIVE_LOG_TO_CLOSE));

                User closedBy = userRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                activeLog.setClosedBy(closedBy);
                activeLog.setClosedAt(LocalDateTime.now());
                if (req != null && req.getNote() != null) {
                        activeLog.setNote(req.getNote());
                }
                workOrderDailyLogRepository.save(activeLog);

                // Update Work Order status to paused when shift is closed
                WorkOrder workOrder = activeLog.getWorkOrder();
                if ("open".equals(workOrder.getStatus())) {
                        workOrder.setStatus("paused");
                        workOrderRepository.save(workOrder);
                }

                return toLogResponse(activeLog);
        }

        @Transactional
        public void completeWorkOrder(UUID orderId) {
                WorkOrder workOrder = workOrderRepository.findById(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));

                if ("locked".equals(workOrder.getStatus())) {
                        throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS);
                }

                // Verify if there is an active daily log session
                Optional<WorkOrderDailyLog> activeLogOpt = workOrderDailyLogRepository
                                .findActiveLogByOrderId(orderId);
                if (activeLogOpt.isPresent()) {
                        throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS); // Or create a new error code for "shift is open"
                }

                workOrder.setStatus("locked");
                workOrder.setEndDate(LocalDateTime.now());
                workOrderRepository.save(workOrder);
        }

        @Transactional(readOnly = true)
        public PagedResponse<WorkOrderDailyLogResponse> getDailyLogs(UUID orderId, int page, int size) {
                if (!workOrderRepository.existsById(orderId)) {
                        throw new AppException(ErrorCode.WORK_ORDER_NOT_FOUND);
                }
                Pageable pageable = PageRequest.of(page, size);
                Page<WorkOrderDailyLog> logPage = workOrderDailyLogRepository.findByWorkOrderOrderIdOrderByOpenedAtDesc(orderId, pageable);
                return PagedResponse.<WorkOrderDailyLogResponse>builder()
                        .content(logPage.getContent().stream().map(this::toLogResponse).toList())
                        .page(logPage.getNumber())
                        .size(logPage.getSize())
                        .totalElements(logPage.getTotalElements())
                        .totalPages(logPage.getTotalPages())
                        .last(logPage.isLast())
                        .build();
        }

        // ── Helper ───────────────────────────────────────────────────────────────

        private Employee getEmployeeOrThrow(UUID employeeId) {
                return employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
        }

        /**
         * Sinh số PCT tuần tự dạng PCT-XXXX (4 chữ số, bắt đầu từ 0001).
         * Nếu số kế tiếp đã tồn tại (do dữ liệu cũ), tăng dần cho đến khi tìm được số
         * chưa dùng.
         */
        private String generateOrderNumber() {
                String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yy-MM-dd"));
                long next = 1;
                String candidate;
                do {
                        candidate = String.format("PCT-%s-%04d", datePrefix, next);
                        next++;
                } while (workOrderRepository.existsByOrderNumber(candidate));
                return candidate;
        }

        // ── Mapping ──────────────────────────────────────────────────────────────

        private WorkOrderResponse toResponse(WorkOrder wo) {
                RepairRequest req = wo.getRequest();

                return WorkOrderResponse.builder()
                                .orderId(wo.getOrderId())
                                .orderNumber(wo.getOrderNumber())
                                .status(wo.getStatus())
                                .content(wo.getContent())
                                .startDate(wo.getStartDate())
                                .endDate(wo.getEndDate())
                                .extendedTo(wo.getExtendedTo())
                                .createdAt(wo.getCreatedAt())
                                // Repair request + Equipment
                                .requestId(req != null ? req.getRequestId() : null)
                                .requestDescription(req != null ? req.getDescription() : null)
                                .requestPriority(req != null ? req.getPriority() : null)
                                .equipmentId(req != null && req.getEquipment() != null ? req.getEquipment().getId()
                                                : null)
                                .equipmentKksCode(req != null && req.getEquipment() != null
                                                ? req.getEquipment().getKksCode()
                                                : null)
                                .equipmentName(req != null && req.getEquipment() != null
                                                ? req.getEquipment().getEquipmentName()
                                                : null)
                                .equipmentType(req != null && req.getEquipment() != null
                                                ? req.getEquipment().getEquipmentType()
                                                : null)
                                .equipmentLocation(req != null && req.getEquipment() != null
                                                ? req.getEquipment().getLocation()
                                                : null)
                                // Nhân sự
                                .workLeader(toEmployeeInfo(wo.getWorkLeader()))
                                .directCommander(toEmployeeInfo(wo.getDirectCommander()))
                                .safetySupervisor(toEmployeeInfo(wo.getSafetySupervisor()))
                                // Người tạo
                                .createdByUsername(wo.getCreatedBy() != null ? wo.getCreatedBy().getUsername() : null)
                                .createdByName(wo.getCreatedBy() != null && wo.getCreatedBy().getEmployee() != null
                                                ? wo.getCreatedBy().getEmployee().getName()
                                                : null)
                                // Thành viên
                                .members(wo.getMembers().stream().map(this::toMemberInfo).toList())
                                .pdfUrl(wo.getPdfUrl())
                                .build();
        }

        @Transactional
        public WorkOrderResponse uploadSignedPdf(UUID orderId, MultipartFile file) {
                WorkOrder wo = workOrderRepository.findById(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));

                // Ràng buộc: chỉ được upload khi trạng thái ở hoàn thành (locked)
                if (!"locked".equalsIgnoreCase(wo.getStatus())) {
                        throw new AppException(ErrorCode.WORK_ORDER_NOT_LOCKED);
                }

                // Validate file
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("File tải lên trống hoặc không hợp lệ!");
                }
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
                        throw new IllegalArgumentException("Chỉ chấp nhận tệp định dạng PDF (.pdf)!");
                }

                try {
                        String pdfUrl = cloudinaryService.uploadFile(file, "scms/work-orders");
                        wo.setPdfUrl(pdfUrl);
                        workOrderRepository.save(wo);
                        log.info("Uploaded signed PDF for work order {} to Cloudinary: {}", wo.getOrderNumber(), pdfUrl);
                        return toResponse(wo);
                } catch (Exception e) {
                        log.error("Lỗi khi lưu file PDF cho phiếu công tác {}", orderId, e);
                        throw new IllegalArgumentException("Không thể lưu file PDF lên máy chủ: " + e.getMessage() + " (" + e.getClass().getSimpleName() + ")", e);
                }
        }

        private WorkOrderResponse.EmployeeInfo toEmployeeInfo(Employee emp) {
                if (emp == null)
                        return null;
                return WorkOrderResponse.EmployeeInfo.builder()
                                .employeeId(emp.getEmployeeId())
                                .name(emp.getName())
                                .positionName(emp.getPosition() != null ? emp.getPosition().getPositionName() : null)
                                .phone(emp.getPhone())
                                .build();
        }

        private WorkOrderResponse.MemberInfo toMemberInfo(WorkOrderMember m) {
                return WorkOrderResponse.MemberInfo.builder()
                                .employeeId(m.getEmployee() != null ? m.getEmployee().getEmployeeId() : null)
                                .name(m.getEmployee() != null ? m.getEmployee().getName() : null)
                                .positionName(m.getEmployee() != null && m.getEmployee().getPosition() != null
                                                ? m.getEmployee().getPosition().getPositionName()
                                                : null)
                                .checkInAt(m.getCheckInAt())
                                .checkOutAt(m.getCheckOutAt())
                                .build();
        }

        private WorkOrderDailyLogResponse toLogResponse(WorkOrderDailyLog log) {
                return WorkOrderDailyLogResponse.builder()
                                .logId(log.getLogId())
                                .orderId(log.getWorkOrder().getOrderId())
                                .date(log.getDate())
                                .openedByUserId(log.getOpenedBy().getUserId())
                                .openedByName(log.getOpenedBy().getEmployee() != null ? log.getOpenedBy().getEmployee().getName() : log.getOpenedBy().getUsername())
                                .openedAt(log.getOpenedAt())
                                .closedByUserId(log.getClosedBy() != null ? log.getClosedBy().getUserId() : null)
                                .closedByName(log.getClosedBy() != null ? 
                                        (log.getClosedBy().getEmployee() != null ? log.getClosedBy().getEmployee().getName() : log.getClosedBy().getUsername()) 
                                        : null)
                                .closedAt(log.getClosedAt())
                                .note(log.getNote())
                                .build();
        }
}
