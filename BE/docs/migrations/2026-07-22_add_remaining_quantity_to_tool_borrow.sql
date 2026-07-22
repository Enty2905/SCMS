ALTER TABLE tool_borrow ADD COLUMN remaining_quantity INT DEFAULT 0 NOT NULL;

UPDATE tool_borrow SET remaining_quantity = 0 WHERE status = 'returned';
UPDATE tool_borrow SET remaining_quantity = quantity WHERE status IN ('borrowing', 'overdue');
