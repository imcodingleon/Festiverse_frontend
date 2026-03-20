import { Icon } from "@/ui/components/Icon";

interface StorySectionProps {
  story: string;
}

export function StorySection({ story }: StorySectionProps) {
  if (!story) return null;

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="description" className="text-primary" />
        <h2 className="text-lg font-bold text-text-main">공연 소개</h2>
      </div>
      <div
        className="text-sm text-subtext leading-relaxed prose prose-sm max-w-none [&_img]:rounded-lg [&_img]:my-2"
        dangerouslySetInnerHTML={{ __html: story }}
      />
    </div>
  );
}
