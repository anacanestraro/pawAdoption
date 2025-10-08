CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255),
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    endereco_id INT NULL,
    tipo_usuario VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (endereco_id) REFERENCES enderecos(id)
);

CREATE TABLE adotantes (
    usuario_id INT PRIMARY KEY REFERENCES usuarios(id),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    lar_temporario BOOLEAN DEFAULT FALSE,
    capacidade_lar_temporario INTEGER,
  
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE abrigos (
    usuario_id INT PRIMARY KEY REFERENCES usuarios(id),
    cnpj VARCHAR(18) UNIQUE,
    razao_social VARCHAR(255),
    nome VARCHAR(255),
    capacidade INTEGER,
    sobre TEXT,
    site_url VARCHAR(255),
    redes_sociais TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE administradores (
    usuario_id INT PRIMARY KEY REFERENCES usuarios(id),
    nivel_acesso INTEGER DEFAULT 1,
    departamento VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100),
    idade INTEGER,
    porte ENUM('pequeno', 'medio', 'grande'),
    sexo ENUM('macho', 'femea'),
    descricao TEXT,
    status ENUM('disponivel', 'adotado', 'processo_adocao') DEFAULT 'disponivel',
    localizacao VARCHAR(255),

    abrigo_id INTEGER REFERENCES abrigos(usuario_id),
    adotante_id INTEGER REFERENCES adotantes(usuario_id),
    lar_temporario_id INTEGER REFERENCES adotantes(usuario_id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_adocao TIMESTAMP NULL
);

CREATE TABLE animal_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id),
    url_foto VARCHAR(500) NOT NULL,
    validada BOOLEAN DEFAULT FALSE,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE validacoes_animal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_validacao ENUM('foto', 'dados'),
    status ENUM('pendente', 'aprovada', 'rejeitada') DEFAULT 'pendente',
    comentario TEXT,
    data_validacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id),
    usuario_denunciante_id INTEGER NOT NULL REFERENCES usuarios(id),
    motivo TEXT NOT NULL,
    status ENUM('pendente', 'analisada', 'resolvida') DEFAULT 'pendente',
    admin_responsavel_id INTEGER REFERENCES administradores(usuario_id),
    data_denuncia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resolucao TIMESTAMP NULL
);

CREATE TABLE solicitacoes_adocao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id),
    adotante_id INTEGER NOT NULL REFERENCES adotantes(usuario_id),
    status ENUM('pendente', 'aprovada', 'rejeitada', 'cancelada') DEFAULT 'pendente',
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resposta TIMESTAMP NULL
);

CREATE TABLE voluntarios_abrigo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adotante_id INTEGER NOT NULL REFERENCES adotantes(usuario_id),
    abrigo_id INTEGER NOT NULL REFERENCES abrigos(usuario_id),
    disponibilidade TEXT,
    habilidades TEXT,
    status ENUM('pendente', 'ativo', 'inativo', 'rejeitado') DEFAULT 'pendente',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

