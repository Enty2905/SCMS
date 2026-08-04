USE scms_db;

ALTER TABLE work_order
  MODIFY request_id BINARY(16) NULL;
