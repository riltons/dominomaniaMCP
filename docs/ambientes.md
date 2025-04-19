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
