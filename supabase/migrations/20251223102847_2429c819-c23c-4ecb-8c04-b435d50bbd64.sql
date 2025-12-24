-- Add show_labels column to reading_passages table
ALTER TABLE public.reading_passages 
ADD COLUMN show_labels boolean NOT NULL DEFAULT true;