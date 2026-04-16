import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://htfvjkryxrgivgifbhnj.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjgyN2MxYTMyLTJmYjktNDk3My1hZDhhLWNjNjlhMzg2MWM2YiJ9.eyJwcm9qZWN0SWQiOiJodGZ2amtyeXhyZ2l2Z2lmYmhuaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc0MjYwMjA1LCJleHAiOjIwODk2MjAyMDUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.9XeVHJ6RcM-R4dfhdok2GlDaS6AqjW9TWGafwthWrW4';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };