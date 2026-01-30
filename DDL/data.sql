
-- Sample data for hall

INSERT INTO hall (hall_name, is_active) VALUES
('Alpha Hall', TRUE),
('Beta Hall', TRUE),
('Gamma Hall', TRUE),
('Delta Hall', FALSE);


-- Sample data for room

INSERT INTO room (hall_id, room_number, is_active) VALUES
(1, '101', TRUE),
(1, '102', TRUE),
(1, '103', FALSE),
(2, '201', TRUE),
(2, '202', TRUE),
(3, '301', TRUE),
(3, '302', TRUE);


-- Sample data for person

INSERT INTO person (nid, name, phone_number) VALUES
('1234567890123456', 'Md. Al Amin', '01711111111'),
('1234567890123457', 'Fatema Khatun', '01722222222'),
('1234567890123458', 'Rahim Uddin', '01733333333'),
('1234567890123459', 'Sonia Akter', '01744444444');


-- Sample data for student

INSERT INTO student (semister, department, person_id) VALUES
(3, 'CSE', 1),
(5, 'EEE', 2),
(7, 'BBA', 3),
(2, 'CSE', 4);


-- Sample data for seat_fee_payment

INSERT INTO seat_fee_payment (allocation_id, amount, bank_transaction_id) VALUES
(NULL, 5000.00, 'TXN001'),
(NULL, 5500.00, 'TXN002'),
(NULL, 5200.00, 'TXN003'),
(NULL, 5100.00, 'TXN004');


-- Sample data for hall_allocation

INSERT INTO hall_allocation (room_id, seat_fee_payment_id, status) VALUES
(1, 1, 'ACTIVE'),
(2, 2, 'PENDING'),
(4, 3, 'EXPIRED'),
(5, 4, 'ACTIVE');

-- Update seat_fee_payment allocation_id to match hall_allocation
UPDATE seat_fee_payment SET allocation_id = 1 WHERE payment_id = 1;
UPDATE seat_fee_payment SET allocation_id = 2 WHERE payment_id = 2;
UPDATE seat_fee_payment SET allocation_id = 3 WHERE payment_id = 3;
UPDATE seat_fee_payment SET allocation_id = 4 WHERE payment_id = 4;


-- Sample data for resident_service

INSERT INTO resident_service (allocation_id, service_name, service_period_start, service_period_end, service_fee_amount) VALUES
(1, 'Electricity', '2026-01-01', '2026-01-31', 500.00),
(1, 'Water', '2026-01-01', '2026-01-31', 200.00),
(2, 'Internet', '2026-01-10', '2026-02-09', 300.00),
(4, 'Cleaning', '2026-01-15', '2026-01-20', 100.00);


-- Sample data for resident_service_payment

INSERT INTO resident_service_payment (service_id, amount_paid, bank_transaction_id) VALUES
(1, 500.00, 'SRVTXN001'),
(2, 200.00, 'SRVTXN002'),
(3, 300.00, 'SRVTXN003'),
(4, 100.00, 'SRVTXN004');


-- Sample data for room_booking

INSERT INTO room_booking (student_id, room_id, status, created_at) VALUES
(1, 1, 'CONFIRMED', CURRENT_TIMESTAMP),
(2, 2, 'PENDING', CURRENT_TIMESTAMP),
(3, 3, 'DENIED', CURRENT_TIMESTAMP),
(4, 5, 'PENDING', CURRENT_TIMESTAMP);
