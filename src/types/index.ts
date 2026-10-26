export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  sourceType: 'url' | 'raw_text' | 'pdf_summary' | 'infographic';
  sourceUrl?: string;
  dateAdded: string;
  updatedAt?: string;
}

export interface PublishedWork {
  id: string;
  title: string;
  category: string;
  description: string;
  linkUrl: string;
  imageUrl: string;
  publishDate: string;
  views: string;
  badge?: string;
  mediaType?: 'photo' | 'infographic' | 'video' | 'report';
  videoUrl?: string;
  resolution?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  duration?: string;
  creator?: string;
  updatedAt?: string;
}

export interface ViralClip {
  id: string;
  title: string;
  creator: string;
  views: string;
  duration: string;
  thumbnail: string;
  linkUrl: string;
  highlight: string;
  mediaType?: 'video' | 'motion_graphic' | 'short';
  updatedAt?: string;
}

export interface IncidentMilestone {
  id: string;
  date: string;
  time: string;
  phase: string;
  title: string;
  description: string;
  status: string;
  imageUrl: string;
  technicalDetails: string;
  shortTitle?: string;
  fullStatement?: string;
  mediaType?: 'photo' | 'video';
  videoUrl?: string;
  referenceTitle?: string;
  referenceUrl?: string;
  colorAccent?: string;
  icon?: string;
  updatedAt?: string;
}

export interface HeroStory {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  linkUrl: string;
  date: string;
  badge?: string;
  mediaType?: 'photo' | 'infographic' | 'video' | 'report';
  order: number;
  updatedAt?: string;
}

export interface MusicSettings {
  driveUrl: string;
  streamUrl?: string;
  title?: string;
  defaultVolume: number;
  duckingVolume: number;
  enabled: boolean;
  updatedAt?: string;
}

export interface ChatbotSettings {
  enabled: boolean;
  autoOpen: boolean;
  welcomeMessage?: string;
  updatedAt?: string;
}

export interface EmailSmtpSettings {
  enabled: boolean;
  service?: 'gmail' | 'outlook' | 'custom' | 'test';
  host?: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
  updatedAt?: string;
}

export interface NewsSubscriber {
  id: string;
  email: string;
  storyId: string;
  storyTitle: string;
  category?: string;
  subscribedAt: string;
  active: boolean;
  tags?: string[];
  lastNotifiedAt?: string;
  notifyCount?: number;
  updatedAt?: string;
}

export interface NewsBroadcastLog {
  id: string;
  storyId: string;
  storyTitle: string;
  subject: string;
  summary: string;
  recipientCount: number;
  recipients: string[];
  aiGenerated: boolean;
  sentAt: string;
  deliveryStatus?: 'success' | 'partial' | 'failed' | 'simulated';
  deliveredEmails?: string[];
  failedEmails?: { email: string; error: string }[];
  errorMessage?: string;
  previewUrl?: string;
  smtpUser?: string;
}

export interface MarqueeMessageItem {
  id: string;
  text: string;
  textColor?: string;
  dotColor?: string;
  linkUrl?: string;
  active: boolean;
}

export interface MarqueeTickerSettings {
  enabled: boolean;
  direction: 'left-to-right' | 'right-to-left';
  speedSeconds: number;
  pauseOnHover: boolean;
  prefixLabel?: string;
  messages: MarqueeMessageItem[];
  updatedAt?: string;
}

export interface AppData {
  heroStories: HeroStory[];
  knowledgeBase: KnowledgeItem[];
  publishedWorks: PublishedWork[];
  viralClips: ViralClip[];
  incidentTimeline: IncidentMilestone[];
  musicSettings?: MusicSettings;
  chatbotSettings?: ChatbotSettings;
  newsSubscribers?: NewsSubscriber[];
  newsBroadcasts?: NewsBroadcastLog[];
  smtpSettings?: EmailSmtpSettings;
  marqueeTicker?: MarqueeTickerSettings;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioBase64?: string;
}
