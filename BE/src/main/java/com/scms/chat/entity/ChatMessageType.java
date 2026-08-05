package com.scms.chat.entity;

/**
 * Loại nội dung của một tin nhắn chat.
 */
public enum ChatMessageType {
    /** Tin nhắn văn bản thuần. */
    TEXT,
    /** Tin nhắn đính kèm ảnh, hiển thị trực tiếp trong khung chat. */
    IMAGE,
    /** Tin nhắn đính kèm tệp, hiển thị dưới dạng thẻ tải xuống. */
    FILE
}
