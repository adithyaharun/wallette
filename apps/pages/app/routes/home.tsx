import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Wallette Pages" },
    { name: "description", content: "Welcome to Wallette Pages!" },
  ];
}

export default function Home() {
  return <div></div>;
}
