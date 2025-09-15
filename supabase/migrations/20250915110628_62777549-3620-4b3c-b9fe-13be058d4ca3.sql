-- Create admin role for specific email
-- This will assign admin role to the user with email 'Acmsadmin101@gmail.com'

-- Function to assign admin role to specific email
CREATE OR REPLACE FUNCTION assign_admin_role_by_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find user by email and assign admin role
    FOR user_record IN 
        SELECT id FROM auth.users WHERE email = 'acmsadmin101@gmail.com'
    LOOP
        -- Insert or update user role to admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_record.id, 'admin')
        ON CONFLICT (user_id, role) 
        DO NOTHING;
        
        -- Also ensure they have a user role entry (in case they don't)
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_record.id, 'user')
        ON CONFLICT (user_id, role) 
        DO NOTHING;
    END LOOP;
END;
$$;

-- Execute the function to assign admin role
SELECT assign_admin_role_by_email();

-- Create a trigger to automatically assign admin role when this specific user signs up
CREATE OR REPLACE FUNCTION auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the new user has the admin email
    IF NEW.email = 'acmsadmin101@gmail.com' THEN
        -- Insert admin role (the handle_new_user function will create the user role)
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup to auto-assign admin role
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    WHEN (NEW.email = 'acmsadmin101@gmail.com')
    EXECUTE FUNCTION auto_assign_admin_role();