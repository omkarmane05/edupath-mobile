
export interface JobRole {
  id: string;
  name: string;
  description: string;
  domainId: string;
  hiringProcess: string;
  officialPortals: Array<{ name: string; url: string }>;
  networkingLinks: Array<{ label: string; url: string }>;
  learningResources?: Array<{ title: string; platform: string; url: string }>;
}

export interface Domain {
  id: string;
  name: string;
  icon: string;
  roles: JobRole[];
  generalResources?: Array<{ title: string; platform: string; url: string }>;
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  resources: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  type: 'internship' | 'hackathon' | 'quiz';
  company: string;
  date: string;
  link: string;
  status?: 'Applied' | 'Under Review' | 'Interview' | 'Offered' | 'Rejected';
  appliedAt?: string;
  progress?: number;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  type: 'Internship' | 'Full-time' | 'Contract';
  location: string;
  skills: string[];
  matchScore: number;
  requirements: string[];
  keywordOverlap: string[];
  matchAnalysis?: string;
  status?: 'Saved' | 'Applying' | 'Applied' | 'Under Review' | 'Interviewed' | 'Hired';
  appliedAt?: string;
  progress?: number;
}

export interface RecentlyViewedItem {
  id: string;
  name: string;
  type: 'role' | 'domain';
  timestamp: string;
  domainName?: string;
}

export interface UserActivity {
  savedJobs: JobMatch[];
  appliedOpportunities: Opportunity[];
  appliedJobs: JobMatch[]; 
  recentlyViewed: RecentlyViewedItem[];
  lastLogin: string;
  loginMethod: 'email' | 'phone' | 'apple' | 'google' | 'guest';
}

export interface UserProfile {
  id: string;
  emailOrPhone: string;
  activity: UserActivity;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
