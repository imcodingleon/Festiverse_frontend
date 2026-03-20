import Image from "next/image";

interface PosterImageProps {
  src: string;
  alt: string;
}

export function PosterImage({ src, alt }: PosterImageProps) {
  return (
    <div className="px-4 py-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg shadow-sm border border-border-light">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
        <Image
          alt={alt}
          className="object-cover"
          src={src}
          fill
          sizes="(max-width: 1024px) 100vw, 380px"
          priority
        />
      </div>
    </div>
  );
}
