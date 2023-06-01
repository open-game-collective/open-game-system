# Explorers Game

## Development

After cloning and running `npm install`, use these commands to get the code running.

### Game Website

`npx nx run explorers-game-web:dev`

### Server

`npx nx run api-server:serve`

### Storybook

`npx nx run explorers-game-web:storybook`

### Running Database

Make sure you have Supabase CLI installed.

Then run

`npc nx run database:start`

Once DB is running grab the values and put them in `.env.local` in a format similar to:

```
SUPABASE_URL=http://localhost:54321
SUPABASE_JWT_SECRET=Super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_KEY=EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```
