package com.scms.hr.service;

import com.scms.employee.entity.Employee;
import com.scms.employee.entity.EmployeeStatus;
import com.scms.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Bổ sung dữ liệu cho những cột hồ sơ nhân viên được thêm sau khi hệ thống đã có dữ liệu.
 *
 * <p>employee_code: trước đây mã NV001, NV002... chỉ được sinh theo vị trí trong danh sách nên
 * mỗi lần thêm/xóa nhân viên là mã của người khác lại đổi. Sau lần chạy này mã trở thành cố định.
 *
 * <p>status: trước đây giao diện luôn hiển thị "Đang làm việc" do máy chủ trả về giá trị cố định
 * chứ không đọc từ cơ sở dữ liệu. Nay tình trạng được lưu thật, hồ sơ cũ được ghi mặc định
 * "Đang làm việc" vì đó là những người đang có mặt trong hệ thống.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmployeeCodeBackfillRunner implements ApplicationRunner {

    private static final String EMPLOYEE_CODE_PREFIX = "NV";

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        backfillEmployeeCodes();
        backfillStatuses();
    }

    private void backfillEmployeeCodes() {
        List<Employee> employees = employeeRepository.findWithoutEmployeeCode();

        if (employees.isEmpty()) {
            return;
        }

        int sequence = employeeRepository.findMaxEmployeeCodeSequence();

        for (Employee employee : employees) {
            sequence++;
            employee.setEmployeeCode(EMPLOYEE_CODE_PREFIX + String.format("%03d", sequence));
        }

        employeeRepository.saveAll(employees);
        log.info("[Migration] Đã cấp mã cố định cho {} nhân viên.", employees.size());
    }

    private void backfillStatuses() {
        List<Employee> employees = employeeRepository.findWithoutStatus();

        if (employees.isEmpty()) {
            return;
        }

        String defaultStatus = EmployeeStatus.defaultStatus().getLabel();
        employees.forEach(employee -> employee.setStatus(defaultStatus));
        employeeRepository.saveAll(employees);

        log.info("[Migration] Đã ghi tình trạng \"{}\" cho {} nhân viên.", defaultStatus, employees.size());
    }
}
