# Backend – Daily Trivia Game (Supabase)

## Overview
This backend powers the **Daily Trivia Game** and is implemented entirely using **Supabase (PostgreSQL)**.
All business logic (scoring, ranking, statistics) lives inside the database using SQL and PL/pgSQL.

There is **no custom backend server**.

---

## Architecture

**Stack**
- Supabase (PostgreSQL)
- PL/pgSQL RPC functions
- Row Level Security (RLS)
- Supabase JS client (`rpc`)

**Core principles**
- Database is the single source of truth
- Frontend is stateless
- All calculations are deterministic and auditable
- Security enforced at database level

---

## Database Schema

The full schema is located at:

```
supabase/schema.sql
```

This file contains:
- Tables
- Constraints
- Defaults
- Indexes
- Relations

---

## Tables

### daily_questions

Stores one trivia question per date.

| Column | Type | Description |
|------|------|------------|
| question_date | DATE (PK) | Unique day identifier |
| question_text | JSONB | Question content |
| correct_answer | TEXT | Correct answer |
| hints | TEXT[] | Hint list |

---

### attempts

Stores every attempt made by a player.

| Column | Type | Description |
|------|------|------------|
| id_attempt | UUID (PK) | Attempt ID |
| question_date | DATE (FK) | References daily_questions |
| is_correct | BOOLEAN | Whether the answer was correct |
| hints_used | INTEGER | Number of hints used (nullable for failures) |
| time_ms | INTEGER | Time taken in milliseconds |
| score | INTEGER | Final score |
| created_at | TIMESTAMPTZ | Insert timestamp |

---

## Backend Logic (RPC Functions)

All backend logic is implemented via SQL functions.

### get_daily_question()

Returns the current day's question.

**Returns**
- question_text
- correct_answer
- hints

Used by frontend to load the game.

---

### submit_attempt()

Handles:
- inserting an attempt
- computing score
- computing rank
- computing daily statistics

**Signature**
```sql
submit_attempt(
  p_question_date DATE,
  p_time_ms INTEGER,
  p_hints_used INTEGER,
  p_is_correct BOOLEAN
)
```

**Returns**
- your_score
- your_rank
- players
- avg_score
- distribution (JSON)

---

## Scoring Rules

| Condition | Score |
|---------|------|
| Correct | `max(0, 300 - time_seconds - hints_used * 20)` |
| Incorrect | `0` |

---

## Ranking Logic

- Rank is based on **higher score wins**
- Failed attempts are always ranked below correct ones
- Rank is computed dynamically per day

---

## Distribution Object

Returned as JSON:

```json
{
  "no_hints": 0,
  "one_hint": 0,
  "two_hints": 0,
  "three_hints": 0,
  "failed": 0
}
```

Used by frontend to build the scoreboard visualization.

---

## Security (RLS Policies)

Row Level Security is enabled on all tables.

Policies are defined to:
- Allow inserts for attempts
- Prevent unauthorized updates
- Allow safe reads where required

Policies can be exported using:
```sql
select * from pg_policies where schemaname = 'public';
```

---

## Local Development

1. Install Supabase CLI
2. Login:
```bash
supabase login
```

3. Link project:
```bash
supabase link
```

4. Pull schema:
```bash
supabase db dump --schema public > supabase/schema.sql
```

---

## Project Structure

```
backend/
├─ supabase/
│  └─ schema.sql
├─ README.md
```

---

## Notes

- All logic is deterministic and reproducible
- No hidden state
- Frontend is fully replaceable
- Backend is database-driven by design

---

## Authors

Backend designed and implemented as part of the **Daily Trivia Game** university project.

