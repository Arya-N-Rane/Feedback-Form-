/*
  # Create feedback submissions table

  1. New Tables
    - `feedback_submissions`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
    ----------------------------------------------------------------  - `name` (text, required)
      - `contact` (text, required)
      - `date_of_experience` (date, required)
      - `date_of_submission` (date, required)
      - `before_image_url` (text, optional)
      - `after_image_url` (text, optional)
      - `overall_experience` (integer, required, 1-5 rating)
      - `quality_of_service` (text, required)
      - `timeliness` (text, required)
      - `professionalism` (text, required)
      - `communication_ease` (text, required)
      - `liked_most` (text, required)
      - `suggestions` (text, optional)
      - `would_recommend` (text, required)
      - `permission_to_publish` (boolean, required)
      - `can_contact_again` (boolean, required)

  2. Security
    - Enable RLS on `feedback_submissions` table
    - Add policy for anonymous users to insert feedback
    - Add policy for authenticated users to read all feedback (admin access)

  3. Storage
    - Create storage bucket for feedback images
    - Set up policies for image upload and access
*/

-- Create the feedback_submissions table
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  name text NOT NULL,
  contact text NOT NULL,
  date_of_experience date NOT NULL,
  date_of_submission date NOT NULL,
  before_image_url text,
  after_image_url text,
  overall_experience integer NOT NULL CHECK (overall_experience >= 1 AND overall_experience <= 5),
  quality_of_service text NOT NULL CHECK (quality_of_service IN ('Excellent', 'Good', 'Average', 'Poor')),
  timeliness text NOT NULL CHECK (timeliness IN ('Excellent', 'Good', 'Average', 'Poor')),
  professionalism text NOT NULL CHECK (professionalism IN ('Excellent', 'Good', 'Average', 'Poor')),
  communication_ease text NOT NULL CHECK (communication_ease IN ('Excellent', 'Good', 'Average', 'Poor')),
  liked_most text NOT NULL,
  suggestions text,
  would_recommend text NOT NULL,
  permission_to_publish boolean NOT NULL DEFAULT false,
  can_contact_again boolean NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to insert feedback
CREATE POLICY "Allow anonymous insert feedback"
  ON public.feedback_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for authenticated users to read all feedback (admin access)
CREATE POLICY "Allow authenticated read all feedback"
  ON public.feedback_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create storage bucket for feedback images
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for anonymous users to upload images
CREATE POLICY "Allow anonymous upload feedback images"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'feedback-images');

-- Create policy for public access to feedback images
CREATE POLICY "Allow public access to feedback images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'feedback-images');

-- Create policy for authenticated users to delete images (admin cleanup)
CREATE POLICY "Allow authenticated delete feedback images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'feedback-images');