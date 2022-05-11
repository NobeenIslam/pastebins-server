DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS pastebins;


CREATE TABLE pastebins (
    id SERIAL NOT NULL UNIQUE PRIMARY KEY,
    title VARCHAR(90),
    text TEXT NOT NULL,
    creationDate TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO pastebins (title,text)
VALUES 
('hello', 'ellollololo'),
('2', 'second paste');


CREATE TABLE comments (
  id SERIAL PRIMARY KEY UNIQUE NOT NULL,
  paste_id INTEGER,
  comment TEXT NOT NULL,
  creationDate TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (paste_id) REFERENCES pastebins(id)
);

ALTER SEQUENCE comments_id_seq RESTART WITH 1000;

INSERT INTO comments (paste_id, comment) VALUES 
(1, 'this is a brilliant observation'),
(1, 'oh my days!'),
(2, 'i disagree with you there');
