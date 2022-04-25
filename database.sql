DROP TABLE IF EXISTS pastebins;

CREATE TABLE pastebins (
    id SERIAL NOT NULL UNIQUE PRIMARY KEY,
    title VARCHAR(90),
    text TEXT NOT NULL,
    creationDate TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO pastebins (title,text)
VALUES 
    ('I have a dream', 'Martin Luthers Speech');

