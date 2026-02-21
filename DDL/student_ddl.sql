CREATE TYPE alloc_status AS ENUM ('ACTIVE', 'PENDING', 'EXPIRED');

CREATE TYPE booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'DENIED'
);

-- halls

CREATE TABLE hall (
    hall_id INT GENERATED ALWAYS AS IDENTITY,
    hall_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT pk_hall PRIMARY KEY (hall_id),
    CONSTRAINT uq_hall_name UNIQUE (hall_name)
);

CREATE TABLE room (
    room_id INT GENERATED ALWAYS AS IDENTITY,
    hall_id INT NOT NULL,
    room_number TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT pk_room PRIMARY KEY (room_id),
    CONSTRAINT fk_room_hall
        FOREIGN KEY (hall_id)
        REFERENCES hall(hall_id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_room_hall_number
        UNIQUE (hall_id, room_number)
);


-- students

CREATE TABLE person (
    person_id BIGINT GENERATED ALWAYS AS IDENTITY,
    nid VARCHAR(16) UNIQUE,
    name TEXT NOT NULL,
    phone_number VARCHAR(16),

    CONSTRAINT pk_person PRIMARY KEY (person_id)
);

CREATE TABLE student (
    student_id BIGINT GENERATED ALWAYS AS IDENTITY,
    semester INT NOT NULL,
    department VARCHAR(8),
    person_id BIGINT NOT NULL UNIQUE,

    CONSTRAINT pk_student PRIMARY KEY (student_id),
    CONSTRAINT fk_student_person
        FOREIGN KEY (person_id)
        REFERENCES person(person_id)
        ON DELETE CASCADE
);

-- HALL ALLOCATION

CREATE TABLE hall_allocation (
    allocation_id BIGINT GENERATED ALWAYS AS IDENTITY,
    student_id BIGINT NOT NULL UNIQUE,
    room_id INT NOT NULL,
    status alloc_status NOT NULL DEFAULT 'PENDING',  -- paying for this id allocation id changes status

    CONSTRAINT pk_hall_allocation PRIMARY KEY (allocation_id),

    CONSTRAINT fk_alloc_student
        FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_alloc_room
        FOREIGN KEY (room_id)
        REFERENCES room(room_id)
        ON DELETE RESTRICT
);



CREATE TABLE seat_fee_payment (

    payment_id BIGINT GENERATED ALWAYS AS IDENTITY,
    allocation_id BIGINT NOT NULL UNIQUE,
    amount NUMERIC(10,2) NOT NULL,
    bank_transaction_id VARCHAR(32) UNIQUE,

    CONSTRAINT pk_seat_fee_payment PRIMARY KEY (payment_id),

    CONSTRAINT fk_payment_allocation
        FOREIGN KEY (allocation_id)
        REFERENCES hall_allocation(allocation_id)
        ON DELETE CASCADE
);


-- servise
CREATE TABLE resident_service (
    service_id BIGINT GENERATED ALWAYS AS IDENTITY,
    allocation_id BIGINT NOT NULL,
    service_name TEXT NOT NULL,
    service_period_start DATE NOT NULL,
    service_period_end DATE NOT NULL,
    service_fee_amount NUMERIC(10,2) NOT NULL,

    CONSTRAINT pk_resident_service PRIMARY KEY (service_id),

    CONSTRAINT fk_service_allocation
        FOREIGN KEY (allocation_id)
        REFERENCES hall_allocation(allocation_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_service_period
        CHECK (service_period_end >= service_period_start)
);

CREATE TABLE resident_service_payment (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY,
    service_id BIGINT NOT NULL UNIQUE,
    amount_paid NUMERIC(10,2) NOT NULL,
    bank_transaction_id VARCHAR(32) UNIQUE,

    CONSTRAINT pk_resident_service_payment PRIMARY KEY (payment_id),

    CONSTRAINT fk_payment_service
        FOREIGN KEY (service_id)
        REFERENCES resident_service(service_id)
        ON DELETE CASCADE
);

-- ROOM BOOKING
CREATE TABLE room_booking (
    booking_id BIGINT GENERATED ALWAYS AS IDENTITY,
    student_id BIGINT NOT NULL,
    room_id INT NOT NULL,
    status booking_status NOT NULL DEFAULT 'PENDING',       -- before confirming, ensure room has <6 allocation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_room_booking PRIMARY KEY (booking_id),

    CONSTRAINT fk_booking_student
        FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_room
        FOREIGN KEY (room_id)
        REFERENCES room(room_id)
        ON DELETE RESTRICT
);

-- Auth Tables
CREATE TABLE student_auth (
    sid BIGINT PRIMARY KEY,
    password TEXT NOT NULL,

    CONSTRAINT fk_student_auth_student
        FOREIGN KEY (sid)
        REFERENCES student(sid)
        ON DELETE CASCADE
);

CREATE TABLE hall_auth (
    hall_id BIGINT PRIMARY KEY,
    password TEXT NOT NULL,

    CONSTRAINT fk_hall_auth_hall
        FOREIGN KEY (hall_id)
        REFERENCES hall(hall_id)
        ON DELETE CASCADE
);
