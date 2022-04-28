DROP TABLE IF EXISTS pastebins;

CREATE TABLE pastebins (
    id SERIAL NOT NULL UNIQUE PRIMARY KEY,
    title VARCHAR(90),
    text TEXT NOT NULL,
    creationDate TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO pastebins (title,text)
VALUES 
    ('I have a dream', 'Martin Luthers Speech'),
    ('What is Lop', `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`),
    ('Why do we use it',`It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).`)


CREATE TABLE comments (
  id SERIAL PRIMARY KEY UNIQUE NOT NULL,
  paste_id INTEGER,
  comment TEXT NOT NULL,
  creationDate TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (paste_id) REFERENCES pastebins(id)
);

ALTER SEQUENCE comments_id_seq RESTART WITH 11111;

INSERT INTO comments (paste_id, comment) VALUES 
(2, 'this is a brilliant observation'),
(17, 'oh my days!'),
(17, 'i disagree with you there');
