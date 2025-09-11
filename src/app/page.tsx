import { MarkdownGenerator } from '@/components/markdown-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 py-12 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Markdown Generator Pro
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate custom markdown content instantly based on your inputs.
          </p>
        </div>
        <MarkdownGenerator />
      </div>
    </main>
  );
}
