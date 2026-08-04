USE scms_db;

SET @damaged_quantity_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tool'
    AND column_name = 'damaged_quantity'
);

SET @damaged_quantity_ddl := IF(
  @damaged_quantity_exists = 0,
  'ALTER TABLE `tool` ADD COLUMN `damaged_quantity` INT NOT NULL DEFAULT 0 AFTER `available_quantity`',
  'ALTER TABLE `tool` MODIFY COLUMN `damaged_quantity` INT NOT NULL DEFAULT 0 AFTER `available_quantity`'
);

PREPARE damaged_quantity_stmt FROM @damaged_quantity_ddl;
EXECUTE damaged_quantity_stmt;
DEALLOCATE PREPARE damaged_quantity_stmt;

ALTER TABLE `tool`
  MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'available' COMMENT 'available | damaged';
