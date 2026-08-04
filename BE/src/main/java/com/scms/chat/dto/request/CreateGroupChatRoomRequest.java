package com.scms.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateGroupChatRoomRequest {

    @NotBlank(message = "Tên phòng chat không được để trống")
    @Size(min = 2, max = 150, message = "Tên phòng chat phải có từ 2 đến 150 ký tự")
    String roomName;

    @Size(max = 100, message = "Mỗi lần chỉ được thêm tối đa 100 thành viên")
    List<UUID> memberUserIds;
}
