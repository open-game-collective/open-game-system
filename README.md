![ogs_full_v3 (1)](https://github.com/open-game-collective/open-game-system/assets/718391/7782195d-3c2a-438f-a2cc-c4af7a320025)

## Setup

Ensure you have `node` 16+ running with `npm` and `npx` in your local environment. Clone and run `npm install`.

### Development Commands

- `npx nx run api-server:serve` (game/api server)
- `npx nx run stream-server:serve` (streaming server)
- `npx nx run opengame-org-web:dev` (opengame.org website)
- `npx nx run strikers:storybook` (for strikers component dev)
- `npx nx run strikers-game-web:storybook` (for play testing strikers)
- `npx nx run strikers-game-web:dev` (strikers.game website)

### Configuration

The following local variables are required when running the application.

```
PUBLIC_API_WS_SERVER_URL=wss://my-dev-env-3001.opengame.org
PUBLIC_API_HTTP_SERVER_URL=https://my-dev-env-3001.opengame.org/trpc
PUBLIC_HLS_SERVER_URL=https://my-dev-env-3333.opengame.org/
PUBLIC_STRIKERS_GAME_WEB_URL=https://my-dev-env-3000.opengame.org
PUBLIC_VAPID_PUBLIC_KEY=BDf_JKlIjFR59lVYAo_AqP3FPeTwf9lVYFPeT-ozuaijg4BTAo_AqP30iNJyRuC-IN3YdA
VAPID_PRIVATE_KEY=UpB1CcUpSUq39kiKwHVJDFTmDPbpSUq39eetxsIXJ67R4
```

Consider using `cloudflared` to set up a tunnel to local ports. Request to have your client added to a subdomain for *.dev.opengame.org.
