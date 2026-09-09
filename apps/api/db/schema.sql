CREATE TABLE IF NOT EXISTS users (
    id text not null primary key, 
    user_name text not null, 
    user_email text not null unique, 
    user_created_at timestamptz default CURRENT_TIMESTAMP not null, 
    user_updated_at timestamptz default CURRENT_TIMESTAMP not null
);
