DROP TABLE IF EXISTS pastebins;

CREATE TABLE pastebins (
    id SERIAL NOT NULL UNIQUE PRIMARY KEY,
    title VARCHAR(90),
    text TEXT NOT NULL,
    creationDate TIMESTAMP
);

INSERT INTO pastebins (title,text,creationDate)
VALUES 
    ('I have a dream', 'Martin Luthers Speech', '2022-04-25 11:36:25-07');

