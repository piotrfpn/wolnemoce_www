import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const addCapacityRequestTargetPath = "/panel/moje-zapytania/nowe";

type AddCapacityRequestRedirectViewProps = {
  loginPath: string;
};

export default async function AddCapacityRequestRedirectView({
  loginPath,
}: AddCapacityRequestRedirectViewProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const encoded = encodeURIComponent(addCapacityRequestTargetPath);
    redirect(`${loginPath}?next=${encoded}&return_to=${encoded}`);
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect(
      `/panel/profil?return_to=${encodeURIComponent(addCapacityRequestTargetPath)}`
    );
  }

  redirect(addCapacityRequestTargetPath);
  return null;
}
