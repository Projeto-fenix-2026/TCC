create database fenix;

use fenix;

create table usuario
(
 nome varchar(60) not null,
 categoria varchar(50) not null,
 CPF int not null,
 data_nascimento date not null,
 cidade varchar(20) not null,
 bairro varchar(20) not null,
 estado char(02) not null,
 id_usuario int not null,
constraint id_usuario primary key(id_usuario)
);
create table doaçoes
(
 valor int not null,
 metodo_pagamento varchar(50) not null,
 data_doacao date not null,
 id_usuario int not null,
 id_doacoes int not null,
constraint id_doacoes primary key(id_doacoes)
);

create table ONG
(
nome varchar(50) not null,
email varchar(70) not null,
telefone char(11) not null,
CNPJ char(14) not null,
id_pagamento int not null,
id_ong int not null,
constraint id_ong primary key(id_ong)
); 
create table profissionais
(
area varchar(50) not null,
cpf char(11) not null,
nome varchar(70) not null,
id_pagamento int not null,
id_profissionais int not null,
constraint id_profissionais primary key(id_profissionais)
);
create table pagamento
(
forma_pagamento varchar(50),
valor varchar(10000),
id_ong int not null,
id_profissionais int not null,
id_pagamento int not null,
constraint id_pagamento primary key(id_pagamento)
);
create table anuncio 
(
id_ong int not null,
titulo varchar(80),
data_publicacao date not null,
tipo_anuncio varchar(70),
id_anuncio int not null,
constraint id_anuncio primary key(id_anuncio)
);


