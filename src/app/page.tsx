import { MarkdownGenerator } from '@/components/markdown-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 py-12 sm:p-8 md:p-12 lg:p-24 dotted-bg">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-4">
           <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Được cung cấp bởi AI thế hệ mới
          </div>
          <h1 className="font-headline font-bold tracking-tighter text-4xl sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Markdown Generator Pro
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Tạo nội dung markdown tùy chỉnh ngay lập tức. Chỉ cần cung cấp từ khóa, tên miền và giá trị của bạn để bắt đầu.
          </p>
        </div>
        <MarkdownGenerator />
      </div>
    </main>
  );
}
