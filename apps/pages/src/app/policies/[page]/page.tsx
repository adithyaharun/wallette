import {readFile} from "node:fs/promises";
import path from "node:path";
import { MarkdownParser } from "../../components/markdown";
import { notFound } from "next/navigation";

// const contents = [
//   {
//     id: "privacy-policy",
//     title: "Privacy Policy",
//     file: "privacy-policy.md"
//   },
//   {
//     id: "terms-of-service",
//     title: "Terms of Service",
//     file: "terms-of-service.md"
//   }
// ]

// type PageContent = { title: string; content: string }

// async function getContent(page: string): Promise<PageContent | null> {
//   const policy = contents.find((p) => p.id === page);
//   if (!policy) {
//     return null;
//   }

//   const buffer = await readFile(path.join(process.cwd(), "src/app/policies/content", policy.file));
//   const text = buffer.toString('utf-8');
//   return { title: policy.title, content: text };
// }

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ page: string }>
// }) {
//   const { page } = await params;
//   const content = await getContent(page);

//   if (!content) notFound();

//   return {
//     title: `${content.title || 'Not Found'} | Wallette`,
//   };
// }

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params;
  // const content = await getContent(page);

  // if (!content) notFound();

  return (
    <div className="flex flex-col max-w-prose w-full mx-auto px-8 py-16 bg-white shadow-lg">
      <article className="prose">
        <MarkdownParser>{page}</MarkdownParser>
      </article>
    </div>
  );
}
