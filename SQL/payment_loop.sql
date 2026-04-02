ALTER TABLE hall
ADD COLUMN seat_fee NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE hall
ADD CONSTRAINT chk_hall_seat_fee_non_negative
CHECK (seat_fee >= 0);

CREATE OR REPLACE TYPE payment_status AS ENUM ('PENDING', 'PAID');
ALTER TABLE resident_service
ADD COLUMN status payment_status NOT NULL DEFAULT 'PENDING';


CREATE OR REPLACE FUNCTION process_service_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_paid_fees NUMERIC(10,2);
    v_service_fee_amount NUMERIC(10,2);
BEGIN
    SELECT COALESCE(
        SUM(
            CASE
                WHEN direction = 'STUDENT_TO_HALL' THEN amount_paid
                WHEN direction = 'HALL_TO_STUDENT' THEN -amount_paid
                ELSE 0
            END
        ),
        0
    ) INTO v_paid_fees
    FROM resident_service_payment
    WHERE service_id = NEW.service_id;

    SELECT service_fee_amount INTO v_service_fee_amount
    FROM resident_service
    WHERE service_id = NEW.service_id;

    IF v_paid_fees >= v_service_fee_amount THEN
        UPDATE resident_service
        SET status = 'PAID'
        WHERE service_id = NEW.service_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER process_service_payment_trigger
AFTER INSERT ON resident_service_payment
FOR EACH ROW
EXECUTE FUNCTION process_service_payment();

-- Add service to all allocations in a hall
CREATE OR REPLACE PROCEDURE add_service_to_all_in_hall(
    p_hall_id INT,
    p_service_name TEXT,
    p_service_period_start DATE,
    p_service_period_end DATE,
    p_service_fee_amount NUMERIC(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO resident_service (allocation_id, service_name, service_period_start, service_period_end, service_fee_amount)
    SELECT ha.allocation_id, p_service_name, p_service_period_start, p_service_period_end, p_service_fee_amount
    FROM hall_allocation ha
    JOIN room r ON ha.room_id = r.room_id
    WHERE r.hall_id = p_hall_id;
END;
$$;

CREATE TYPE payment_direction AS ENUM (
    'STUDENT_TO_HALL',
    'HALL_TO_STUDENT'
);

ALTER TABLE "resident_service_payment"
ADD COLUMN "direction" payment_direction DEFAULT 'STUDENT_TO_HALL' NOT NULL;


ALTER TABLE "seat_fee_payment"
ADD COLUMN "direction" payment_direction DEFAULT 'STUDENT_TO_HALL' NOT NULL;
