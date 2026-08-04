USE scms_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS add_hr_column_if_missing $$

CREATE PROCEDURE add_hr_column_if_missing(
  IN target_table VARCHAR(64),
  IN target_column VARCHAR(64),
  IN column_definition VARCHAR(255)
)
BEGIN
  SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = target_table
      AND COLUMN_NAME = target_column
  );

  IF @column_exists = 0 THEN
    SET @sql = CONCAT(
      'ALTER TABLE `', target_table, '` ADD COLUMN `', target_column, '` ', column_definition
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$

DELIMITER ;

CALL add_hr_column_if_missing('employee', 'email', 'VARCHAR(150) NULL AFTER `phone`');
CALL add_hr_column_if_missing('department', 'is_deleted', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL add_hr_column_if_missing('department', 'deleted_at', 'TIMESTAMP NULL');
CALL add_hr_column_if_missing('employee', 'is_deleted', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL add_hr_column_if_missing('employee', 'deleted_at', 'TIMESTAMP NULL');

DROP PROCEDURE IF EXISTS add_hr_column_if_missing;
