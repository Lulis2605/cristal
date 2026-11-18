# ONG Cristal

Sistema web desenvolvido para a **ONG Cristal** (organização dedicada ao resgate, cuidado e proteção de animais/pets). A aplicação facilita o trabalho diário dos voluntários no registro de doações recebidas, cadastro de doadores/apoiadores da causa animal e organização do catálogo de insumos (ração, higiene, medicamentos e acessórios).

Projeto Integrador Extensionista II · Análise e Desenvolvimento de Sistemas.

## Requisitos

- Node.js 24+ e Vite+ (`vp`): https://viteplus.dev
- MySQL 8+ (ou MariaDB via XAMPP)

## Como instalar e rodar

1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com
   cd cristal
   ```
2. Instale as dependências:
   ```bash
   vp install
   ```
3. Crie o banco e os dados de exemplo executando `database/schema.sql` e `database/seed.sql` no seu cliente MySQL.
4. Copie `.env.example` para `.env` e preencha os dados de acesso ao banco e o `JWT_SECRET`.
5. Terminal 1, inicie a API:
   ```bash
   vp run api
   ```
6. Terminal 2, inicie o frontend:
   ```bash
   vp dev
   ```
7. Abra `http://localhost:5173` no navegador.

## Credenciais de demonstração

- **E-mail:** `lulisjordao@gmail.com`
- **Senha:** `cristal123`

## Principais endpoints da API

- `GET /api/health` — status da API e conexão com o banco
- `POST /api/auth/login` — autenticação e geração de token JWT
- `GET /api/auth/eu` — dados do usuário autenticado
- `GET / POST / PUT / DELETE /api/doadores` — CRUD de doadores (protegido por JWT)
- `GET / POST /api/itens` e `GET /api/itens/categorias` — catálogo de insumos por categoria (protegido por JWT)
- `GET / POST /api/doacoes` e `GET /api/doacoes/:id` — registro e consulta de doações (protegido por JWT)
