import EditCharityPageClient from "@/components/charities/EditCharityPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCharityPage({ params }: Props) {
  const resolvedParams = await params;
  return <EditCharityPageClient id={resolvedParams.id} />;
}
