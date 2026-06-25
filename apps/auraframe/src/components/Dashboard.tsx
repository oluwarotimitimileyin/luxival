import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  TrendingUp,
  Users,
  Eye,
  Heart,
  ChevronRight,
  Sparkles,
  User,
  Inbox,
} from 'lucide-react';
import PostCard from './cards/PostCard';
import QuickActions from './cards/QuickActions';
import { getScheduledPosts } from '@/services/distributor';
import { getPlatformStatus } from '@/services/socialPublisher';
import { getProviderStatus } from '@/services/aiProviders';
import type { ScheduledPost } from '@/services/distributor';

interface DashboardProps {
  onOpenVideoModal: () => void;
  onOpenImageModal: () => void;
  onOpenAIChat: () => void;
  onOpenBrainModal: () => void;
}

export default function Dashboard({ onOpenVideoModal, onOpenImageModal, onOpenAIChat, onOpenBrainModal }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const platforms = getPlatformStatus();
  const aiProviders = getProviderStatus();

  useEffect(() => {
    setPosts(getScheduledPosts());
  }, []);

  const statCards = [
    { label: 'Total Reach', value: '--', change: 'Awaiting data', icon: Eye, color: 'text-cyan-400' },
    { label: 'Engagement', value: '--', change: 'Awaiting data', icon: Heart, color: 'text-rose-400' },
    { label: 'Followers', value: '--', change: 'Awaiting data', icon: Users, color: 'text-emerald-400' },
    { label: 'Growth', value: '--', change: 'Awaiting data', icon: TrendingUp, color: 'text-amber-400' },
  ];

  return (
    <div className="ml-0 md:ml-[72px] min-h-screen relative z-10 pb-24 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-[rgba(255,255,255,0.06)] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Content Studio</h1>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">Manage, create, and schedule across all platforms</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search - hidden on very small screens */}
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(255,255,255,0.3)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, assets, templates..."
                className="w-48 lg:w-72 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(6,182,212,0.4)] focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
              />
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 rounded-xl glass-surface flex items-center justify-center hover:glass-elevated transition-all"
            >
              <Bell className="w-5 h-5 text-[rgba(255,255,255,0.5)]" />
            </motion.button>

            {/* Avatar - fallback to icon */}
            <div className="w-10 h-10 rounded-xl glass-surface flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
              <User className="w-5 h-5 text-[rgba(255,255,255,0.5)]" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="glass-surface rounded-2xl p-4 sm:p-5 hover:glass-elevated transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center">
                    <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upcoming Posts */}
            <div className="glass-surface rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Upcoming Posts</h2>
                    <p className="text-xs text-[rgba(255,255,255,0.4)]">
                      {posts.length > 0 ? 'Drag to reorder schedule' : 'No posts scheduled yet'}
                    </p>
                  </div>
                </div>
                {posts.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View All
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>

              {posts.length > 0 ? (
                <div className="space-y-2.5">
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title={post.title || post.content.slice(0, 60)}
                      platform={post.platform}
                      scheduledFor={new Date(post.scheduledFor).toLocaleString()}
                      status="scheduled"
                      image=""
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <Inbox className="w-7 h-7 text-[rgba(255,255,255,0.15)]" />
                  </div>
                  <p className="text-sm text-[rgba(255,255,255,0.4)] mb-1">No upcoming posts</p>
                  <p className="text-xs text-[rgba(255,255,255,0.2)]">Create content with Aura or the Content Brain to see it here</p>
                </div>
              )}
            </div>

            {/* Recent AI Creations */}
            <div className="glass-surface rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Recent AI Creations</h2>
                    <p className="text-xs text-[rgba(255,255,255,0.4)]">Images and videos generated with AI</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-[rgba(255,255,255,0.15)]" />
                </div>
                <p className="text-sm text-[rgba(255,255,255,0.4)] mb-1">No creations yet</p>
                <p className="text-xs text-[rgba(255,255,255,0.2)]">Generate images and videos using the tools above</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="glass-surface rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Quick Actions</h2>
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">One-click creation tools</p>
                </div>
              </div>
              <QuickActions
                onOpenVideoModal={onOpenVideoModal}
                onOpenImageModal={onOpenImageModal}
                onOpenAIChat={onOpenAIChat}
                onOpenBrainModal={onOpenBrainModal}
              />
            </div>

            {/* Platform Status */}
            <div className="glass-surface rounded-2xl p-4 sm:p-6">
              <h2 className="text-base font-semibold text-white mb-4">Platform Status</h2>
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-xs text-[rgba(255,255,255,0.7)]">{platform.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      platform.connected
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-white/5 text-white/30'
                    }`}>
                      {platform.connected ? 'Connected' : 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Engines Status */}
            <div className="glass-surface rounded-2xl p-4 sm:p-6">
              <h2 className="text-base font-semibold text-white mb-4">AI Engines</h2>
              <div className="space-y-3">
                {aiProviders.length > 0 ? (
                  aiProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[rgba(255,255,255,0.7)] block">{provider.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${provider.configured ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                        <span className={`text-[10px] font-medium ${provider.configured ? 'text-emerald-400' : 'text-white/30'}`}>
                          {provider.configured ? 'Active' : 'Not set'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[rgba(255,255,255,0.3)] text-center py-4">
                    Configure AI providers in Settings to get started
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
