import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Play, 
  Search, FileText, Share2, Sparkles, X, 
  Clock, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RESOURCE_TYPES = [
  {
    title: "Technical Docs",
    description: "Deep dives into platform features, API integrations, and compiler execution guidelines.",
    icon: <FileText className="text-indigo-600" size={22} />,
    count: "40+ Guides"
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step walkthroughs of complex algorithms and advanced system design blueprints.",
    icon: <Play className="text-rose-600" size={22} />,
    count: "150+ Hours"
  },
  {
    title: "Community Forum",
    description: "Connect and debate with over 500k developers solving engineering challenges daily.",
    icon: <MessageSquare className="text-emerald-600" size={22} />,
    count: "Active Now"
  },
  {
    title: "Developer Blog",
    description: "Weekly insights on industry hiring trends, technical stacks, and Glintspark updates.",
    icon: <Share2 className="text-sky-600" size={22} />,
    count: "Weekly Updates"
  }
];

const ARTICLES = [
  {
    id: "compiler-sandboxing",
    title: "How Compiler Micro-Sandboxing Works in Modern IDEs",
    category: "Architecture",
    readTime: "6 min read",
    summary: "An in-depth look at secure, multi-language code execution inside isolated Linux containers and WASM runtimes.",
    content: `Executing untrusted user-submitted code is one of the most significant security challenges when building an online IDE like Glintspark. In this article, we explain the mechanics of micro-sandboxing.

When a user clicks "Run Code," the source code is sent to an orchestration layer. Instead of running directly on the host machine, the orchestrator provisions an isolated, lightweight container. We leverage gRPC services communicating with Docker container runtimes configured with strict kernel namespaces and cgroups.

Key isolation vectors:
1. CPU & Memory Capping: Using control groups (cgroups), we cap the execution to 1 CPU core and 512MB of RAM. If a developer runs an infinite loop (e.g., 'while true'), the sandbox automatically terminates the process after 5 seconds to prevent resource exhaustion.
2. Network Isolation: Containers are launched with '--network none' flag. This prevents users from writing scripts that fetch external resources or perform network attacks.
3. Read-Only Root Filesystem: The filesystem of the container is mounted as read-only, except for a temp directory '/tmp' where the compilation artifacts are written. This prevents malicious code from overwriting system files.

Through WebAssembly (WASM) and gRPC container clusters, Glintspark achieves sub-millisecond start times while ensuring host machine security.`
  },
  {
    id: "ast-evaluation",
    title: "Evaluating Code Logic: AST Grammars vs. RegEx Parsing",
    category: "AI & Compiler",
    readTime: "5 min read",
    summary: "Why regular expressions fail at syntax validation, and how Abstract Syntax Trees provide deeper insights into compiler logic.",
    content: `Many legacy learning platforms evaluate developer solutions using basic Regular Expressions (RegEx) or simple text comparisons. While this works for exact matches, it fails to recognize clean, alternative logic flows.

At Glintspark, we use Abstract Syntax Trees (ASTs) for logic evaluation. An AST is a tree representation of the abstract syntactic structure of source code written in a programming language. Each node of the tree denotes a construct occurring in the source code.

Why AST is superior:
1. Logic over Syntax: If a user solves a problem using a 'while' loop instead of a 'for' loop, a simple string comparison will fail them. An AST analyzer maps both to repetitive control flow nodes, evaluating the logic rather than the literal text.
2. Code Optimization & Quality: By parsing the code into an AST, our system can identify redundant loops, unused variables, and potential memory leaks.
3. AI Hint Integration: The Glintspark AI Tutor reads the AST structure to understand precisely where a developer's logic broke, allowing it to provide a specific, contextual hint rather than a generic error message.

By transitioning from text parsing to AST compiler grammars, we ensure a fair, comprehensive verification of coding ability.`
  },
  {
    id: "scaling-runtimes",
    title: "Scaling Compiler Runtimes to 10M Compiles Daily",
    category: "System Design",
    readTime: "8 min read",
    summary: "A blueprint of horizontal scaling, Redis task queue scheduling, and pre-warmed sandbox pools.",
    content: `As developer communities grow, compiler platforms must scale to support millions of executions. Standard virtualization systems are too slow to boot a clean operating system for every run.

To scale Glintspark to compile 10 million executions daily, we designed a system based on "warm container pools" and asynchronous message queues.

Core Scaling Strategies:
1. Warm Container Pools: Instead of launching a new container on demand, the platform maintains a pool of pre-warmed, paused containers for each supported language. When a compilation request arrives, a container is unpaused, executes the code, and is immediately recycled.
2. Redis Task Queues: Compilation jobs are queued in Redis and distributed across a cluster of compiler worker nodes. This prevents spikes in traffic from crashing the main servers.
3. Load Balancing with Consistent Hashing: We use consistent hashing to distribute requests. If a user compiles multiple times, their code is routed to the same worker node to leverage local caching of libraries and compilation binaries.

This robust system design ensures that developers experience zero delay, keeping compiler execution times under 200 milliseconds.`
  },
  {
    id: "postgres-rls",
    title: "Implementing Row-Level Security in Multi-Tenant Web Apps",
    category: "Database & Security",
    readTime: "7 min read",
    summary: "How to safeguard developer profiles and recruiter assessment logs using PostgreSQL RLS policies.",
    content: `In multi-tenant applications where recruiters evaluate candidates and developers solve challenges, keeping database records segregated is critical. 

At Glintspark, we leverage PostgreSQL Row-Level Security (RLS) policies. RLS allows database administrators to define security policies on tables that filter which rows are returned to a query based on the active user session.

Key Implementation Steps:
1. JWT Session Injection: When a user authenticates, Supabase creates a JWT. Every database request includes this token, which is decoded inside PostgreSQL.
2. RLS Policies: We define policies on tables like 'users' and 'challenges'. For example, a user can only edit their own profile: 'CREATE POLICY update_profile ON users FOR UPDATE USING (auth.uid() = id);'
3. Recruiter Segregation: Recruiting firms can only query profiles of candidates who have explicitly authorized access or applied to their jobs.

Using PostgreSQL RLS eliminates the risk of SQL injection and accidental data leaks, ensuring complete data privacy.`
  }
];

