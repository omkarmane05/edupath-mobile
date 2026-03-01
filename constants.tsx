
import React from 'react';
import {
  ShieldCheck, Brain, Gamepad2, Globe, Smartphone,
  Settings, Cloud, Layout, Database, Link,
  Cpu, CheckCircle, Briefcase, TrendingUp,
  HardDrive, BarChart, Server, Bot, Search, GraduationCap,
  Youtube, BookOpen, Terminal, Video, MessageSquare,
  FlaskConical, Rocket, Leaf, Landmark, Radio, Microscope, Scale, Music, PenTool,
  Zap, Play, Timer, Award, Flame, Monitor, Code, Lock, Glasses, Atom, UserCheck, HeartPulse,
  Ghost, Telescope, Microchip, Library, Activity, Wind, Laptop,
  Navigation, Satellite, Eye, Waves, Heart, Star, Map, Camera
} from 'lucide-react';
import { Domain } from './types';

export const DOMAINS: Domain[] = [
  { id: 'frontend', name: 'Frontend Dev', icon: 'Layout', roles: [] },
  { id: 'backend', name: 'Backend Dev', icon: 'Server', roles: [] },
  { id: 'mobile', name: 'Mobile Apps', icon: 'Smartphone', roles: [] },
  { id: 'devops', name: 'DevOps & SRE', icon: 'Settings', roles: [] },
  { id: 'cloud', name: 'Cloud Computing', icon: 'Cloud', roles: [] },
  { id: 'aiml', name: 'AI & ML', icon: 'Brain', roles: [] },
  { id: 'datasci', name: 'Data Science', icon: 'BarChart', roles: [] },
  { id: 'cyber', name: 'Cybersecurity', icon: 'ShieldCheck', roles: [] },
  { id: 'blockchain', name: 'Web3 & Crypto', icon: 'Link', roles: [] },
  { id: 'robotics', name: 'Robotics', icon: 'Bot', roles: [] },
  { id: 'uiux', name: 'UI/UX Design', icon: 'PenTool', roles: [] },
  { id: 'gaming', name: 'Game Dev', icon: 'Gamepad2', roles: [] },
  { id: 'fintech', name: 'FinTech', icon: 'Landmark', roles: [] },
  { id: 'spacetech', name: 'SpaceTech', icon: 'Rocket', roles: [] },
  { id: 'greentech', name: 'Sustainability', icon: 'Leaf', roles: [] },
  { id: 'embedded', name: 'Embedded Systems', icon: 'Cpu', roles: [] },
  { id: 'quantum', name: 'Quantum Computing', icon: 'Atom', roles: [] },
  { id: 'biotech', name: 'BioTechnology', icon: 'Microscope', roles: [] },
  { id: 'arvr', name: 'AR/VR Systems', icon: 'Glasses', roles: [] },
  { id: 'ecommerce', name: 'E-Commerce', icon: 'Layout', roles: [] },
  { id: 'govtech', name: 'GovTech', icon: 'Landmark', roles: [] },
  { id: 'edtech', name: 'EdTech', icon: 'GraduationCap', roles: [] },
  { id: 'medtech', name: 'HealthTech', icon: 'HeartPulse', roles: [] },
  { id: 'creative', name: 'Digital Arts', icon: 'Camera', roles: [] },
];

// Populate specific, high-value roles for each domain
const ROLE_TEMPLATES: Record<string, string[]> = {
  'frontend': ['React Developer', 'Vue.js Specialist', 'Frontend Architect', 'Accessibility Expert', 'Design Systems Engineer', 'Web Performance Engineer'],
  'backend': ['Node.js Engineer', 'Go Backend Developer', 'Python API Developer', 'Java Microservices Architect', 'Database Reliability Engineer'],
  'mobile': ['iOS Developer (Swift)', 'Android Developer (Kotlin)', 'React Native Engineer', 'Flutter Developer', 'Mobile Architect'],
  'aiml': ['Machine Learning Engineer', 'NLP Specialist', 'Computer Vision Engineer', 'AI Ethicist', 'LLM Engineer', 'Prompt Engineer', 'RAG Architect'],
  'datasci': ['Data Scientist', 'Data Analyst', 'Data Engineer', 'Big Data Architect', 'Business Intelligence Developer'],
  'devops': ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer', 'Kubernetes Administrator', 'Cloud Security Engineer'],
  'cloud': ['AWS Solutions Architect', 'Azure Cloud Engineer', 'Google Cloud Architect', 'Serverless Specialist'],
  'cyber': ['Penetration Tester', 'Security Analyst', 'SOC Analyst', 'Cryptographer', 'Identity & Access Manager'],
  'blockchain': ['Smart Contract Developer', 'Solidity Engineer', 'Web3 Frontend Dev', 'Blockchain Architect'],
  'uiux': ['Product Designer', 'UX Researcher', 'UI Designer', 'Interaction Designer', 'Visual Designer'],
  'gaming': ['Unity Developer', 'Unreal Engine Developer', 'Game Gameplay Programmer', 'Graphics Programmer'],
};

