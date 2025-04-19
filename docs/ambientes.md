# Ambientes de Desenvolvimento e Produção

Neste projeto usamos dois ambientes no Supabase:

- **Desenvolvimento**: `dominomaniaApp_dev`
  - URL: https://zciflougwvuosvmulftn.supabase.co
  - Variáveis em `.env.development`

- **Produção**: `dominomaniaApp_prod`
  - URL: https://euqnfrvptiriujrdebpr.supabase.co
  - Variáveis em `.env.production`

---

## Arquivos de ambiente

Criamos dois arquivos na raiz (já ignorados pelo Git via `.gitignore`):

```text
.env.development   # dev
.env.production    # prod
```

Cada um contém:

```text
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

---

## Uso em desenvolvimento

1. Copie ou renomeie `.env.development` para `.env`:
   ```powershell
   copy .env.development .env
   ```
2. Rode o Expo:
   ```powershell
   npm run start
   ```

A aplicação usará as variáveis do `.env` (dev).

---

## Uso em produção

1. Copie ou renomeie `.env.production` para `.env`:
   ```powershell
   copy .env.production .env
   ```
2. Faça o build EAS em produção:
   ```powershell
   eas build --profile production --platform all
   ```

O build incorporará as variáveis de produção.

---

## Observações

- Nunca comite `.env` no repositório.
- Para automatizar, você pode usar `cross-env` ou scripts no `package.json`.
- Em código, acesse via `process.env` (com dotenv) ou via `Constants.expoConfig.extra` se usar `app.config.js`.

Como poderiamos fazer essa migração sem que afete os dados existentes no bd em produção?

Para migrar o schema sem riscar dados em produção, a receita geral é:

Criar uma “branch” de PROD no MCP
– Use mcp0_confirm_cost + mcp0_create_branch para gerar uma cópia isolada do banco de produção (schema + dados), onde você pode aplicar e validar todas as migrations.
Aplicar as migrations nessa branch
– Use mcp0_apply_migration (ou seu fluxo de CLI/SQL) para rodar cada .sql de alteração sobre a branch.
– Teste as queries da sua aplicação e valide que nada quebrou – os dados reais estão lá para validar os relatórios.
Mesclar só o DDL de volta em PROD
– Quando tudo estiver green, execute mcp0_merge_branch. Ele só aplica as migrations (DDL) no PROD, sem tocar nos dados existentes.
Além disso:

• Escreva migrations não-destrutivas e idempotentes:
– ADD TABLE/ADD COLUMN IF NOT EXISTS
– ALTER COLUMN sem perder dados (ou criar nova coluna, copiar, depois dropar antigo)
– Evite DROP ou ALTER TYPE “in place” sem estratégia de fallback.

• Sempre faça backup antes (snapshot ou dump) e teste em staging.

Dessa forma você garante que o schema evolua em produção sem apagar ou corromper dados.