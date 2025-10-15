"use server";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error: loginError } = await supabase.auth.signInWithPassword(data);

  // const { error: loginError } = await supabase.auth.signInWithPassword({
  //     email: data.email,
  //     password: data.password
  // });

  if (loginError) console.error(loginError);
  redirect("/");
  // else router.push('/');
}
