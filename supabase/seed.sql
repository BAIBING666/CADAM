-- Local administrator account: admin / admin123.
-- Development only: never deploy this credential to production.
INSERT INTO auth.users ( instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', 'admin@local.cadam', crypt('admin123', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"full_name":"Administrator","account":"admin"}', current_timestamp, current_timestamp, '', '', '', '');


-- test user email identity
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), (SELECT id FROM auth.users WHERE email = 'admin@local.cadam'), format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'admin@local.cadam')::text, 'admin@local.cadam')::jsonb, 'email', (SELECT id FROM auth.users WHERE email = 'admin@local.cadam')::text, current_timestamp, current_timestamp, current_timestamp);
