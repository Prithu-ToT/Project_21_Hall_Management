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

CREATE OR REPLACE PROCEDURE semester_rollover()
LANGUAGE plpgsql
AS $$
DECLARE
    booking RECORD;
BEGIN
    UPDATE student
    SET semester = semester + 1;

    DELETE FROM hall_allocation;

    FOR booking IN
        SELECT booking_id
        FROM room_booking
        ORDER BY created_at ASC
    LOOP
        CALL process_booking(booking.booking_id);
    END LOOP;
END;
$$;