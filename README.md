# 🎓 YES! Convenção 2026

<div align="center">
  <img src="./public/logos/logo-vermelha.png" alt="YES! Idiomas" width="200" />

  [![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Turbopack](https://img.shields.io/badge/Turbopack-Enabled-FF6B6B?style=for-the-badge)](https://turbo.build/pack)
</div>

## 🌟 Sobre o Projeto

Sistema de inscrições para a **Convenção YES! Idiomas 2026** - uma plataforma moderna e intuitiva para gerenciar inscrições, cadastro de participantes e processamento de pagamentos para o maior evento educacional da rede YES!

### ✨ Funcionalidades

- 🎯 **Inscrições Online** - Sistema completo de inscrição para diferentes lotes
- 👥 **Gestão de Participantes** - Cadastro de responsáveis e convidados
- 💳 **Pagamentos Integrados** - Suporte a PIX, Cartão e Boleto
- 🏢 **116+ Unidades** - Suporte a todas as unidades YES! do Brasil
- 📱 **Responsive Design** - Funciona perfeitamente em desktop e mobile
- ⚡ **Performance** - Construído com Next.js 15 e Turbopack

## 🛠️ Tecnologias

| Tecnologia       | Versão  | Descrição                     |
| ---------------- | ------- | ----------------------------- |
| **Next.js**      | 15.1.0  | Framework React com SSR/SSG   |
| **React**        | 19.1.0  | Biblioteca para interfaces    |
| **TypeScript**   | 5.0+    | Superset tipado do JavaScript |
| **Turbopack**    | Latest  | Bundler ultra-rápido          |
| **CSS Modules**  | -       | Estilização component-scoped  |
| **Lucide Icons** | 0.544.0 | Ícones modernos               |

## 📦 Instalação

### Pré-requisitos

- Node.js 18.17+
- npm ou yarn
- Git

### Configuração Local

```bash
# Clone o repositório
git clone https://gitlab.com/robson-hansen/yes-convencao-2026.git

# Entre no diretório
cd yes-convencao-2026

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

## 🗂️ Estrutura do Projeto

```
📦 yes-convencao-2026/
├── 📂 public/
│   ├── 🖼️ galeria/          # Imagens da convenção
│   ├── 🏨 hotel/            # Fotos do hotel
│   ├── 🎯 logos/            # Logotipos YES!
│   └── 📸 momentos/         # Momentos especiais
├── 📂 src/
│   ├── 📂 app/             # App Router (Next.js 13+)
│   │   ├── 📝 inscricao-convencao/ # Fluxo principal de inscrição
│   │   ├── 📅 programacao/         # Programação do evento
│   │   ├── 🎤 palestrantes/        # Informações dos palestrantes
│   │   └── 📄 page.tsx             # Página inicial
│   ├── 📂 components/      # Componentes reutilizáveis
│   │   ├── 🎪 BannerHome/   # Banner principal
│   │   ├── 🃏 CardsConvencao/ # Cards informativos
│   │   ├── 📞 Contato/      # Formulário de contato
│   │   ├── 📊 Header/       # Cabeçalho responsivo
│   │   └── 🦶 Footer/       # Rodapé
│   ├── 📂 db/              # Base de dados
│   │   └── 🏢 unidades.json # Lista de unidades YES!
│   └── 📂 hook/            # Custom hooks
└── 📄 README.md
```

## 🎯 Funcionalidades Detalhadas

### 🎪 Página Inicial

- Banner promocional da convenção
- Galeria de momentos especiais
- Informações sobre o evento
- Call-to-action para inscrições

### 📝 Sistema de Inscrições

- **Pré-venda**: R$ 2.199,00 (até 31/10)
- **1º Lote**: R$ 2.899,00 (01/11 a 31/12)
- **2º Lote**: R$ 3.700,00 (a partir de 01/01/2026)
- Desconto especial para múltiplas inscrições

### 👤 Cadastro Inteligente

- Seleção de unidade por estado/cidade
- Validação de dados em tempo real
- Campos obrigatórios marcados
- Integração com base de 116+ unidades

### 💳 Pagamentos

- **PIX** - Pagamento instantâneo
- **Cartão de Crédito** - Parcelamento disponível
- **Boleto Bancário** - Pagamento tradicional
- Integração com gateway seguro

## 🏢 Unidades Suportadas

O sistema suporta **116 unidades** da rede YES! Idiomas distribuídas em:

| Estado                  | Unidades | Principais Cidades                       |
| ----------------------- | -------- | ---------------------------------------- |
| 🏖️ **Rio de Janeiro**   | 87       | Rio de Janeiro, Niterói, Duque de Caxias |
| 🏗️ **São Paulo**        | 5        | São Bernardo do Campo, Indaiatuba        |
| 🌴 **Alagoas**          | 3        | Maceió, Inhapi                           |
| 🏛️ **Distrito Federal** | 3        | Brasília                                 |
| ⭐ **E mais 7 estados** | 18       | Diversas cidades                         |

## 🔧 Configuração

### Customização

- **Cores**: Edite as variáveis CSS em `globals.css`
- **Unidades**: Atualize `src/db/unidades.json`
- **Preços**: Modifique em `src/app/inscricao/page.tsx`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da **YES! Idiomas**. Todos os direitos reservados.

## 👨‍💻 Desenvolvedores

**Robson Hansen**

- GitLab: [@robson-hansen](https://gitlab.com/robson-hansen)
- GitHub: [@robsonhansen](https://github.com/robsonhansen)

**Kami Faria**

- GitLab: [@kami-faria](https://gitlab.com/kamilagrupobdc)
- GitHub: [@kamifaria](https://github.com/Kamifaria)

---

<div align="center">
  <p>Feito para a <strong>YES! Idiomas</strong></p>
  <p> Convenção 2026 - Transformando o Futuro da Educação </p>
  <p>Registto</p>
</div>
```
