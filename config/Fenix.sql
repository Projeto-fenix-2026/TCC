CREATE TABLE IF NOT EXISTS usuario (
  id_usuario  INT          NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(60)  NOT NULL,
  CPF         CHAR(11)     NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  telefone    CHAR(11)     NOT NULL,
  senha       VARCHAR(255) NOT NULL,
  genero      VARCHAR(20),
  CONSTRAINT pk_usuario PRIMARY KEY (id_usuario)
);

CREATE TABLE IF NOT EXISTS doacoes (
  id_doacoes       INT            NOT NULL,
  valor            DECIMAL(10,2)  NOT NULL,
  metodo_pagamento VARCHAR(50)    NOT NULL,
  data_doacao      DATE           NOT NULL,
  id_usuario       INT            NOT NULL,
  CONSTRAINT pk_doacoes PRIMARY KEY (id_doacoes),
  CONSTRAINT fk_doacoes_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS ONG (
  id_ong    INT         NOT NULL,
  nome      VARCHAR(50) NOT NULL,
  email     VARCHAR(70) NOT NULL,
  telefone  CHAR(11)    NOT NULL,
  CNPJ      CHAR(14)    NOT NULL,
  CONSTRAINT pk_ong PRIMARY KEY (id_ong)
);

CREATE TABLE IF NOT EXISTS profissionais (
  id_profissionais INT         NOT NULL,
  nome             VARCHAR(70) NOT NULL,
  area             VARCHAR(50) NOT NULL,
  cpf              CHAR(11)    NOT NULL,
  CONSTRAINT pk_profissionais PRIMARY KEY (id_profissionais)
);

CREATE TABLE IF NOT EXISTS pagamento (
  id_pagamento     INT           NOT NULL,
  forma_pagamento  VARCHAR(50),
  valor            DECIMAL(10,2) NOT NULL,
  id_ong           INT           NOT NULL,
  id_profissionais INT           NOT NULL,
  CONSTRAINT pk_pagamento PRIMARY KEY (id_pagamento),
  CONSTRAINT fk_pagamento_ong FOREIGN KEY (id_ong) REFERENCES ONG(id_ong),
  CONSTRAINT fk_pagamento_prof FOREIGN KEY (id_profissionais) REFERENCES profissionais(id_profissionais)
);

CREATE TABLE IF NOT EXISTS anuncio (
  id_anuncio       INT         NOT NULL,
  id_ong           INT         NOT NULL,
  titulo           VARCHAR(80),
  data_publicacao  DATE        NOT NULL,
  tipo_anuncio     VARCHAR(70),
  CONSTRAINT pk_anuncio PRIMARY KEY (id_anuncio),
  CONSTRAINT fk_anuncio_ong FOREIGN KEY (id_ong) REFERENCES ONG(id_ong)
);