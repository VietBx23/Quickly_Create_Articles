import { MarkdownGenerator } from '@/components/markdown-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 py-12 sm:p-8 md:p-12 lg:p-24 bubble-flow">
      <div className="w-full max-w-4xl">
        <MarkdownGenerator />
      </div>
    </main>
  );
}
