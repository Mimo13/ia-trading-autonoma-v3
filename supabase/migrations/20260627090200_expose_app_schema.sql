-- Expose app schema to PostgREST
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, app';
NOTIFY pgrst, 'reload config';
