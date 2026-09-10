CREATE TABLE IF NOT EXISTS users (
    id text not null primary key, 
    user_name text not null default '', 
    user_email text not null unique, 
    user_password_hash text not null default '',
    user_created_at timestamptz default CURRENT_TIMESTAMP not null, 
    user_updated_at timestamptz default CURRENT_TIMESTAMP not null
);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS user_password_hash text not null default '';

ALTER TABLE users
    ALTER COLUMN user_name SET DEFAULT '';
