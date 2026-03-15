DO
$$
DECLARE
    stmt TEXT;
BEGIN
    SELECT 'TRUNCATE TABLE '
           || string_agg(format('%I.%I', schemaname, tablename), ', ')
           || ' RESTART IDENTITY CASCADE;'
    INTO stmt
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');

    EXECUTE stmt;
END;
$$;


-- =====================================================
-- COMPLETE TEST DATASET FOR FULL HALL MANAGEMENT SCHEMA
-- 3 HALLS | 15 STUDENTS | AUTH | ALLOCATIONS | PAYMENTS
-- =====================================================


-- =============================
-- 1. HALLS
-- =============================

INSERT INTO hall (hall_name) VALUES
('TH'),
('AUH'),
('SWH');


-- =============================
-- 2. HALL AUTH (ADMIN PASSWORDS)
-- =============================

INSERT INTO hall_auth (hall_id, password) VALUES
(1, 'th_admin_pass'),
(2, 'auh_admin_pass'),
(3, 'swh_admin_pass');


-- =============================
-- 3. ROOMS (5 PER HALL)
-- =============================

INSERT INTO room (hall_id, room_number) VALUES
-- Hall 1
(1,'101'),(1,'102'),(1,'103'),(1,'104'),(1,'105'),
-- Hall 2
(2,'201'),(2,'202'),(2,'203'),(2,'204'),(2,'205'),
-- Hall 3
(3,'301'),(3,'302'),(3,'303'),(3,'304'),(3,'305');


-- =============================
-- 4. PERSONS (15)
-- =============================

INSERT INTO person (nid, name, phone_number) VALUES
('NID001','Student 01','01700000001'),
('NID002','Student 02','01700000002'),
('NID003','Student 03','01700000003'),
('NID004','Student 04','01700000004'),
('NID005','Student 05','01700000005'),
('NID006','Student 06','01700000006'),
('NID007','Student 07','01700000007'),
('NID008','Student 08','01700000008'),
('NID009','Student 09','01700000009'),
('NID010','Student 10','01700000010'),
('NID011','Student 11','01700000011'),
('NID012','Student 12','01700000012'),
('NID013','Student 13','01700000013'),
('NID014','Student 14','01700000014'),
('NID015','Student 15','01700000015');


-- =============================
-- 5. STUDENTS
-- =============================

INSERT INTO student (semester, department, person_id) VALUES
(1,'CSE',1),
(2,'CSE',2),
(3,'EEE',3),
(4,'BBA',4),
(5,'LAW',5),
(6,'CSE',6),
(7,'EEE',7),
(8,'BBA',8),
(1,'CSE',9),
(2,'EEE',10),
(3,'LAW',11),
(4,'CSE',12),
(5,'EEE',13),
(6,'BBA',14),
(7,'LAW',15);


-- =============================
-- 6. STUDENT AUTH (PASSWORDS)
-- =============================

INSERT INTO student_auth (student_id, password) VALUES
(1,'pass01'),
(2,'pass02'),
(3,'pass03'),
(4,'pass04'),
(5,'pass05'),
(6,'pass06'),
(7,'pass07'),
(8,'pass08'),
(9,'pass09'),
(10,'pass10'),
(11,'pass11'),
(12,'pass12'),
(13,'pass13'),
(14,'pass14'),
(15,'pass15');


-- =============================
-- 7. HALL ALLOCATIONS (ALL PENDING)
-- =============================

INSERT INTO hall_allocation (student_id, room_id)
VALUES
-- Hall 1
(1,1),(2,2),(3,3),(4,4),(5,5),
-- Hall 2
(6,6),(7,7),(8,8),(9,9),(10,10),
-- Hall 3
(11,11),(12,12),(13,13),(14,14),(15,15);


-- =============================
-- 8. SEAT FEE PAYMENTS (FIRST 10)
-- =============================

INSERT INTO seat_fee_payment (allocation_id, amount, bank_transaction_id)
VALUES
(1,5000,'TXN001'),
(2,5000,'TXN002'),
(3,5000,'TXN003'),
(4,5000,'TXN004'),
(5,5000,'TXN005'),
(6,5000,'TXN006'),
(7,5000,'TXN007'),
(8,5000,'TXN008'),
(9,5000,'TXN009'),
(10,5000,'TXN010');


-- =============================
-- 9. RESIDENT SERVICES
-- =============================

INSERT INTO resident_service
(allocation_id, service_name, service_period_start, service_period_end, service_fee_amount)
VALUES
(1,'Laundry','2026-01-01','2026-01-31',500),
(2,'Meal','2026-01-01','2026-01-31',2000),
(3,'Laundry','2026-02-01','2026-02-28',500),
(4,'Internet','2026-01-01','2026-03-31',1500);


-- =============================
-- 10. RESIDENT SERVICE PAYMENTS
-- =============================

INSERT INTO resident_service_payment
(service_id, amount_paid, bank_transaction_id)
VALUES
(1,500,'S-TXN001'),
(2,2000,'S-TXN002'),
(3,500,'S-TXN003'),
(4,1500,'S-TXN004');


-- =============================
-- 11. ROOM BOOKINGS
-- =============================

INSERT INTO room_booking (student_id, room_id)
VALUES
(11,1),
(12,2),
(13,3);


-- =============================
-- 12. ALLOCATION HISTORY
-- =============================

INSERT INTO allocation_history
(student_id, room_id, start_date, end_date)
VALUES
(1,2,'2025-01-01','2025-12-31'),
(6,7,'2025-01-01','2025-12-31'),
(11,12,'2024-01-01','2024-12-31');
