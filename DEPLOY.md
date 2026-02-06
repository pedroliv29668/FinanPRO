# Deployment Guide

This project is prepared for deployment on [Vercel](https://vercel.com). Because it uses Supabase for the backend and Gemini for AI features, you need to configure environment variables.

## 1. Prerequisites

- A [Vercel Account](https://vercel.com/signup)
- A [Supabase Project](https://supabase.com)
- A [Google AI Studio Key](https://aistudio.google.com/)

## 2. Deploy to Vercel

1.  Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Import the project into Vercel.
3.  **Critical Step:** In the "Configure Project" screen, expand the **Environment Variables** section and add the following:

    | Name | Value | Description |
    | :--- | :--- | :--- |
    | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Find in Supabase Settings > API |
    | `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Find in Supabase Settings > API |
    | `VITE_GEMINI_API_KEY` | `your-gemini-key` | From Google AI Studio |

4.  Click **Deploy**.

## 3. Supabase Database Setup

The application requires a specific table to store user data (`app_state`). Run the following SQL in your Supabase Project's **SQL Editor**:

```sql
-- Create the table to store application state
create table public.app_state (
  user_id uuid not null references auth.users on delete cascade,
  payload jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id)
);

-- Enable Row Level Security (RLS)
alter table public.app_state enable row level security;

-- Create policies to allow users to manage their own data
create policy "Users can view their own data" 
on public.app_state for select 
using (auth.uid() = user_id);

create policy "Users can insert/update their own data" 
on public.app_state for all 
using (auth.uid() = user_id);
```

> **Note:** If you haven't set up authentication in Supabase, go to Authentication > Providers and enable "Email" or other providers you wish to use.
