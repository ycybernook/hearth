import HearthApp from "@/components/HearthApp";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HearthApp user={user ? { id: user.id, email: user.email } : null} />;
}