DOMAINS.forEach(d => {
  // Use specific roles if available, otherwise fallback to generic titles
  const specificRoles = ROLE_TEMPLATES[d.id];

  if (specificRoles) {
    d.roles = specificRoles.map((title, i) => ({
      id: `${d.id}-role-${i}`,
      name: title,
      description: `Specialized high-growth career track in ${title}.`,
      domainId: d.id,
      hiringProcess: "Screening -> Technical Round -> System Design -> Culture Fit",
      officialPortals: [{ name: "Careers Page", url: "#" }],
      networkingLinks: [{ label: "LinkedIn Community", url: "#" }]
    }));
  } else {
    const titles = ['Specialist', 'Architect', 'Researcher', 'Analyst', 'Engineer'];
    d.roles = titles.map((title, i) => ({
      id: `${d.id}-role-${i}`,
      name: `${d.name} ${title}`,
      description: `Professional career track in ${d.name}.`,
      domainId: d.id,
      hiringProcess: "Assessment -> Technical -> HR",
      officialPortals: [{ name: "Portal", url: "#" }],
      networkingLinks: [{ label: "Mentor", url: "#" }]
    }));
  }
});

export const getIcon = (iconName: string, size = 24, className = "text-blue-600") => {
  const icons: any = {
    ShieldCheck, Brain, Gamepad2, Globe, Smartphone, Settings, Cloud, Layout,
    Database, Link, Cpu, CheckCircle, Briefcase, TrendingUp, HardDrive, BarChart,
    Server, Bot, Search, GraduationCap, Youtube, BookOpen, Terminal, Video,
    MessageSquare, FlaskConical, Rocket, Leaf, Landmark, Radio, Microscope, Scale,
    Music, PenTool, Glasses, Atom, UserCheck, HeartPulse, Lock, Zap, Play, Timer,
    Award, Flame, Monitor, Code, Ghost, Telescope, Microchip, Library, Activity, Wind,
    Laptop, Navigation, Satellite, Eye, Waves, Heart, Star, Map, Camera
  };
  const IconComponent = icons[iconName] || Search;
  return <IconComponent size={size} className={className} />;
};

export const LIBRARY_CATEGORIES = [
  {
    id: 'ai-data',
    title: 'AI & Data Science',
    subtitle: 'Machine Learning, LLMs & Big Data',
    icon: <Brain className="w-5 h-5 text-purple-600" />,
    items: [
      { title: 'Fine-Tuning Llama 4 for Enterprise', channel: 'AI Frontier', duration: '42:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400' },
      { title: 'Advanced RAG Architectures', channel: 'Vector Hub', duration: '28:15', url: '#', thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=400' },
      { title: 'Data Governance in 2026', channel: 'Data Strategy', duration: '15:40', url: '#', thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'cyber-web3',
    title: 'Cybersecurity & Web3',
    subtitle: 'Defense, Blockchain & Privacy',
    icon: <ShieldCheck className="w-5 h-5 text-red-600" />,
    items: [
      { title: 'Zero-Knowledge Proofs Masterclass', channel: 'Crypto Academy', duration: '1:12:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400' },
      { title: 'Quantum-Resistant Encryption', channel: 'SecLab', duration: '34:20', url: '#', thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400' },
      { title: 'Smart Contract Auditing 101', channel: 'Solidity Dev', duration: '55:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'fullstack-mobile',
    title: 'Development Hub',
    subtitle: 'Frontend, Backend & Mobile',
    icon: <Code className="w-5 h-5 text-blue-600" />,
    items: [
      { title: 'React 20: Concurrent Native Rendering', channel: 'JS Masters', duration: '48:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400' },
      { title: 'Go Microservices at Scale', channel: 'Backend Pro', duration: '1:05:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=400' },
      { title: 'Next-Gen Mobile UI with Flutter', channel: 'Mobile Dev', duration: '32:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'emerging-tech',
    title: 'Future Horizons',
    subtitle: 'Robotics, Space & Quantum',
    icon: <Rocket className="w-5 h-5 text-amber-600" />,
    items: [
      { title: 'Humanoid Robotics Kinematics', channel: 'BotLab', duration: '1:20:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400' },
      { title: 'Satellite Networking Protocols', channel: 'SpaceX Dev', duration: '45:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=400' },
      { title: 'Intro to Quantum Algorithms', channel: 'Q-Bits', duration: '38:00', url: '#', thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400' }
    ]
  }
];
