CREATE OR REPLACE FUNCTION count_allocation (p_room_id INT)
RETURNS INT
LANGUAGE SQL
AS $$
  SELECT COUNT(*)
  FROM hall_allocation
  WHERE room_id = $1

$$;

-- Trigger for semister room capasity
CREATE OR REPLACE FUNCTION enforce_room_capasity()
  RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  
    IF (count_allocation (NEW.room_id) >= 6) THEN
      RAISE EXCEPTION 
        'Room %s is full', NEW.room_id
        USING ERRCODE = 'P1001';
    END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER room_capasity_reached
BEFORE INSERT ON hall_allocation
FOR EACH ROW
EXECUTE FUNCTION enforce_room_capasity();

CREATE OR REPLACE FUNCTION activate_allocation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE hall_allocation ha
  SET status = 'ACTIVE'
  WHERE ha.allocation_id = NEW.allocation_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER allocation_activation_trigger
AFTER INSERT ON seat_fee_payment
FOR EACH ROW
EXECUTE FUNCTION activate_allocation();

-- History Book-keeping
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