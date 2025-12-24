-- Create a private bucket for uploading listening audio files (used before transcription)
insert into storage.buckets (id, name, public)
values ('listening-audio', 'listening-audio', false)
on conflict (id) do nothing;

-- Storage RLS policies for bucket: listening-audio
-- Note: storage.objects already has RLS enabled by Supabase.

-- Allow authenticated users to upload files into their own folder: <user_id>/<filename>
create policy "Users can upload their own listening audio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listening-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update/delete their own audio files
create policy "Users can update their own listening audio"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listening-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own listening audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listening-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read (download) only their own audio files
create policy "Users can read their own listening audio"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'listening-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
