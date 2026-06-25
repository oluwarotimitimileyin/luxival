import { motion } from 'framer-motion';
import { Play, ImageIcon } from 'lucide-react';

interface AssetThumbnailProps {
  image: string;
  title: string;
  type: 'image' | 'video';
  index: number;
}

export default function AssetThumbnail({ image, title, type, index }: AssetThumbnailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      className="group relative aspect-video rounded-xl overflow-hidden glass-surface cursor-pointer"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Type Badge */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center">
        {type === 'video' ? (
          <Play className="w-3 h-3 text-white" />
        ) : (
          <ImageIcon className="w-3 h-3 text-white" />
        )}
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <p className="text-xs font-medium text-white truncate">{title}</p>
      </div>
    </motion.div>
  );
}
