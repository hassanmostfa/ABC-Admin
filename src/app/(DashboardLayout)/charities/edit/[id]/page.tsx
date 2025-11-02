import EditCharityPageClient from "@/app/components/charities/EditCharityPageClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditCharityPage({ params }: PageProps) {
  return <EditCharityPageClient id={params.id} />;
}
