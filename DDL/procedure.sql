CREATE OR REPLACE PROCEDURE process_booking(p_booking_id BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_student_id BIGINT;
    v_room_id INT;
BEGIN
    SELECT student_id, room_id
    INTO v_student_id, v_room_id
    FROM room_booking
    WHERE booking_id = p_booking_id;

    INSERT INTO hall_allocation(student_id, room_id)
    VALUES (v_student_id, v_room_id);

    UPDATE room_booking
    SET status = 'CONFIRMED'
    WHERE booking_id = p_booking_id;

EXCEPTION
    WHEN SQLSTATE 'P1001' OR unique_violation THEN
        UPDATE room_booking
        SET status = 'DENIED'
        WHERE booking_id = p_booking_id;
END;
$$;

---------------------------------------
-- semister rollover : increment semesterm, confirm/deny bookings
----------------------------------------
CREATE OR REPLACE PROCEDURE semester_rollover()
LANGUAGE plpgsql
AS $$
DECLARE
    booking RECORD;
BEGIN

    UPDATE student
    SET semester = semester + 1;

    CREATE TEMP TABLE prev_alloc AS
    SELECT student_id, room_id
    FROM hall_allocation;

    DELETE FROM hall_allocation;

    FOR booking IN
        SELECT rb.booking_id
        FROM room_booking rb
        JOIN prev_alloc pa
        ON rb.student_id = pa.student_id
        AND rb.room_id = pa.room_id
        ORDER BY rb.booking_id
    LOOP
        CALL process_booking(booking.booking_id);
    END LOOP;

    FOR booking IN
        SELECT booking_id
        FROM room_booking
        WHERE status = 'PENDING'
        ORDER BY created_at, booking_id
    LOOP
        CALL process_booking(booking.booking_id);
    END LOOP;

END;
$$;