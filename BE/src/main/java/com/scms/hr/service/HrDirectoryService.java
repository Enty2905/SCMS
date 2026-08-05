package com.scms.hr.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.DuplicateResourceException;
import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.common.service.CloudinaryService;
import com.scms.department.entity.Department;
import com.scms.department.repository.DepartmentRepository;
import com.scms.employee.entity.Employee;
import com.scms.employee.entity.EmployeePosition;
import com.scms.employee.entity.EmployeeStatus;
import com.scms.employee.entity.Gender;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.employee.repository.EmployeePositionRepository;
import com.scms.hr.dto.request.DepartmentCreateRequest;
import com.scms.hr.dto.request.EmployeeUpsertRequest;
import com.scms.hr.dto.response.DepartmentResponse;
import com.scms.hr.dto.response.EmployeePositionResponse;
import com.scms.hr.dto.response.EmployeeResponse;
import com.scms.hr.entity.HrAuditAction;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HrDirectoryService {

    static int MAX_PAGE_SIZE = 200;
    static String EMPLOYEE_CODE_PREFIX = "NV";

    EmployeeRepository employeeRepository;
    EmployeePositionRepository employeePositionRepository;
    DepartmentRepository departmentRepository;
    UserRepository userRepository;
    CloudinaryService cloudinaryService;
    HrAuditService hrAuditService;

    @Value("${app.cloudinary-folder.employees}")
    @NonFinal
    String employeeAvatarFolder;

    // ── Nhân viên ────────────────────────────────────────────────────────────

    public List<EmployeeResponse> getEmployees() {
        List<Employee> employees = employeeRepository.findAllWithDetails();
        Map<UUID, Boolean> accountStatus = loadAccountStatus();

        return employees.stream()
                .map(employee -> toEmployeeResponse(employee, accountStatus))
                .toList();
    }

    /**
     * Tìm kiếm nhân viên theo từ khóa (mã, tên, email, số điện thoại), phòng ban
     * và tình trạng tài khoản. Kết quả có phân trang để danh sách lớn vẫn tải nhanh.
     *
     * @param accountState {@code all} | {@code has-account} | {@code no-account}
     */
    public PagedResponse<EmployeeResponse> searchEmployees(
            String search,
            UUID departmentId,
            String status,
            String accountState,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                normalizePageSize(size),
                Sort.by(Sort.Direction.ASC, "employeeCode")
        );

        Page<Employee> result = employeeRepository.findAll(
                employeeSpecification(search, departmentId)
                        .and(statusSpecification(status))
                        .and(accountStateSpecification(accountState)),
                pageable
        );
        Map<UUID, Boolean> accountStatus = loadAccountStatus();

        List<EmployeeResponse> content = result.getContent().stream()
                .map(employee -> toEmployeeResponse(employee, accountStatus))
                .toList();

        return PagedResponse.<EmployeeResponse>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    /**
     * Danh sách nhân viên của một phòng ban, có hỗ trợ tìm kiếm trong nội bộ phòng ban.
     */
    public List<EmployeeResponse> getDepartmentEmployees(UUID departmentId, String search) {
        departmentRepository.findById(departmentId)
                .orElseThrow(() -> new NotFoundException("Department", "departmentId", departmentId));

        List<Employee> employees = employeeRepository.findAll(
                employeeSpecification(search, departmentId),
                Sort.by(Sort.Direction.ASC, "employeeCode")
        );
        Map<UUID, Boolean> accountStatus = loadAccountStatus();

        return employees.stream()
                .map(employee -> toEmployeeResponse(employee, accountStatus))
                .toList();
    }

    public List<EmployeePositionResponse> getEmployeePositions() {
        return employeePositionRepository.findAll().stream()
                .map(position -> EmployeePositionResponse.builder()
                        .positionId(position.getPositionId())
                        .positionName(position.getPositionName())
                        .description(position.getDescription())
                        .build())
                .toList();
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeUpsertRequest request) {
        Employee employee = Employee.builder()
                .employeeCode(nextEmployeeCode())
                .build();
        applyEmployeeRequest(employee, request);
        Employee savedEmployee = employeeRepository.save(employee);

        hrAuditService.record(
                HrAuditAction.CREATE_EMPLOYEE,
                savedEmployee.getEmployeeId(),
                describe(savedEmployee),
                "Phòng ban: " + departmentNameOf(savedEmployee) + ", tình trạng: " + savedEmployee.getStatus()
        );

        return toEmployeeResponse(savedEmployee, loadAccountStatus());
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID employeeId, EmployeeUpsertRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee", "employeeId", employeeId));

        if (!StringUtils.hasText(employee.getEmployeeCode())) {
            employee.setEmployeeCode(nextEmployeeCode());
        }

        String previousStatus = employee.getStatus();
        applyEmployeeRequest(employee, request);
        Employee savedEmployee = employeeRepository.save(employee);

        boolean accountLocked = lockAccountIfResigned(savedEmployee, previousStatus);

        hrAuditService.record(
                HrAuditAction.UPDATE_EMPLOYEE,
                savedEmployee.getEmployeeId(),
                describe(savedEmployee),
                "Phòng ban: " + departmentNameOf(savedEmployee) + ", tình trạng: " + savedEmployee.getStatus()
                        + (accountLocked ? ". Tài khoản đã bị khóa do nhân viên nghỉ việc." : "")
        );

        return toEmployeeResponse(savedEmployee, loadAccountStatus());
    }

    @Transactional
    public void deleteEmployee(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee", "employeeId", employeeId));

        userRepository.findByEmployeeEmployeeId(employeeId).ifPresent(user -> {
            user.setIsActive(false);
            user.setDeleted(true);
            userRepository.save(user);
        });

        hrAuditService.record(
                HrAuditAction.DELETE_EMPLOYEE,
                employeeId,
                describe(employee),
                "Phòng ban: " + departmentNameOf(employee)
        );

        employeeRepository.delete(employee);
    }

    /**
     * Nhân viên vừa chuyển sang "Đã nghỉ việc" thì khóa ngay tài khoản đang mở của họ.
     * Chỉ khóa chứ không xóa, để dữ liệu lịch sử gắn với tài khoản còn nguyên.
     *
     * @return true nếu có tài khoản vừa bị khóa
     */
    private boolean lockAccountIfResigned(Employee employee, String previousStatus) {
        String resigned = EmployeeStatus.RESIGNED.getLabel();

        if (!resigned.equals(employee.getStatus()) || resigned.equals(previousStatus)) {
            return false;
        }

        return userRepository.findByEmployeeEmployeeId(employee.getEmployeeId())
                .filter(user -> !Boolean.TRUE.equals(user.getDeleted()))
                .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .map(user -> {
                    user.setIsActive(false);
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public EmployeeResponse removeEmployeeFromDepartment(UUID departmentId, UUID employeeId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new NotFoundException("Department", "departmentId", departmentId));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee", "employeeId", employeeId));

        if (employee.getDepartment() == null
                || !department.getDepartmentId().equals(employee.getDepartment().getDepartmentId())) {
            throw new BadRequestException("Nhân viên không thuộc phòng ban đã chọn.");
        }

        employee.setDepartment(null);
        Employee savedEmployee = employeeRepository.save(employee);

        hrAuditService.record(
                HrAuditAction.REMOVE_FROM_DEPARTMENT,
                savedEmployee.getEmployeeId(),
                describe(savedEmployee),
                "Đã gỡ khỏi phòng ban " + department.getDepartmentName()
        );

        return toEmployeeResponse(savedEmployee, loadAccountStatus());
    }

    // ── Phòng ban ────────────────────────────────────────────────────────────

    public List<DepartmentResponse> getDepartments(String search) {
        String keyword = StringUtils.hasText(search) ? search.trim().toLowerCase() : "";

        return departmentRepository.searchDepartmentsWithEmployeeCount(keyword).stream()
                .map(this::toDepartmentResponse)
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        String departmentCode = blankToNull(request.getDepartmentCode());
        validateDepartmentCode(departmentCode, null);

        Department department = Department.builder()
                .departmentName(request.getDepartmentName().trim())
                .departmentCode(departmentCode)
                .description(blankToNull(request.getDescription()))
                .build();
        Department savedDepartment = departmentRepository.save(department);

        hrAuditService.record(
                HrAuditAction.CREATE_DEPARTMENT,
                savedDepartment.getDepartmentId(),
                savedDepartment.getDepartmentName(),
                "Mã phòng ban: " + (savedDepartment.getDepartmentCode() != null
                        ? savedDepartment.getDepartmentCode()
                        : "chưa đặt")
        );

        return toDepartmentResponse(savedDepartment, 0L);
    }

    @Transactional
    public DepartmentResponse updateDepartment(UUID departmentId, DepartmentCreateRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new NotFoundException("Department", "departmentId", departmentId));
        String departmentCode = blankToNull(request.getDepartmentCode());
        validateDepartmentCode(departmentCode, departmentId);

        department.setDepartmentName(request.getDepartmentName().trim());
        department.setDepartmentCode(departmentCode);
        department.setDescription(blankToNull(request.getDescription()));
        Department savedDepartment = departmentRepository.save(department);

        hrAuditService.record(
                HrAuditAction.UPDATE_DEPARTMENT,
                savedDepartment.getDepartmentId(),
                savedDepartment.getDepartmentName(),
                "Mã phòng ban: " + (savedDepartment.getDepartmentCode() != null
                        ? savedDepartment.getDepartmentCode()
                        : "chưa đặt")
        );

        return toDepartmentResponse(
                savedDepartment,
                employeeRepository.countByDepartmentDepartmentId(departmentId)
        );
    }

    @Transactional
    public void deleteDepartment(UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new NotFoundException("Department", "departmentId", departmentId));

        if (employeeRepository.existsByDepartmentDepartmentId(departmentId)) {
            throw new BadRequestException(
                    "Phòng ban vẫn còn nhân viên. Hãy chuyển hoặc xóa nhân viên trước khi xóa phòng ban."
            );
        }

        hrAuditService.record(
                HrAuditAction.DELETE_DEPARTMENT,
                departmentId,
                department.getDepartmentName(),
                "Phòng ban không còn nhân viên tại thời điểm xóa"
        );

        departmentRepository.delete(department);
    }

    // ── Nội bộ ───────────────────────────────────────────────────────────────

    /**
     * Điều kiện lọc dùng chung cho danh sách nhân viên và danh sách theo phòng ban.
     */
    private Specification<Employee> employeeSpecification(String search, UUID departmentId) {
        String keyword = StringUtils.hasText(search) ? search.trim().toLowerCase() : null;

        return (root, query, builder) -> {
            // Chỉ nạp kèm quan hệ khi lấy dữ liệu, không áp dụng cho câu đếm bản ghi.
            if (query != null && Employee.class.equals(query.getResultType())) {
                root.fetch("department", JoinType.LEFT);
                root.fetch("position", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (departmentId != null) {
                predicates.add(builder.equal(root.get("department").get("departmentId"), departmentId));
            }

            if (keyword != null) {
                String pattern = "%" + keyword + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(builder.coalesce(root.get("employeeCode"), "")), pattern),
                        builder.like(builder.lower(root.get("name")), pattern),
                        builder.like(builder.lower(builder.coalesce(root.get("email"), "")), pattern),
                        builder.like(builder.lower(builder.coalesce(root.get("phone"), "")), pattern),
                        builder.like(builder.lower(builder.coalesce(root.get("workLocation"), "")), pattern)
                ));
            }

            return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Lọc theo tình trạng làm việc. Hồ sơ cũ chưa có giá trị được xem là "Đang làm việc".
     */
    private Specification<Employee> statusSpecification(String status) {
        if (!StringUtils.hasText(status) || "all".equalsIgnoreCase(status)) {
            return (root, query, builder) -> null;
        }

        EmployeeStatus employeeStatus = EmployeeStatus.fromLabel(status);

        return (root, query, builder) -> {
            Predicate matches = builder.equal(root.get("status"), employeeStatus.getLabel());

            return employeeStatus == EmployeeStatus.defaultStatus()
                    ? builder.or(matches, builder.isNull(root.get("status")))
                    : matches;
        };
    }

    /**
     * Lọc theo tình trạng tài khoản ngay trong câu truy vấn để tổng số bản ghi
     * của trang vẫn chính xác.
     */
    private Specification<Employee> accountStateSpecification(String accountState) {
        if (!StringUtils.hasText(accountState) || "all".equalsIgnoreCase(accountState)) {
            return (root, query, builder) -> null;
        }

        boolean mustHaveAccount = switch (accountState.toLowerCase()) {
            case "has-account" -> true;
            case "no-account" -> false;
            default -> throw new BadRequestException("Bộ lọc tài khoản không hợp lệ: " + accountState);
        };

        return (root, query, builder) -> {
            Subquery<Integer> accountQuery = query.subquery(Integer.class);
            Root<User> account = accountQuery.from(User.class);
            accountQuery.select(builder.literal(1)).where(
                    builder.equal(account.get("employee").get("employeeId"), root.get("employeeId")),
                    builder.isFalse(account.get("deleted"))
            );

            return mustHaveAccount ? builder.exists(accountQuery) : builder.not(builder.exists(accountQuery));
        };
    }

    /**
     * Nạp một lần trạng thái tài khoản của mọi nhân viên để tránh truy vấn lặp theo từng dòng.
     */
    private Map<UUID, Boolean> loadAccountStatus() {
        Map<UUID, Boolean> statusByEmployee = new HashMap<>();

        for (Object[] row : userRepository.findAccountStatusByEmployee()) {
            if (row[0] != null) {
                statusByEmployee.put((UUID) row[0], Boolean.TRUE.equals(row[1]));
            }
        }

        return statusByEmployee;
    }

    private String nextEmployeeCode() {
        return EMPLOYEE_CODE_PREFIX
                + String.format("%03d", employeeRepository.findMaxEmployeeCodeSequence() + 1);
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }

        return Math.min(size, MAX_PAGE_SIZE);
    }

    private void validateDepartmentCode(String departmentCode, UUID currentDepartmentId) {
        if (departmentCode == null) {
            return;
        }

        departmentRepository.findByDepartmentCode(departmentCode)
                .filter(department -> !department.getDepartmentId().equals(currentDepartmentId))
                .ifPresent(department -> {
                    throw new DuplicateResourceException("Department", "departmentCode", departmentCode);
                });
    }

    private void applyEmployeeRequest(Employee employee, EmployeeUpsertRequest request) {
        String phone = blankToNull(request.getPhone());
        String email = blankToNull(request.getEmail());
        assertContactAvailable(employee.getEmployeeCode(), phone, email);

        employee.setName(request.getEmployeeName().trim());
        employee.setPhone(phone);
        employee.setEmail(email);
        employee.setGender(Gender.normalize(request.getGender()));
        employee.setStatus(EmployeeStatus.fromLabel(request.getStatus()).getLabel());
        employee.setWorkLocation(blankToNull(request.getWorkLocation()));
        employee.setDepartment(resolveDepartment(request.getDepartmentId()));
        employee.setPosition(resolvePosition(request.getPositionId()));

        String avatarUrl = storeAvatar(request.getAvatar());
        if (avatarUrl != null) {
            employee.setAvatarUrl(avatarUrl);
        }
    }

    /**
     * Chặn trùng số điện thoại và email trước khi ghi, để người dùng nhận thông báo rõ ràng thay vì
     * lỗi ràng buộc thô của cơ sở dữ liệu. Tra cả hồ sơ đã xóa mềm vì ràng buộc UNIQUE vẫn tính chúng.
     */
    private void assertContactAvailable(String currentEmployeeCode, String phone, String email) {
        if (phone != null) {
            assertFieldAvailable(
                    employeeRepository.findByPhoneIncludingDeleted(phone),
                    currentEmployeeCode,
                    "Số điện thoại",
                    phone
            );
        }

        if (email != null) {
            assertFieldAvailable(
                    employeeRepository.findByEmailIncludingDeleted(email),
                    currentEmployeeCode,
                    "Email",
                    email
            );
        }
    }

    private void assertFieldAvailable(
            List<Object[]> owners,
            String currentEmployeeCode,
            String fieldLabel,
            String value
    ) {
        for (Object[] owner : owners) {
            String ownerCode = (String) owner[0];
            boolean ownerDeleted = isTrue(owner[1]);

            if (ownerCode != null && ownerCode.equals(currentEmployeeCode)) {
                continue;
            }

            throw new DuplicateResourceException(ownerDeleted
                    ? "%s \"%s\" đang thuộc hồ sơ nhân viên %s đã bị xóa. Hãy dùng giá trị khác."
                            .formatted(fieldLabel, value, ownerCode != null ? ownerCode : "cũ")
                    : "%s \"%s\" đã được dùng cho nhân viên %s."
                            .formatted(fieldLabel, value, ownerCode != null ? ownerCode : "khác"));
        }
    }

    /**
     * Đọc cờ boolean từ kết quả native query.
     * Cột {@code tinyint(1)} của MySQL được driver trả về dưới dạng Boolean, nhưng cấu hình hoặc
     * hệ quản trị khác lại trả về số, nên phải nhận cả hai kiểu.
     */
    private boolean isTrue(Object value) {
        if (value instanceof Boolean flag) {
            return flag;
        }

        return value instanceof Number number && number.intValue() != 0;
    }

    private Department resolveDepartment(UUID departmentId) {
        if (departmentId == null) {
            return null;
        }

        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new NotFoundException("Department", "departmentId", departmentId));
    }

    private EmployeePosition resolvePosition(UUID positionId) {
        if (positionId == null) {
            return null;
        }

        return employeePositionRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException("EmployeePosition", "positionId", positionId));
    }

    /**
     * Đẩy ảnh đại diện lên Cloudinary qua service dùng chung của dự án, thay vì lưu vào ổ đĩa
     * của máy chạy ứng dụng. Nhờ vậy ảnh không mất khi triển khai lại và mọi phân hệ dùng
     * chung một nơi lưu trữ.
     */
    private String storeAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            return null;
        }

        String contentType = avatar.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File ảnh đại diện phải là hình ảnh.");
        }

        try {
            return cloudinaryService.uploadFile(avatar, employeeAvatarFolder);
        } catch (RuntimeException exception) {
            throw new BadRequestException("Không tải được ảnh nhân viên lên kho ảnh chung. Vui lòng thử lại.");
        }
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    /** Nhãn "NV003 - Nguyễn Văn A" dùng cho nhật ký, đọc được cả sau khi hồ sơ bị xóa. */
    private String describe(Employee employee) {
        return StringUtils.hasText(employee.getEmployeeCode())
                ? employee.getEmployeeCode() + " - " + employee.getName()
                : employee.getName();
    }

    private String departmentNameOf(Employee employee) {
        return employee.getDepartment() != null
                ? employee.getDepartment().getDepartmentName()
                : "chưa gán";
    }

    private EmployeeResponse toEmployeeResponse(Employee employee, Map<UUID, Boolean> accountStatus) {
        Boolean accountActive = accountStatus.get(employee.getEmployeeId());

        return EmployeeResponse.builder()
                .employeeId(employee.getEmployeeId())
                .employeeCode(employee.getEmployeeCode())
                .employeeName(employee.getName())
                .phone(employee.getPhone())
                .email(employee.getEmail())
                .gender(employee.getGender())
                .departmentId(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentId()
                        : null)
                .departmentName(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentName()
                        : null)
                .departmentCode(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentCode()
                        : null)
                .positionId(employee.getPosition() != null
                        ? employee.getPosition().getPositionId()
                        : null)
                .positionName(employee.getPosition() != null
                        ? employee.getPosition().getPositionName()
                        : null)
                .workLocation(employee.getWorkLocation())
                .avatarUrl(employee.getAvatarUrl())
                .status(employee.getStatus() != null
                        ? employee.getStatus()
                        : EmployeeStatus.defaultStatus().getLabel())
                .hasAccount(accountActive != null)
                .accountActive(accountActive)
                .build();
    }

    private DepartmentResponse toDepartmentResponse(Object[] row) {
        return toDepartmentResponse((Department) row[0], (Long) row[1]);
    }

    private DepartmentResponse toDepartmentResponse(Department department, Long employeeCount) {
        return DepartmentResponse.builder()
                .departmentId(department.getDepartmentId())
                .departmentCode(department.getDepartmentCode())
                .departmentName(department.getDepartmentName())
                .description(department.getDescription())
                .employeeCount(employeeCount)
                .build();
    }
}
