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

export interface AppData {
  heroStories: HeroStory[];
  knowledgeBase: KnowledgeItem[];
  publishedWorks: PublishedWork[];
  viralClips: ViralClip[];
  incidentTimeline: IncidentMilestone[];
  musicSettings?: MusicSettings;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioBase64?: string;
}
