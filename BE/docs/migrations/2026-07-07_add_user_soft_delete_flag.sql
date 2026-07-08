USE scms_db;

SET @column_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'user'
    AND column_name = 'is_deleted'
);

SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `user` ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_active`',
  'SELECT ''is_deleted already exists'' AS message'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
