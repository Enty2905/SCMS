package com.scms.chat.dto.request;

import jakarta.validation.constraints.NotEmpty;
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
public class AddGroupChatMembersRequest {

    @NotEmpty(message = "Danh sách thành viên không được để trống")
    @Size(max = 100, message = "Mỗi lần chỉ được thêm tối đa 100 thành viên")
    List<UUID> memberUserIds;
}
