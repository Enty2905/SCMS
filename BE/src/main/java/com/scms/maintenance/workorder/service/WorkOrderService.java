package com.scms.maintenance.workorder.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.repairrequest.entity.RepairRequest;
import com.scms.repairrequest.repository.RepairRequestRepository;
import com.scms.maintenance.workorder.dto.request.CreateWorkOrderRequest;
import com.scms.maintenance.workorder.dto.response.WorkOrderResponse;
import com.scms.maintenance.workorder.entity.WorkOrder;
import com.scms.maintenance.workorder.entity.WorkOrderMember;
import com.scms.maintenance.workorder.repository.WorkOrderMemberRepository;
import com.scms.maintenance.workorder.repository.WorkOrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkOrderService {

        WorkOrderRepository workOrderRepository;
        WorkOrderMemberRepository workOrderMemberRepository;
        RepairRequestRepository repairRequestRepository;
        EmployeeRepository employeeRepository;
        UserRepository userRepository;

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

                // Ràng buộc người an toàn khác Lãnh đạo thi công, Chỉ huy trực tiếp và Thành viên thi công
                if (req.getSafetySupervisorId().equals(req.getWorkLeaderId()) ||
                    req.getSafetySupervisorId().equals(req.getDirectCommanderId()) ||
                    (req.getMemberIds() != null && req.getMemberIds().contains(req.getSafetySupervisorId()))) {
                    throw new AppException(ErrorCode.SAFETY_SUPERVISOR_MUST_BE_UNIQUE);
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

                // 6. Thêm danh sách thành viên (nếu có)
                if (req.getMemberIds() != null && !req.getMemberIds().isEmpty()) {
                        List<WorkOrderMember> members = req.getMemberIds().stream()
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
         * Lấy toàn bộ danh sách phiếu công tác
         */
        @Transactional(readOnly = true)
        public List<WorkOrderResponse> getAllWorkOrders() {
                List<WorkOrder> orders = workOrderRepository.findAll();
                for (WorkOrder wo : orders) {
                        List<WorkOrderMember> members = workOrderMemberRepository.findByOrderIdWithEmployee(wo.getOrderId());
                        wo.getMembers().clear();
                        wo.getMembers().addAll(members);
                }
                return orders.stream()
                                .map(this::toResponse)
                                .toList();
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
                                .build();
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
}
