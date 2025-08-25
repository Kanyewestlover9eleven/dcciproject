export const runtime = "nodejs";
import { getActivityBySlug } from "@/lib/activities";
import { notFound } from "next/navigation";

function blocksToText(body: any): string {
  if (!body) return "";
  if (typeof body === "string") return body;
  if (Array.isArray(body)) {
    return body
      .map((node) => {
        if (node?.type === "paragraph" && Array.isArray(node.children)) {
          return node.children.map((c: any) => c?.text ?? "").join("");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }
  return "";
}

type Props = { params: { slug: string } };

export default async function ActivityDetail({ params }: Props) {
  const data = await getActivityBySlug(params.slug);
  if (!data) return notFound();
  const text = blocksToText(data.body);

  return (
    <article className="max-w-3xl mx-auto p-6 prose">
      <h1>{data.title}</h1>
      {data.date && <p className="text-sm text-gray-500">{new Date(data.date).toLocaleString()}</p>}
      {data.coverUrl && <img src={data.coverUrl} alt={data.title} className="w-full rounded-xl" />}
      <pre className="whitespace-pre-wrap text-base">{text || "No content."}</pre>
    </article>
  );
}

export const revalidate = 300;
