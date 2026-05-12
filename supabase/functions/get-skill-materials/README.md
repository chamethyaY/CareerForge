# get-skill-materials Edge Function

This Supabase Edge Function uses Gemini to generate 5 learning resources for a given skill, then saves them into `skill_resources`.

## Request body

```json
{
  "skill_id": "typescript",
  "skill_name": "TypeScript"
}
```

## Required environment variables

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Expected `skill_resources` columns

- `skill_id`
- `title`
- `url`
- `resource_type`
- `provider`

## Deploy

```bash
supabase functions deploy get-skill-materials
```

## Example call

```bash
curl -X POST 'https://<project-ref>.functions.supabase.co/get-skill-materials' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <anon-or-user-jwt>' \
  -d '{"skill_id":"typescript","skill_name":"TypeScript"}'
```
