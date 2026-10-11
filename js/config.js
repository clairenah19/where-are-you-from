// Supabase connection settings.
//
// Both values are safe to commit: the anon key is a *public* key, and what it
// can do is limited by the Row Level Security policies in supabase/schema.sql.
// NEVER put the service_role key here.
//
// Leave these empty to run in demo mode (pins are stored in this browser only).
export const SUPABASE_URL = 'https://uqvxwpcojdyuxxgotoad.supabase.co'; // project URL, without /rest/v1/
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdnh3cGNvamR5dXh4Z290b2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTg2MDEsImV4cCI6MjEwNjY3NDYwMX0.GNAMWu0PCuDm9jVGO3lvPrrARtvHBYRbBku1H6jH3c4';
