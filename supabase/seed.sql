-- Filahi Dev Seed Data
-- Run after migrations are applied

-- Insert test admin profile (requires auth.users entry first)
-- This assumes a user was created via Supabase Auth UI or API
-- UPDATE: Set your admin user ID after creating it

-- INSERT INTO profiles (id, full_name, phone_number, role, preferred_lang)
-- VALUES ('REPLACE_WITH_ADMIN_USER_ID', 'Admin Filahi', '+21650123456', 'admin', 'fr');

-- Test farmer
-- INSERT INTO profiles (id, full_name, phone_number, role, whatsapp_id, preferred_lang)
-- VALUES ('REPLACE_WITH_FARMER_USER_ID', 'Farhat Fel Fel', '+21655123456', 'farmer', '21655123456', 'ar');

-- Test buyer
-- INSERT INTO profiles (id, full_name, phone_number, role, preferred_lang)
-- VALUES ('REPLACE_WITH_BUYER_USER_ID', 'Karim Restaurant La Marsa', '+21650123457', 'buyer', 'fr');
