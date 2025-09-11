import { MarkdownGenerator } from '@/components/markdown-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 py-12 sm:p-8 md:p-12 lg:p-24 dotted-bg">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-4">
           <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Powered by Generative AI
          </div>
          <h1 className="font-headline font-bold tracking-tight text-[32px] text-white">
            Markdown Generator Pro
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Instantly generate custom markdown content. Just provide your keywords, domain, and value to get started.
          </p>
        </div>
        <MarkdownGenerator />
      </div>
    </main>
  );
}

    