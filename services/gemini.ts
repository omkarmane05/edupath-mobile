
// Proxy to our secure Vercel API
const GEMINI_API_URL = '/api/gemini';

// Helper for dates
const getRelativeTime = (mins: number) => {
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hours ago`;
};

// --- FALLBACK DATA ---

const FALLBACK_ROADMAP = {
  nodes: [
    { id: "1", type: "root", label: "Start Here", position: { x: 250, y: 0 } },
    { id: "2", type: "branch", label: "Foundations", position: { x: 250, y: 100 }, data: { goal: "Master basics", duration: "2 Weeks" } },
    { id: "3", type: "leaf", label: "HTML/CSS", position: { x: 150, y: 200 }, data: { goal: "Structure & Style", resource: "MDN" } },
    { id: "4", type: "leaf", label: "JavaScript", position: { x: 350, y: 200 }, data: { goal: "Logic & DOM", resource: "Javscript.info" } },
    { id: "5", type: "branch", label: "Frameworks", position: { x: 250, y: 300 }, data: { goal: "Modern Tooling", duration: "3 Weeks" } },
    { id: "6", type: "leaf", label: "React", position: { x: 150, y: 400 }, data: { goal: "Component Architecture", resource: "React.dev" } }
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e2-4", source: "2", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
    { id: "e3-5", source: "3", target: "5" },
    { id: "e5-6", source: "5", target: "6" }
  ]
};

const getLiveDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const FALLBACK_UPDATES = {
  news: [
    { title: "GPT-6 Release Rumors Confirmed", date: "Today", summary: "OpenAI hints at new reasoning capabilities for Q3 2026.", timestamp: "10 mins ago" },
    { title: "React 21: The Death of Virtual DOM?", date: "Today", summary: "New compiler architecture promises 40% faster renders.", timestamp: "2 hours ago" },
    { title: "Tech Hiring Report Q1 2026", date: "Yesterday", summary: "AI and Data roles see 200% year-over-year growth.", timestamp: "5 hours ago" },
    { title: "NVIDIA Announces Consumer Quantum Chip", date: "Yesterday", summary: "A breakthrough in room-temperature quantum computing.", timestamp: "8 hours ago" }
  ],
  internships: [
    { company: "Google", role: "Junior AI Engineer", deadline: `Apply by ${getLiveDate(5)}`, link: "", timestamp: "Just now" },
    { company: "Spotify", role: "Frontend Developer", deadline: `Apply by ${getLiveDate(7)}`, link: "", timestamp: "1 hour ago" },
    { company: "Tesla", role: "Embedded Systems Intern", deadline: "Urgent", link: "", timestamp: "3 hours ago" }
  ],
  hackathons: [
    { name: "Global Hack 2026", date: getLiveDate(10), theme: "Sustainable Tech", prize: "$50k Prize Pool" },
    { name: "Code for Impact", date: getLiveDate(25), theme: "Healthcare AI", prize: "Y-Combinator Interview" }
  ]
};

const FALLBACK_LIBRARY = [
  {
    title: "DSA & Logic",
    subtitle: "Master the fundamentals",
    icon: "🧠",
    items: [
      { title: "Blind 75 LeetCode Solved", channel: "NeetCode", duration: "10:00:00", views: "2.5M", type: "playlist", url: "https://www.youtube.com/watch?v=KLlXCFG5TnA&list=PLot-Xpze53ldVwtstag2TL4HQhAnC8ATf" },
      { title: "Dynamic Programming Guide", channel: "FreeCodeCamp", duration: "05:22:10", views: "1.8M", type: "video", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk" },
      { title: "Graph Algorithms Explained", channel: "William Fiset", duration: "02:30:00", views: "900k", type: "video", url: "https://www.youtube.com/watch?v=09_ZsOeRR0" },
      { title: "Sorting Algorithms Visualized", channel: "Fireship", duration: "12:05", views: "3M", type: "video", url: "https://www.youtube.com/watch?v=rf5iL3nj4IA" },
      { title: "Big O Notation", channel: "HackerRank", duration: "10:15", views: "1.2M", type: "video", url: "https://www.youtube.com/watch?v=v4cd1O4zkGw" }
    ]
  },
  {
    title: "System Design",
    subtitle: "Scale to millions",
    icon: "🏗️",
    items: [
      { title: "Design Netflix System", channel: "Gaurav Sen", duration: "35:00", views: "1.5M", type: "video", url: "https://www.youtube.com/watch?v=psQzyFfsUGU" },
      { title: "Load Balancers & Caching", channel: "ByteByteGo", duration: "15:30", views: "800k", type: "video", url: "https://www.youtube.com/watch?v=S25vXuy-KWc" },
      { title: "Microservices vs Monolith", channel: "Hussein Nasser", duration: "25:00", views: "500k", type: "video", url: "https://www.youtube.com/watch?v=j4iY45B25w0" },
      { title: "CAP Theorem Simplified", channel: "IBM Technology", duration: "08:45", views: "300k", type: "video", url: "https://www.youtube.com/watch?v=k-Yaq8AHlFA" },
      { title: "Designing a URL Shortener", channel: "SystemDesignData", duration: "40:00", views: "600k", type: "video", url: "https://www.youtube.com/watch?v=JQDHz72OA3c" }
    ]
  },
  {
    title: "Languages",
    subtitle: "Polyglot programming",
    icon: "💻",
    items: [
      { title: "Python for Beginners", channel: "Mosh", duration: "01:00:00", views: "10M", type: "video", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
      { title: "Java Full Course", channel: "Bro Code", duration: "12:00:00", views: "4M", type: "video", url: "https://www.youtube.com/watch?v=xk4_1vDrzzo" },
      { title: "JavaScript: The Good Parts", channel: "Douglas Crockford", duration: "01:05:00", views: "800k", type: "video", url: "https://www.youtube.com/watch?v=hQVTIJBZook" },
      { title: "GoLang Crash Course", channel: "Traversy Media", duration: "50:00", views: "900k", type: "video", url: "https://www.youtube.com/watch?v=SqrbIlUwR0U" },
      { title: "Rust in 100 Seconds", channel: "Fireship", duration: "01:40", views: "1.5M", type: "video", url: "https://www.youtube.com/watch?v=5C_HPTJg5ek" }
    ]
  },
  {
    title: "Frameworks",
    subtitle: "Build modern apps",
    icon: "⚛️",
    items: [
      { title: "React 19 Hooks Tutorial", channel: "Web Dev Simplified", duration: "45:00", views: "900k", type: "video", url: "https://www.youtube.com/watch?v=TNhaISOUy6Q" },
      { title: "Next.js 14 Course", channel: "CodeWithAntonio", duration: "08:00:00", views: "1.2M", type: "video", url: "https://www.youtube.com/watch?v=5W6kEP65AH4" },
      { title: "Vue.js 3 Crash Course", channel: "Net Ninja", duration: "01:30:00", views: "700k", type: "video", url: "https://www.youtube.com/watch?v=YrxBCbibXl8" },
      { title: "Spring Boot Essentials", channel: "Amigoscode", duration: "02:00:00", views: "600k", type: "video", url: "https://www.youtube.com/watch?v=9SGDpanrc8U" },
      { title: "Flutter for Beginners", channel: "Flutter", duration: "30:00", views: "2M", type: "video", url: "https://www.youtube.com/watch?v=CD1Y2DmL5JM" }
    ]
  },
  {
    title: "Cloud & DevOps",
    subtitle: "Deploy & Scale",
    icon: "☁️",
    items: [
      { title: "Docker in 1 Hour", channel: "TechWorld with Nana", duration: "01:00:00", views: "3M", type: "video", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
      { title: "Kubernetes Explained", channel: "IBM Cloud", duration: "15:00", views: "1.5M", type: "video", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4" },
      { title: "AWS Basics for Beginners", channel: "Simplilearn", duration: "10:00:00", views: "2M", type: "video", url: "https://www.youtube.com/watch?v=ulprqHHWlng" },
      { title: "CI/CD Pipelines", channel: "DevOps Journey", duration: "20:00", views: "400k", type: "video", url: "https://www.youtube.com/watch?v=scEDHsr3APg" },
      { title: "Terraform Crash Course", channel: "FreeCodeCamp", duration: "02:00:00", views: "800k", type: "video", url: "https://www.youtube.com/watch?v=SLB_c_ayRMo" }
    ]
  },
  {
    title: "AI & ML",
    subtitle: "The Future is Here",
    icon: "🤖",
    items: [
      { title: "Neural Networks from Scratch", channel: "3Blue1Brown", duration: "20:00", views: "5M", type: "video", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
      { title: "Transformers Explained", channel: "Google Cloud Tech", duration: "10:00", views: "1M", type: "video", url: "https://www.youtube.com/watch?v=sz2S4BvQN6s" },
      { title: "LangChain Tutorial", channel: "Rabbit Hole", duration: "45:00", views: "300k", type: "video", url: "https://www.youtube.com/watch?v=aywZrzNaKjs" },
      { title: "PyTorch vs TensorFlow", channel: "AssemblyAI", duration: "12:00", views: "200k", type: "video", url: "https://www.youtube.com/watch?v=8pCDJv8a6y0" },
      { title: "Intro to LLMs", channel: "Andrej Karpathy", duration: "01:00:00", views: "2M", type: "video", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" }
    ]
  },
  {
    title: "Interview Prep",
    subtitle: "Crack the FAANG Code",
    icon: "👔",
    items: [
      { title: "Mock Google Interview", channel: "Clément Mihailescu", duration: "45:00", views: "3M", type: "video", url: "https://www.youtube.com/watch?v=XKu_SEDAykw" },
      { title: "Behavioral Interview Guide", channel: "Jeff Su", duration: "20:00", views: "1.5M", type: "video", url: "https://www.youtube.com/watch?v=NAhWdbEa1vA" },
      { title: "Resume Review 2026", channel: "Wonsulting", duration: "15:00", views: "800k", type: "video", url: "https://www.youtube.com/watch?v=Tt08KmFfIYc" },
      { title: "Salary Negotiation", channel: "Linda Raynier", duration: "12:00", views: "1M", type: "video" }
    ]
  }
];

// --- API FUNCTIONS ---

// --- OFFLINE GENERATOR ---
// --- OFFLINE GENERATOR ---
export const generateRoadmap = async (roleName: string, domainName: string) => {
  // Simulate network delay for realism (optional, kept short)
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log("Generating offline roadmap for:", roleName);

  return {
    nodes: [
      {
        id: "1", level: 1, type: "root", label: `${roleName} Odyssey`,
        data: {
          goal: "Start your professional journey", duration: "Day 1", resource: "Orientation",
          checklist: ["Define Career Goals", "Create LinkedIn Profile", "Setup Professional Email", "Join Tech Twitter/X", "Create GitHub Account"],
          recommended: [{ title: "Developer Roadmap 2026", url: "https://roadmap.sh", type: "article", source: "Roadmap.sh" }]
        }
      },
      {
        id: "2", level: 2, type: "branch", label: "Foundations",
        data: {
          goal: "Computer Science Basics", duration: "2 Weeks", resource: "CS50",
          checklist: ["How the Internet Works (DNS/HTTP)", "Terminal/CLI Mastery", "Git & GitHub Basics", "Data Structures Intro", "Algorithms 101"],
          recommended: [{ title: "CS50 Introduction", url: "https://pll.harvard.edu/course/cs50", type: "video", source: "Harvard" }]
        }
      },
      {
        id: "3", level: 3, type: "leaf", label: `${domainName} Core`,
        data: {
          goal: "Syntax & Logic logic", duration: "3 Weeks", resource: "Documentation",
          checklist: ["Variables & Data Types", "Loops & Conditionals", "Functions & Scope", "Error Handling", "Async Programming Basics"],
          recommended: [{ title: "FreeCodeCamp", url: "https://freecodecamp.org", type: "course", source: "FreeCodeCamp" }]
        }
      },
      {
        id: "4", level: 3, type: "leaf", label: "Version Control",
        data: {
          goal: "Team Collaboration", duration: "1 Week", resource: "Git Guide",
          checklist: ["Git Clone, Add, Commit, Push", "Branching & Merging", "Resolving Merge Conflicts", "Pull Requests (PRs)", "Code Review Etiquette"],
          recommended: [{ title: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "book", source: "Official Git" }]
        }
      },
      {
        id: "5", level: 4, type: "branch", label: "Specialization",
        data: {
          goal: "Frameworks & Tools", duration: "4 Weeks", resource: "Official Docs",
          checklist: ["Package Managers (npm/yarn)", "Build Tools (Vite/Webpack)", "Component Architecture", "State Management", "Routing"],
          recommended: [{ title: "React Documentation", url: "https://react.dev", type: "doc", source: "React Team" }]
        }
      },
      {
        id: "6", level: 5, type: "leaf", label: "Database & API",
        data: {
          goal: "Data Management", duration: "2 Weeks", resource: "SQL vs NoSQL",
          checklist: ["REST API Principles", "JSON Data Format", "Basic SQL Queries", "Authentication (JWT/OAuth)", "Fetching Data in Client"],
          recommended: [{ title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "doc", source: "PostgreSQL" }]
        }
      },
      {
        id: "7", level: 5, type: "leaf", label: "Testing & Debugging",
        data: {
          goal: "Reliability", duration: "1 Week", resource: "Jest/Cypress",
          checklist: ["Unit Testing Basics", "Chrome DevTools Mastery", "Debugging Logic Errors", "Writing Testable Code", "E2E Testing Intro"],
          recommended: [{ title: "Testing JavaScript", url: "https://testingjavascript.com/", type: "course", source: "Kent C. Dodds" }]
        }
      },
      {
        id: "8", level: 6, type: "branch", label: "Professional Ops",
        data: {
          goal: "Deployment & CI/CD", duration: "1 Week", resource: "DevOps",
          checklist: ["Deploying to Vercel/Netlify", "Setting up CI Pipelines", "Docker Basics", "SSL & Security Headers", "Performance Optimization"],
          recommended: [{ title: "The DevOps Handbook", url: "https://itrevolution.com/book/the-devops-handbook/", type: "book", source: "IT Revolution" }]
        }
      },
      {
        id: "9", level: 7, type: "leaf", label: "Capstone Project",
        data: {
          goal: "Proof of Skills", duration: "2 Weeks", resource: "Portfolio",
          checklist: ["Plan MVP Features", "Design Database Schema", "Implement Auth & CRUD", "Deploy to Production", "Write README Documentation"],
          recommended: [{ title: "Build a SaaS", url: "#", type: "project", source: "YouTube" }]
        }
      },
      {
        id: "10", level: 7, type: "leaf", label: "Job & Interview",
        data: {
          goal: "Get Hired", duration: "Ongoing", resource: "Career Sites",
          checklist: ["ATS-Friendly Resume", "Portfolio Website", "LeetCode (Easy/Medium)", "System Design Basics", "Mock Interviews"],
          recommended: [{ title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/", type: "guide", source: "Yangshun Tay" }]
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e2-4", source: "2", target: "4" },
      { id: "e3-5", source: "3", target: "5" },
      { id: "e4-5", source: "4", target: "5" },
      { id: "e5-6", source: "5", target: "6" },
      { id: "e5-7", source: "5", target: "7" },
      { id: "e6-8", source: "6", target: "8" },
      { id: "e7-8", source: "7", target: "8" },
      { id: "e8-9", source: "8", target: "9" },
      { id: "e8-10", source: "8", target: "10" }
    ]
  };
};

export const analyzeResume = async (resumeText: string, domains: any[]) => {
  // MOCK FALLBACK for Demo purposes (if no API key or API fails)
  const FALLBACK_MATCH = [
    {
      domainName: "AI & ML",
      matchScore: 92,
      strength: "Strong foundation in Python and Data Structures.",
      gap: "Lack of experience with large-scale LLM deployment.",
      targetCompanies: ["OpenAI", "Anthropic", "HuggingFace"],
      suggestedRoles: ["Prompt Engineer", "Junior ML Engineer", "Data Analyst"],
      jobs: [
        { title: "Junior ML Engineer", company: "TechCorp AI", location: "Remote", salary: "$130k", postedTime: "2h ago" },
        { title: "AI Researcher", company: "DeepMind", location: "London", salary: "$160k", postedTime: "5h ago" }
      ],
      keywordOverlap: ["Python", "TensorFlow", "React", "Algorithms", "Git"],
      skillsAlignment: [
        { name: "Python", percentage: 95 },
        { name: "Machine Learning", percentage: 70 },
        { name: "System Design", percentage: 40 }
      ]
    },
    {
      domainName: "Frontend Dev",
      matchScore: 85,
      strength: "Excellent React and UI skills.",
      gap: "Limited exposure to Next.js server actions.",
      targetCompanies: ["Vercel", "Airbnb", "Netflix"],
      suggestedRoles: ["Frontend Engineer", "UI Developer"],
      jobs: [],
      keywordOverlap: ["React", "JavaScript", "CSS", "UI/UX"],
      skillsAlignment: [
        { name: "React", percentage: 90 },
        { name: "CSS", percentage: 85 }
      ]
    }
  ];

  try {
    const domainNames = domains.map(d => d.name).join(', ');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateContent',
        params: {
          contents: `Act as a high-end recruiter in 2026. Analyze this CV text against these domains: [${domainNames}].
      Rank top 3 matches. For each match, generate a realistic 'Live Job' that fits perfectly.
      Return a JSON array of objects:
      {
        "domainName": "string",
        "matchScore": number (0-100),
        "strength": "string (1 sentence)",
        "gap": "string (1 sentence)",
        "targetCompanies": ["string", "string", "string"],
        "suggestedRoles": ["string", "string", "string"],
        "jobs": [
           { 
             "title": "string (Job Title)",
             "company": "string (Company Name)",
             "location": "string (e.g. Remote / NYC)",
             "salary": "string (e.g. $120k)",
             "postedTime": "string (e.g. 2h ago)"
           }
        ],
        "keywordOverlap": ["string", "string", "string", "string", "string"],
        "skillsAlignment": [{"name": "string", "percentage": number}]
      }
      Resume: ${resumeText}`,
          config: {
            responseMimeType: "application/json",
          }
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    const text = data.text || "";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.warn("Resume analysis failed/offline, using fallback:", error);
    return FALLBACK_MATCH;
  }
};

export const getTechUpdates = async () => {
  try {
    // 1. Fetch Real Tech News from Dev.to
    // We try to fetch widely popular tech tags
    const newsResponse = await fetch('https://dev.to/api/articles?tag=technology&top=1&per_page=4');
    const newsData = await newsResponse.json();

    // Map to our format
    const news = newsData.map((article: any) => ({
      title: article.title,
      date: new Date(article.published_at).toLocaleDateString(),
      summary: article.description || "Latest tech insights and trends.",
      timestamp: getRelativeTimeFromDate(new Date(article.published_at)),
      link: article.url
    }));

    // 2. Dynamic Internships (Rotating List with Future Dates)
    const INTERNSHIP_ROLES = [
      { company: "Google", role: "Software Engineering Intern", link: "https://careers.google.com/students/" },
      { company: "Microsoft", role: "Explore Program Intern", link: "https://careers.microsoft.com/students/us/en" },
      { company: "Amazon", role: "SDE Intern", link: "https://www.amazon.jobs/en/teams/internships-for-students" },
      { company: "Meta", role: "Frontend Engineer Intern", link: "https://www.metacareers.com/" },
      { company: "Netflix", role: "UI Engineering Intern", link: "https://jobs.netflix.com/" },
      { company: "Spotify", role: "Web Developer Summer intern", link: "https://www.lifeatspotify.com/students" }
    ];

    // Shuffle and pick 3
    const shuffledInternships = INTERNSHIP_ROLES.sort(() => 0.5 - Math.random()).slice(0, 3);
    const internships = shuffledInternships.map((job, idx) => ({
      ...job,
      deadline: `Apply by ${getLiveDate(3 + idx * 2)}`, // e.g. "Apply by Oct 24"
      timestamp: `${idx + 1}h ago`
    }));

    // 3. Dynamic Hackathons
    const HACKATHON_TEMPLATES = [
      { name: "Global AI Hackathon", theme: "Generative AI", prize: "$50k Prize Pool" },
      { name: "Climate Tech Challenge", theme: "Sustainability", prize: "$20k Grant" },
      { name: "FinTech Revolution", theme: "DeFi & Blockchain", prize: "$10k + Incubation" },
      { name: "HealthHacks 2025", theme: "MedTech", prize: "Research Fellowship" }
    ];

    const shuffledHackathons = HACKATHON_TEMPLATES.sort(() => 0.5 - Math.random()).slice(0, 2);
    const hackathons = shuffledHackathons.map((hack, idx) => ({
      ...hack,
      date: getLiveDate(7 + idx * 5), // e.g. "Oct 28"
    }));

    return {
      news,
      internships,
      hackathons
    };

  } catch (error) {
    console.warn("Live fetch failed, using fallback:", error);
    // If fetch fails, return a dynamically generated fallback instead of static
    return {
      news: FALLBACK_UPDATES.news, // Keep static if API fails
      internships: [
        { company: "Google", role: "Software Intern", deadline: `Apply by ${getLiveDate(5)}`, link: "", timestamp: "Just now" },
        { company: "Microsoft", role: "Explore Intern", deadline: `Apply by ${getLiveDate(7)}`, link: "", timestamp: "1h ago" },
        { company: "Amazon", role: "SDE Intern", deadline: `Apply by ${getLiveDate(10)}`, link: "", timestamp: "3h ago" }
      ],
      hackathons: [
        { name: "Global AI Hackathon", date: getLiveDate(10), theme: "GenAI", prize: "$50k" },
        { name: "Open Source Sprint", date: getLiveDate(14), theme: "OSS", prize: "$10k" }
      ]
    };
  }
};

// Helper to get relative time from a real date object
const getRelativeTimeFromDate = (date: Date) => {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const getLibraryContent = async () => {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateContent',
        params: {
          contents: "Generate a curated library JSON. Return array of categories. Each category has title, subtitle, icon (emoji string), and items array. Items have title, channel, duration, views(string), and thumbnail (use realistic generic placeholder URLs). Categories: 'Trending Tech', 'System Design', 'Career Advice'.",
          config: {
            responseMimeType: "application/json",
          }
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    const text = data.text || "";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Using Fallback Library");
    return FALLBACK_LIBRARY;
  }
};

export const chatWithAgent = async (history: any[], message: string) => {
  try {
    // Build conversation contents array from history + new message
    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.parts[0].text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateContentStream',
        params: {
          contents,
          config: { systemInstruction: "You are EduPath AI, a helpful career assistant for students. Help them find roadmaps, understand technologies, and plan their career. Be concise and encouraging." }
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // Yield the entire text as a single chunk since proxy isn't streaming yet
    return (async function* () {
      yield { text: () => data.text };
    })();
  } catch (error) {
    console.warn("Gemini Chat failed/offline. Using search-based fallback.");

    // Smart Search-Based Fallback Logic
    const lowerMsg = message.toLowerCase();

    // 1. Define common conversational patterns
    const CONVERSATION_PATTERNS: Record<string, string> = {
      'hi': "Hello! 👋 I'm EduPath AI. I can help you find roadmaps, learning resources, or analyze your resume. What's on your mind?",
      'hello': "Hi there! Ready to level up your career? Ask me about a technology you want to learn.",
      'hey': "Hey! How can I assist you today?",
      'how are you': "I'm just a code construct, but I'm functioning perfectly! How are you doing with your studies?",
      'thanks': "You're welcome! Let me know if you need anything else.",
      'thank you': "Happy to help! Keep up the great work.",
      'bye': "Goodbye! Good luck with your coding journey! 🚀",
      'who are you': "I'm EduPath AI, your personal career assistant. I help you navigate the tech world.",
      'help': "I can help you by:\n\n- **Finding Roadmaps**: Ask 'Show me React roadmap'\n- **Suggesting Videos**: Ask 'Learn Python'\n- **Analyzing CVs**: Go to the Scanner tab!",
    };

    // Check for exact conversational matches first
    for (const [key, value] of Object.entries(CONVERSATION_PATTERNS)) {
      if (lowerMsg.includes(key)) {
        return (async function* () { yield { text: () => value }; })();
      }
    }

    // 2. Search in Library Content (simulating "Anything" by having a vast DB)
    let bestMatch = null;
    let matchScore = 0;

    // Flatten library items for search
    const allLibraryItems = FALLBACK_LIBRARY.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.title })));

    // Simple keyword matching against Library
    for (const item of allLibraryItems) {
      let score = 0;
      const words = lowerMsg.split(' ');
      for (const word of words) {
        if (word.length < 3) continue; // Skip small words
        if (item.title.toLowerCase().includes(word)) score += 3;
        if (item.channel?.toLowerCase().includes(word)) score += 1;
        if (item.category.toLowerCase().includes(word)) score += 2;
      }

      if (score > matchScore) {
        matchScore = score;
        bestMatch = item;
      }
    }

    let responseText = "";

    // 3. Construct Response based on search findings
    if (matchScore > 2) {
      responseText = `I found a great resource for you! \n\n📺 **${bestMatch?.title}**\n*by ${bestMatch?.channel}*\n\nYou can watch it in the **Hub** (Library) tab under the *${bestMatch?.category}* section. \n\nWould you like a roadmap for this too?`;
    }
    // 4. Search Roadmaps if generic tech query
    else {
      // Keyword checking for specific domains
      if (lowerMsg.includes('react') || lowerMsg.includes('frontend') || lowerMsg.includes('js')) {
        responseText = "For **Frontend Development** (React, Vue, JS), check out the **Roadmap** tab. It covers:\n- HTML/CSS Mastery\n- JavaScript Deep Dive\n- Modern Frameworks\n\nIt's the best way to start!";
      } else if (lowerMsg.includes('python') || lowerMsg.includes('backend') || lowerMsg.includes('django') || lowerMsg.includes('node')) {
        responseText = "For **Backend Engineering**, head to the **Roadmap** tab. You'll learn about:\n- API Design\n- Database Management\n- Server Logic\n\nPerfect for building robust systems!";
      } else if (lowerMsg.includes('ai') || lowerMsg.includes('ml') || lowerMsg.includes('data')) {
        responseText = "For **AI & Data Science**, the **Roadmap** tab has a dedicated path covering:\n- Python & Math\n- Machine Learning Models\n- Deep Learning\n\nJoin the revolution!";
      } else if (lowerMsg.includes('resume') || lowerMsg.includes('job') || lowerMsg.includes('salary')) {
        responseText = "I can help with that! Go to the **Scanner** tab to analyze your resume against real job descriptions. I'll give you a match score and salary estimates!";
      } else {
        // 5. Generic Fallback
        responseText = "That's an interesting topic! While I don't have a specific video on that right now, I'd recommend checking the **Hub** for general tech resources or the **Roadmap** to see where it fits in the big picture. \n\nTry asking about 'React', 'Python', or 'System Design'!";
      }
    }

    return (async function* () {
      yield { text: () => responseText };
    })();
  }
};
