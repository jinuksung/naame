# Toss Feedback Setup

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database Schema
- Use the same SQL schema already used by web:
  - `/Users/JINUKSOUNG/Desktop/jinuk/name/apps/web/src/server/feedback/supabase.schema.sql`

## Flow
- `POST /api/feedback/name` stores vote counters by name key
- `POST /api/recommend/free` reads counters and applies bounded score adjustment
