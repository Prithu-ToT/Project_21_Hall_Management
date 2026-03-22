-- database logic to real world logic
CREATE OR REPLACE FUNCTION hall_of_room (p_room_id INT)
RETURNS INT
LANGUAGE SQL
AS $$
  SELECT hl.hall_id 
  FROM hall hl
  JOIN room rm ON hl.hall_id = rm.hall_id
  WHERE rm.room_id = $1;
$$;

CREATE OR REPLACE FUNCTION get_room_info (p_room_id INT)
RETURNS TABLE(
    hall_name TEXT,
    room_number INT
)
LANGUAGE SQL
AS $$
  SELECT hl.hall_name, rm.room_number 
  FROM room rm
  JOIN hall hl ON hl.hall_id = rm.hall_id
  WHERE rm.room_id = $1;
$$;

--SELECT get_room_info(2);  -- returns {hall_name : "TH", room_number : 102}

-- real world logic to DB logic for hall and room
CREATE OR REPLACE FUNCTION get_hall_id(p_hall_name TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_hall_id INT;
BEGIN
    SELECT hall_id INTO v_hall_id
    FROM hall
    WHERE hall_name = p_hall_name;
    
    RETURN v_hall_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_room_id(p_hall_name TEXT, p_room_no INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_hall_id INT;
    v_room_id INT;
BEGIN
    SELECT hall_id INTO v_hall_id
    FROM hall
    WHERE hall_name = p_hall_name;
    
    SELECT room_id INTO v_room_id
    FROM room
    WHERE room_number = p_room_no AND is_active = TRUE;

    return v_room_id;
END;
$$;


-- atomic insert,  hall and hall_auth both in one transaction
CREATE OR REPLACE FUNCTION add_hall_with_auth(p_hall_name TEXT, p_password TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_hall_id INT;
BEGIN
    INSERT INTO hall (hall_name) VALUES (p_hall_name)
    RETURNING hall_id INTO v_hall_id;

    INSERT INTO hall_auth (hall_id, password) VALUES (v_hall_id, p_password);

    RETURN v_hall_id;
END;
$$;

-- get hall allocation count and remaining capacity
CREATE OR REPLACE FUNCTION get_hall_alloc_count(p_hall_id INT)
RETURNS TABLE(
  TTL_ALC INT,
  REM_CAP INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  TTL_CAP INT;
  
BEGIN
  
  SELECT COUNT(ha.*), SUM(rm.capacity)
  INTO TTL_ALC, TTL_CAP
  
  FROM (
    SELECT *
    FROM room
    WHERE hall_id = p_hall_id 
      AND is_active = TRUE
  ) rm
  
  LEFT JOIN hall_allocation ha 
    ON ha.room_id = rm.room_id;
  
  RETURN QUERY
  SELECT TTL_ALC , (TTL_CAP-TTL_ALC);
END;
$$;