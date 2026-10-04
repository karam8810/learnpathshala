/*
# Add Student Phone Profile Details

## Overview
Stores a student's phone number during registration so administrators can see complete contact details alongside enrollment and mock-test purchase history.

## Modified Tables
- `profiles.phone_number` - Optional phone number captured during signup.

## Signup Behavior
- The signup form sends the phone number in the account metadata.
- The profile creation trigger copies it into `profiles.phone_number` for new accounts.
- Existing profiles remain valid and can have an empty phone number.

## Security
- The existing authenticated profile policy remains in place.
- Administrators can view the phone number as part of user management; students retain access only to their own profile row.
*/

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NULLIF(NEW.raw_user_meta_data->>'phone_number', '')
  );
  RETURN NEW;
END;
$$;
