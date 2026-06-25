import { cn } from '@/lib/utils';

const platformColors: Record<string, string> = {
  linkedin: 'bg-[#0077B5]/20 text-[#0077B5] border-[#0077B5]/30',
  instagram: 'bg-[#E4405F]/20 text-[#E4405F] border-[#E4405F]/30',
  twitter: 'bg-[#1DA1F2]/20 text-[#1DA1F2] border-[#1DA1F2]/30',
  facebook: 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/30',
  tiktok: 'bg-[#00f2ea]/20 text-[#00f2ea] border-[#00f2ea]/30',
  youtube: 'bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30',
  pinterest: 'bg-[#BD081C]/20 text-[#BD081C] border-[#BD081C]/30',
  telegram: 'bg-[#0088cc]/20 text-[#0088cc] border-[#0088cc]/30',
  snapchat: 'bg-[#FFFC00]/20 text-[#FFFC00] border-[#FFFC00]/30',
  reddit: 'bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30',
};

interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

export default function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const colorClass = platformColors[platform.toLowerCase()] || 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] border-[rgba(255,255,255,0.1)]';

  return (
    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider border', colorClass, className)}>
      {platform}
    </span>
  );
}