const CATEGORIES = ["All", "Architecture", "AI & Compiler", "System Design", "Database & Security"];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [readingArticle, setReadingArticle] = useState<typeof ARTICLES[0] | null>(null);

  const filteredArticles = ARTICLES.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[55%] h-[500px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[45%] h-[500px] bg-emerald-50/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Search Section */}
      <section className="pt-36 pb-20 relative z-10 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> Developer Resource Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Knowledge & Guides
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm leading-relaxed">
            Read engineering documentation, tech logs, and architectural deep-dives designed to help you build and scale coding platforms.
          </p>

          <div className="max-w-2xl mx-auto relative group pt-2">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-450 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guides, systems scaling, compiler logs..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Interactive Category Tabs */}
      <section className="py-8 bg-white border-b border-slate-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Resource Types Quick Links */}
      <section className="py-16 relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESOURCE_TYPES.map((res, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-slate-200/80 rounded-3xl hover:shadow-xl transition-all group flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {res.icon}
                </div>
                <h3 className="text-base font-black mb-2 tracking-tight text-slate-800">{res.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  {res.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/60 text-[9px] font-black uppercase tracking-wider text-indigo-600">
                <span>{res.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Publication Banner */}
      <section className="pb-16 relative z-10 max-w-7xl mx-auto px-6">
        <div className="bg-slate-950 rounded-[2.5rem] p-10 lg:p-14 text-white flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative border border-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex-1 space-y-5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider">
              <Sparkles size={10} /> Featured Guide
            </span>
            <h2 className="text-2xl lg:text-3.5xl font-black leading-tight tracking-tight">Mastering System Design: The 2026 Architect's Guide</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              Explore custom horizontal scaling pipelines, distributed database latency configurations, and state proctor synchronization metrics compiled by Glintspark core systems engineers.
            </p>
            <button 
              onClick={() => setReadingArticle({
                id: "system-design",
                title: "Mastering System Design: The 2026 Architect's Guide",
                category: "System Design",
                readTime: "12 min read",
                summary: "Master the patterns to scale platform architectures from zero to millions of daily concurrent compiling threads.",
                content: `System design has evolved rapidly in 2026, transitioning from basic load balancing architectures to intelligent event-driven mesh networks. 

Key Architecture Foundations:
1. Low Latency Data Access: Utilizing layered Redis cluster nodes to cache active session tokens, compiler runtime states, and contest dashboards.
2. Event Streaming pipelines: Integrating Kafka queues to stream solution test results asynchronously. This decouples database write operations from critical runtime compile actions.
3. Sharded Databases: Implementing multi-master PostgreSQL sharding based on geographical candidate load profiles to eliminate core lock scenarios.

By deploying microservices and strict circuit-breaker configurations, Glintspark guarantees continuous availability under massive load.`
              })}
              className="px-6 py-3 bg-white text-slate-950 hover:bg-indigo-600 hover:text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg active:scale-95"
            >
              Read Full Publication
            </button>
          </div>

          <div className="flex-1 w-full lg:w-auto relative z-10">
            <div className="aspect-[4/3] bg-slate-900 rounded-2xl border border-slate-800 p-6 font-mono text-[11px] text-indigo-400 leading-relaxed shadow-inner">
              <div className="mb-4 text-slate-500">// Distributed replication configuration</div>
              <div>class <span className="text-white">DistributedEngine</span> {'{'}</div>
              <div className="ml-4">constructor(threads) {'{'}</div>
              <div className="ml-8 text-emerald-400">this.cores = threads;</div>
              <div className="ml-8 text-emerald-400">this.warmPool = true;</div>
              <div className="ml-8 text-slate-500">...</div>
              <div className="ml-4">{'}'}</div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main High-Value Technical Articles Section */}
      <section className="py-12 relative z-10 max-w-7xl mx-auto px-6">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-2xl font-black text-slate-900">Latest Technical Publications</h2>
          <p className="text-slate-500 font-medium text-xs mt-2">Deep dive into engineering architectures, sandboxed runtimes, and system scaling metrics.</p>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredArticles.map((art) => (
              <div 
                key={art.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:border-indigo-500/25 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 text-xs font-black uppercase tracking-wider mb-4">
                    <span className="text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl">{art.category}</span>
                    <span className="text-slate-400 flex items-center gap-1"><Clock size={12} /> {art.readTime}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3 leading-snug">{art.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold mb-6">{art.summary}</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setReadingArticle(art)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider group"
                  >
                    Read Article <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white border border-slate-200 rounded-3xl">
            <p className="text-slate-500 text-sm font-semibold">No publications found matching search query.</p>
          </div>
        )}
      </section>

      {/* Article Reader Overlay Modal */}
      <AnimatePresence>
        {readingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReadingArticle(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-white border border-slate-200 rounded-[2rem] p-8 max-w-2xl w-full text-slate-900 shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Decorative radial gradients inside modal */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 blur-[80px] rounded-full pointer-events-none animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/40 blur-[80px] rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-5 relative z-10 shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-xl">
                    {readingArticle.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 leading-snug">{readingArticle.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-2">
                    <span className="flex items-center gap-1"><Clock size={12} /> {readingArticle.readTime}</span>
                    <span>•</span>
                    <span>Verified Publisher</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setReadingArticle(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto py-6 space-y-6 relative z-10 pr-2">
                <p className="text-slate-650 text-slate-500 text-sm font-semibold italic border-l-4 border-indigo-500 pl-4 py-1">
                  {readingArticle.summary}
                </p>

                <div className="text-slate-600 text-sm leading-relaxed font-semibold whitespace-pre-line space-y-4">
                  {readingArticle.content}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 pt-5 flex justify-end shrink-0 relative z-10">
                <button 
                  onClick={() => setReadingArticle(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
