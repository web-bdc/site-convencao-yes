import { getSession } from "@/services/auth/session";
import { redirect } from "next/navigation";
import InscricaoExtraClient from "./InscricaoExtraClient";

export default async function InscricaoExtraPage() {
  const session = await getSession();

  if (!session) {
    redirect("/acesso-negado");
  }

  return <InscricaoExtraClient session={session} />;
}
