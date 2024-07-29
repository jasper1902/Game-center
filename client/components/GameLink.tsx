import Image from "next/image";
import Link from "next/link";
interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
}

interface GameLinkProps {
  href: string;
  src: StaticImageData;
  alt: string;
}

const GameLink: React.FC<GameLinkProps> = ({ href, src, alt }) => {
  return (
    <div className="max-w-[250px] hover:bg-rose-50 p-4 rounded-md cursor-pointer">
      <Link href={href}>
        <Image src={src} alt={alt} />
      </Link>
    </div>
  );
};

export default GameLink;
