CREATE OR REPLACE FUNCTION count_allocation (p_room_id INT)
RETURNS INT
LANGUAGE SQL
AS $$
  SELECT COUNT(*)
  FROM hall_allocation
  WHERE room_id = $1

$$;

-------------------------------------
-- Trigger for semister room capasity
--------------------------------------
CREATE OR REPLACE FUNCTION enforce_room_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_cap INT;
BEGIN

  SELECT capacity
  INTO v_cap
  FROM room
  WHERE room_id = NEW.room_id
  FOR UPDATE;   -- locks room row 

  IF count_allocation(NEW.room_id) >= v_cap THEN
      RAISE EXCEPTION
        'Room % is full', NEW.room_id
        USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;

END;
$$;


CREATE OR REPLACE TRIGGER room_capasity_reached
BEFORE INSERT ON hall_allocation
FOR EACH ROW
EXECUTE FUNCTION enforce_room_capasity();

-------------------------------------------
-- trigger for activating room after payment 
-- auto inserts booking of the current room
-------------------------------------------



CREATE OR REPLACE FUNCTION activate_allocation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_paid_fees NUMERIC(10,2);
  v_student_id BIGINT;
  v_room_id INT;
  v_room_fee NUMERIC(10,2);
  v_current_status alloc_status;
BEGIN
  
  SELECT student_id, room_id, status
  INTO v_student_id, v_room_id, v_current_status
  FROM hall_allocation
  WHERE allocation_id = NEW.allocation_id;

  -- reject payment when active
  IF v_current_status = 'ACTIVE' THEN
    RETURN NEW;
  END IF;

  SELECT SUM(amount) INTO v_paid_fees
  FROM seat_fee_payment
  WHERE allocation_id = NEW.allocation_id;

  SELECT seat_fee INTO v_room_fee        
  FROM hall
  WHERE hall_id = hall_of_room(v_room_id);

  IF v_paid_fees >= v_room_fee THEN
    UPDATE hall_allocation
    SET status = 'ACTIVE'
    WHERE allocation_id = NEW.allocation_id;

    INSERT INTO room_booking (student_id, room_id)
    VALUES (v_student_id, v_room_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER allocation_activation_trigger
AFTER INSERT ON seat_fee_payment
FOR EACH ROW
EXECUTE FUNCTION activate_allocation();

-------------------------------
-- History Book-keeping -------
-------------------------------

CREATE OR REPLACE FUNCTION  insert_allocation_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO allocation_history 
  (student_id, room_id, start_date)
  VALUES
  (OLD.student_id, OLD.room_id, OLD.start_date);

  RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER allocation_bookkeeping
AFTER DELETE ON hall_allocation
FOR EACH ROW
EXECUTE FUNCTION insert_allocation_history();


------------------------------
-- validade booking insertion
--------------------------------
CREATE OR REPLACE FUNCTION validade_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$

DECLARE
  v_booking_cnt INT;

BEGIN

  SELECT COUNT(*)
  INTO v_booking_cnt
  FROM room_booking
  WHERE student_id = NEW.student_id;

  IF v_booking_cnt >= 3 THEN
    RAISE EXCEPTION
      'CANNOT ADD ANY MORE BOOKINGS';
  END IF;

  SELECT COUNT(*)
  INTO v_booking_cnt
  FROM room_booking
  WHERE student_id = NEW.student_id AND room_id  =  NEW.room_id;

  IF v_booking_cnt > 0 THEN
    RAISE EXCEPTION
      'YOU ALREADY HAVE THIS BOOKING';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER booking_validation
BEFORE INSERT ON room_booking
FOR EACH ROW
  EXECUTE FUNCTION validade_booking();