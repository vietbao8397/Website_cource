-- Function to automatically enroll user when order status becomes 'paid'
CREATE OR REPLACE FUNCTION public.handle_order_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status <> 'paid') THEN
    
    -- Insert into enrollments if not already enrolled
    INSERT INTO public.enrollments (user_id, course_id, order_id)
    VALUES (NEW.user_id, NEW.course_id, NEW.id)
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on orders table
DROP TRIGGER IF EXISTS on_order_paid ON public.orders;
CREATE TRIGGER on_order_paid
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_payment();

-- Also handle INSERT with 'paid' status (e.g. free courses created directly as paid)
DROP TRIGGER IF EXISTS on_order_created_paid ON public.orders;
CREATE TRIGGER on_order_created_paid
  AFTER INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'paid')
  EXECUTE FUNCTION public.handle_order_payment();
