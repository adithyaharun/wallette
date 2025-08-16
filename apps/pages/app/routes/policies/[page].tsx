import type { Route } from "./+types/[page]";
import { MarkdownParser } from "../../components/markdown";
import { data } from "react-router";
import privacyPolicyMd from "./privacy-policy.md?raw";
import termsOfServiceMd from "./terms-of-service.md?raw";

const contents = [
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    content: privacyPolicyMd
  },
  {
    id: "terms-of-service",
    title: "Terms of Service",
    content: termsOfServiceMd
  }
]

export async function loader({ params }: Route.LoaderArgs) {
  const policy = contents.find((p) => p.id === params.page);
  if (!policy) {
    throw data("Page not found.", { status: 404 });
  }

  return { title: policy.title, content: policy.content };
}

export default function Page({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col max-w-prose w-full mx-auto px-8 py-16 shadow-lg">
      <article className="prose dark:prose-invert">
        <MarkdownParser>{loaderData.content}</MarkdownParser>
      </article>
    </div>
  )
}