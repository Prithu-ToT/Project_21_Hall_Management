SELECT get_hall_id('TH');

CREATE OR REPLACE FUNCTION hall_of_room (p_room_id INT)
RETURNS INT
LANGUAGE SQL
AS $$
  SELECT hl.hall_id 
  FROM hall hl
  JOIN room rm ON hl.hall_id = rm.hall_id
  WHERE rm.room_id = $1;
$$;

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

-- room id -> real world  identifiers
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

--SELECT get_room_id('SWH', 301);