CREATE TABLE IF NOT EXISTS usuario (
  id_usuario  INT          NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(60)  NOT NULL,
  CPF         CHAR(11)     NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  telefone    CHAR(11)     NULL,
  senha       CHAR(60)     NULL,
  genero      VARCHAR(20),
  foto_url    VARCHAR(255) NULL,
  apelido     VARCHAR(60)  NULL,
  sobre       TEXT         NULL,
  is_admin    TINYINT(1)   NOT NULL DEFAULT 0,
  status_usuario TINYINT(1) NOT NULL DEFAULT 0,
  google_id   VARCHAR(255) NULL UNIQUE,
  CONSTRAINT pk_usuario PRIMARY KEY (id_usuario)
);

-- Se a tabela já existir, rode manualmente:
-- ALTER TABLE usuario ADD COLUMN foto_url VARCHAR(255) NULL;
-- ALTER TABLE usuario MODIFY COLUMN senha CHAR(60) NOT NULL;
-- ALTER TABLE usuario ADD COLUMN apelido VARCHAR(60) NULL;
-- ALTER TABLE usuario ADD COLUMN sobre TEXT NULL;
-- ALTER TABLE usuario ADD COLUMN status_usuario TINYINT(1) NOT NULL DEFAULT 0;
-- Contas já existentes ficam com status_usuario = 0 (inativas) após essa migração.
-- Ative-as manualmente ou rode uma vez:
-- UPDATE usuario SET status_usuario = 1 WHERE status_usuario = 0;
--
-- Login com Google: CPF/telefone/senha passam a poder ficar em branco
-- (contas criadas pelo Google só ganham esses dados depois, na tela
-- "completar cadastro"), e google_id guarda o id da conta Google:
-- ALTER TABLE usuario MODIFY COLUMN CPF CHAR(11) NULL;
-- ALTER TABLE usuario MODIFY COLUMN telefone CHAR(11) NULL;
-- ALTER TABLE usuario MODIFY COLUMN senha CHAR(60) NULL;
-- ALTER TABLE usuario ADD COLUMN google_id VARCHAR(255) NULL UNIQUE;

CREATE TABLE IF NOT EXISTS numeros_socorro (
  id          INT          NOT NULL AUTO_INCREMENT,
  id_usuario  INT          NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  numero      VARCHAR(20)  NOT NULL,
  categoria   VARCHAR(60)  NULL,
  icone       VARCHAR(30)  NULL,
  descricao   VARCHAR(255) NULL,
  criado_em   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_numeros_socorro PRIMARY KEY (id),
  CONSTRAINT fk_numeros_socorro_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id_post     INT          NOT NULL AUTO_INCREMENT,
  id_usuario  INT          NOT NULL,
  categoria   VARCHAR(60)  NOT NULL DEFAULT 'geral',
  titulo      VARCHAR(200) NOT NULL,
  conteudo    TEXT         NOT NULL,
  criado_em   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_forum_posts PRIMARY KEY (id_post),
  CONSTRAINT fk_forum_posts_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
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
  descricao VARCHAR(500) NULL,
  imagem    VARCHAR(255) NULL,
  imagem_dados LONGBLOB    NULL,
  imagem_mime  VARCHAR(100) NULL,
  CONSTRAINT pk_ong PRIMARY KEY (id_ong)
);
-- imagem passa a guardar a ROTA que serve a foto (/ongs/imagem/<id>),
-- e os bytes de verdade ficam em imagem_dados — assim a foto sobrevive
-- a um reinício do Render (o disco dele é apagado a cada deploy/restart).
-- Se a tabela já existir, rode manualmente:
-- ALTER TABLE ONG ADD COLUMN imagem_dados LONGBLOB NULL;
-- ALTER TABLE ONG ADD COLUMN imagem_mime VARCHAR(100) NULL;
-- ONGs cadastradas antes dessa migração ficam sem imagem_dados —
-- é preciso reenviar a foto delas pelo painel admin.

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



USE bppt1eeecfgcdubxp4cn;

CREATE TABLE IF NOT EXISTS historico_localizacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latitude VARCHAR(50) NOT NULL,
    longitude VARCHAR(50) NOT NULL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1. Cria a tabela para os planos do site
CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    periodo VARCHAR(30) NOT NULL,
    tagline VARCHAR(150),
    destaque BOOLEAN DEFAULT FALSE
);

-- 2. Insere as duas opções: Gratuito e Plus
INSERT INTO planos (nome, preco, periodo, tagline, destaque) VALUES
('Plano Gratuito', 0.00, 'sempre', 'O essencial para o seu dia a dia.', FALSE),
('Plano Plus', 9.90, 'mês', 'Proteção completa e monitoramento contínuo.', TRUE);


USE bppt1eeecfgcdubxp4cn;
CREATE TABLE IF NOT EXISTS chamados_suporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL,
    assunto VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
);

