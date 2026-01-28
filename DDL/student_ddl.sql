CREATE TYPE alloc_status AS ENUM ('ACTIVE', 'PENDING', 'EXPIRED');

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


CREATE TABLE person (
    person_id BIGINT GENERATED ALWAYS AS IDENTITY,
    nid VARCHAR(16) UNIQUE,
    name TEXT NOT NULL,
    phone_number VARCHAR(16),

    CONSTRAINT pk_person PRIMARY KEY (person_id)
);


CREATE TABLE student (
    student_id BIGINT GENERATED ALWAYS AS IDENTITY,
    semister INT NOT NULL,
    department VARCHAR(8),
    person_id BIGINT NOT NULL UNIQUE,

    CONSTRAINT pk_student PRIMARY KEY (student_id),
    CONSTRAINT fk_student_person
        FOREIGN KEY (person_id)
        REFERENCES person(person_id)
        ON DELETE CASCADE
);


CREATE TABLE seat_fee_payment (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY,
    allocation_id BIGINT UNIQUE,           -- one-to-one with hall_allocation
    amount NUMERIC(10,2) NOT NULL,
    bank_transaction_id VARCHAR(32) UNIQUE,

    CONSTRAINT pk_seat_fee_payment PRIMARY KEY (payment_id)
);


CREATE TABLE hall_allocation (
    allocation_id BIGINT GENERATED ALWAYS AS IDENTITY,
    room_id INT NOT NULL,
    seat_fee_payment_id BIGINT UNIQUE,
    status alloc_status NOT NULL,

    CONSTRAINT pk_alloc PRIMARY KEY (allocation_id),
    CONSTRAINT fk_alloc_room
        FOREIGN KEY (room_id)
        REFERENCES room(room_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_alloc_payment
        FOREIGN KEY (seat_fee_payment_id)
        REFERENCES seat_fee_payment(payment_id)
        ON DELETE SET NULL
);
