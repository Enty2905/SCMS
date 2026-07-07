# HƯỚNG DẪN TỰ HỌC - PHÂN TÍCH CODE CHI TIẾT (SCMS)

Tài liệu này được biên soạn để giúp bạn nắm vững kiến thức, hiểu rõ bản chất nghiệp vụ và cách triển khai các tính năng đã thực hiện trong nhánh `fix-equipment`. Bạn có thể vừa xem tài liệu này vừa thực hành/đọc code để tự nâng cao trình độ.

---

## PHẦN 1: CƠ CHẾ XÓA MỀM (SOFT DELETE) - BACKEND
*File tham khảo:* [Equipment.java](file:///c:/Users/trand/IdeaProjects/SCMS/BE/src/main/java/com/scms/equipment/entity/Equipment.java) và [EquipmentSystem.java](file:///c:/Users/trand/IdeaProjects/SCMS/BE/src/main/java/com/scms/equipment/entity/EquipmentSystem.java)

### 1. Vấn đề của Xóa cứng (Hard Delete)
Thông thường, lệnh `repository.deleteById(id)` sẽ chạy câu lệnh SQL: `DELETE FROM table WHERE id = ?`.
*   **Hậu quả:** Nếu thiết bị này đã từng có **lịch sử sửa chữa** (`repair_history`) liên kết khóa ngoại với nó, MySQL sẽ chặn lại và báo lỗi ràng buộc dữ liệu. Nếu ép buộc xóa, toàn bộ dữ liệu lịch sử sửa chữa trong quá khứ của thiết bị sẽ mất sạch (vi phạm quy tắc an toàn thông tin nhà máy).

### 2. Giải pháp Xóa mềm (Soft Delete)
Chúng ta chỉ cập nhật trạng thái hoạt động của thiết bị sang "Đã xóa" bằng cờ `is_deleted = true`.
Dưới đây là cách cấu hình thực thể Entity bằng JPA & Hibernate:

```java
@Entity
@Table(name = "equipment")
@SQLDelete(sql = "UPDATE equipment SET is_deleted = true WHERE equipment_id = ?")
@SQLRestriction("is_deleted = false")
public class Equipment {
    // ... các trường khác ...

    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean is_deleted = false;
}
```

#### Giải nghĩa từng Annotation quan trọng:
*   `@SQLDelete(sql = "UPDATE ...")`: Khi gọi hàm xóa `delete(entity)` hoặc `deleteById(id)` trong Spring Data JPA, Hibernate sẽ tự động chặn câu lệnh `DELETE` mặc định và thay thế bằng lệnh `UPDATE` ở trên.
*   `@SQLRestriction("is_deleted = false")`: (Hibernate 6 thay thế cho `@Where` cũ). Khi bạn viết bất kỳ câu lệnh tìm kiếm nào (ví dụ: `findAll()`, `findById()`), Hibernate sẽ tự động đính kèm thêm điều kiện `AND is_deleted = false` vào cuối câu SQL. Nhờ vậy, dữ liệu đã bị xóa mềm sẽ tự động ẩn đi mà bạn không cần phải lọc thủ công ở Service.
*   `is_deleted` với `@Builder.Default`: Nhằm bảo đảm khi tạo mới thiết bị bằng mẫu Builder (Lombok), trường này luôn được gán giá trị mặc định là `false`, tránh lỗi dữ liệu bị `null`.

---

## PHẦN 2: BẢNG PHÂN CẤP CÂY THU GỌN/MỞ RỘNG (TREE-TABLE)
*File tham khảo:* [EquipmentSystemPage.jsx](file:///c:/Users/trand/IdeaProjects/SCMS/FE/src/features/equipment/pages/EquipmentSystemPage.jsx)

### 1. Thuật toán duyệt cây đệ quy
Để biểu diễn các hệ thống dạng cha - con (Ví dụ: Hệ thống Lò hơi -> Hệ thống quạt gió -> Động cơ quạt), chúng ta lưu thuộc tính `parentSystemId` ở mỗi phần tử con. 
Khi hiển thị ra bảng, ta dùng hàm duyệt đệ quy để sắp xếp thứ tự:

```javascript
const displaySystems = useMemo(() => {
  // 1. Nếu đang tìm kiếm, hiển thị phẳng kết quả
  if (searchSystemCode.trim() !== '' || searchSystemName.trim() !== '') {
    return filteredSystems.map((sys) => ({ ...sys, level: 0, hasChildren: false }))
  }

  // 2. Hàm đệ quy dựng cây
  const buildTree = (parentId = null, level = 0, result = []) => {
    // Lọc ra các con trực tiếp của parentId hiện tại
    const children = systems.filter((sys) => {
      if (!parentId) return !sys.parentSystemId; // Lọc các hệ thống gốc
      return sys.parentSystemId === parentId;
    })

    for (const child of children) {
      // Kiểm tra xem hệ thống này có con bên dưới nữa không
      const hasChildren = systems.some((s) => s.parentSystemId === child.systemId)
      result.push({ ...child, level, hasChildren })

      // Nếu hệ thống đang mở (nằm trong expandedSystemIds), tiếp tục đệ quy xuống con của nó
      if (hasChildren && expandedSystemIds.has(child.systemId)) {
        buildTree(child.systemId, level + 1, result)
      }
    }
    return result
  }

  return buildTree(null, 0, [])
}, [systems, filteredSystems, searchSystemCode, searchSystemName, expandedSystemIds])
```

#### Cách hoạt động:
*   `useMemo`: Tránh tính toán lại thuật toán dựng cây này mỗi lần Component render trừ khi dữ liệu `systems` hoặc cờ đóng mở `expandedSystemIds` thay đổi.
*   `level`: Lưu cấp độ sâu của node (0 là cha gốc, 1 là con, 2 là cháu...). Biến này dùng để căn chỉnh thụt lề bằng CSS:
    `style={{ paddingLeft: `${sys.level * 24}px` }}`.

### 2. Sự kiện nổi bọt (Event Bubble) và click dòng
Người dùng muốn click vào bất kỳ đâu trên dòng `<tr>` để đi tới chi tiết. Tuy nhiên, trên dòng có các nút: *Đóng/mở rộng*, *Sửa*, *Xóa*. Nếu click vào nút Xóa mà trang web lại chuyển sang xem chi tiết thì sẽ bị lỗi trải nghiệm.

#### Giải pháp: `e.stopPropagation()`
Khi click một phần tử con bên trong dòng, sự kiện click sẽ tự động lan truyền ngược lên các phần tử cha (`tr`). Để ngăn chặn việc này, ta làm như sau:

```javascript
<button
  onClick={(e) => {
    e.stopPropagation(); // CHẶN LẠI TẠI ĐÂY - Không cho sự kiện truyền lên thẻ <tr>
    handleDelete(sys);
  }}
>
  Xóa
</button>
```

---

## PHẦN 3: TỰ THIẾT KẾ COMPONENT CONFIRM MODAL (REACT)
*File tham khảo:* [ConfirmModal.jsx](file:///c:/Users/trand/IdeaProjects/SCMS/FE/src/shared/components/ui/ConfirmModal.jsx)

Thay vì dùng `window.confirm` xấu xí của trình duyệt, ta tự dựng một Portal Modal cao cấp bằng React & Tailwind CSS.

### 1. Phông nền mờ ảo (Backdrop Blur):
Sử dụng bộ đôi class:
*   `bg-slate-950/40`: Làm tối màn hình phía sau.
*   `backdrop-blur-[6px]`: Tạo hiệu ứng làm nhòe mờ kính cực kỳ sang trọng và chuyên nghiệp.

### 2. Hiệu ứng động xuất hiện (Entry Animations):
Thêm lớp hiệu ứng:
*   `animate-in fade-in zoom-in-95 duration-200`: Giúp Modal hiển thị từ từ từ mờ sang rõ, đồng thời zoom nhẹ từ 95% lên 100% tạo cảm giác trồi lên sống động.

---

## PHẦN 4: THIẾT KẾ BỘ LỌC TÌM KIẾM SONG SONG (AND LOGIC)
*File tham khảo:* [EquipmentListPage.jsx](file:///c:/Users/trand/IdeaProjects/SCMS/FE/src/features/equipment/pages/EquipmentListPage.jsx)

Khi thực hiện lọc, chúng ta tạo ra nhiều tiêu chí độc lập (`searchKksCode`, `searchEquipmentName`, `typeFilter`, `statusFilter`). Logic lọc trong `useMemo` được viết ngắn gọn bằng các điều kiện kiểm tra chân trị:

```javascript
const filteredEquipments = useMemo(() => {
  return equipments.filter((eq) => {
    const kksLower = searchKksCode.trim().toLowerCase()
    const nameLower = searchEquipmentName.trim().toLowerCase()

    // 1. Kiểm tra mã KKS: Nếu ô tìm kiếm rỗng thì mặc định là khớp (!kksLower)
    const matchesKks = !kksLower || eq.kksCode?.toLowerCase().includes(kksLower)

    // 2. Kiểm tra Tên: Nếu rỗng mặc định khớp
    const matchesName = !nameLower || eq.equipmentName?.toLowerCase().includes(nameLower)

    // 3. Kiểm tra Loại
    const matchesType = typeFilter === 'all' || eq.equipmentType === typeFilter

    // 4. Kiểm tra Trạng thái
    const matchesStatus = statusFilter === 'all' || eq.status?.toLowerCase() === statusFilter.toLowerCase()

    // 5. Kiểm tra Hệ thống đang lọc từ URL
    const matchesSystem = systemFilter === 'all' || (allowedSystemIds && allowedSystemIds.has(eq.systemId))

    // Kết quả phải thỏa mãn TẤT CẢ các điều kiện trên
    return matchesKks && matchesName && matchesSystem && matchesType && matchesStatus
  })
}, [equipments, searchKksCode, searchEquipmentName, systemFilter, typeFilter, statusFilter, allowedSystemIds])
```

#### Tại sao cách viết này hiệu quả?
*   Cách viết `const matchesX = !input || checkCondition` giúp loại bỏ toàn bộ các khối lệnh `if/else` lồng nhau phức tạp.
*   Nếu người dùng không nhập gì vào ô tìm kiếm Mã KKS, `!kksLower` sẽ là `true` và bỏ qua việc lọc theo mã KKS một cách trơn tru.
