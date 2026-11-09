

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ================= CONTENT ================= */

const NAV_LINKS = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Workers", href: "#workers" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
];

const SERVICES = [
    { icon: "⚡", title: "Electrician", description: "Wiring, switches, fans, inverters and fault finding." },
    { icon: "🚰", title: "Plumber", description: "Leaks, taps, pipes, bathroom fittings and drainage." },
    { icon: "❄️", title: "AC Service & Repair", description: "Servicing, gas refill, installation and repair." },
    { icon: "🧺", title: "Appliance Repair", description: "Washing machines, refrigerators, geysers and more." },
    { icon: "💻", title: "Computer & Laptop", description: "Hardware faults, OS issues, printers and networking." },
    { icon: "💧", title: "RO & Water Purifier", description: "Filter change, servicing and new installation." },
    { icon: "🪚", title: "Carpenter", description: "Furniture repair, door fittings and custom woodwork." },
    { icon: "🎨", title: "Painter", description: "Touch-ups, full rooms and waterproofing coats." },
];

const CUSTOMER_STEPS = [
    { number: "01", title: "Tell us what you need", description: "Pick a service category and set your location on the map." },
    { number: "02", title: "Compare nearby technicians", description: "See distance, rating, availability and completed jobs side by side." },
    { number: "03", title: "Send a request", description: "Describe the problem, choose a preferred time and send it." },
    { number: "04", title: "Track and review", description: "Follow the job status live, then rate the technician." },
];

const WORKER_STEPS = [
    { number: "01", title: "Create your profile", description: "Add your skills, experience and the area you work in." },
    { number: "02", title: "Set your availability", description: "Switch on when you are ready to take jobs, off when you are not." },
    { number: "03", title: "Receive nearby requests", description: "Get alerts for requests that match your skills. Accept or reject." },
    { number: "04", title: "Finish and grow", description: "Update the job status, collect ratings and build your reputation." },
];

const FEATURES = [
    { icon: "📍", title: "Nearby Search", description: "Location-based search shows technicians working close to you, on a map." },
    { icon: "🏆", title: "Smart Ranking", description: "Results are ordered by service match, distance, availability, rating and past work." },
    { icon: "🔔", title: "Real-Time Updates", description: "Instant notifications when a request is accepted, started or completed." },
    { icon: "🛡️", title: "Verified Profiles", description: "Technician details are reviewed by an admin before a profile is verified." },
    { icon: "⭐", title: "Honest Ratings", description: "Only customers with a completed job can leave a rating and review." },
    { icon: "🧾", title: "Service History", description: "Every request, response and outcome is saved in one place for both sides." },
];

const JOB_STATES = [
    { title: "Requested", description: "You send the request with problem details and preferred time." },
    { title: "Accepted", description: "The technician confirms. You get notified straight away." },
    { title: "In Progress", description: "The technician is working on the job." },
    { title: "Completed", description: "The job is done and you can leave a rating and review." },
];

const WORKER_BENEFITS = [
    "Get requests that match your skills and service area",
    "Accept or reject jobs, so your schedule stays in your control",
    "Build a public profile with ratings and completed-job history",
    "Receive an alert the moment a new request arrives",
];

const MARKET_STATS = [
    {
        value: "< 1%",
        label: "of India's ₹5.1 lakh crore home services market is booked online",
        note: "Redseer, FY25",
    },
    {
        value: "18-22%",
        label: "expected yearly growth of online home services until FY30",
        note: "Redseer, Sept 2025",
    },
    {
        value: "90%+",
        label: "of Indian workers are in informal jobs, often with no formal profile of their work",
        note: "Smile Foundation",
    },
];

const FAQS = [
    {
        question: "How do I find a technician near me?",
        answer: "Choose the service you need and set your location. TechConnect shows technicians within a set distance and ranks them by service match, distance, availability, rating and completed jobs.",
    },
    {
        question: "How are technicians verified?",
        answer: "Technicians add their details and documents when they register. An admin reviews them before the profile is marked as verified.",
    },
    {
        question: "What happens if a technician rejects my request?",
        answer: "You are notified immediately and can send the request to another technician from your search results.",
    },
    {
        question: "Can I cancel a request?",
        answer: "Yes. You can cancel before the work starts, and the request is recorded as Cancelled in your history.",
    },
    {
        question: "How does pricing work?",
        answer: "Technicians set their own charges. You can describe the problem in your request and confirm the details with the technician before the work begins.",
    },
    {
        question: "I am a skilled worker. How do I start getting jobs?",
        answer: "Sign up as a worker, add your skills, experience and service area, and switch your availability on. Matching requests will appear on your dashboard.",
    },
];

const SERVICE_OPTIONS = SERVICES.map((service) => service.title);

/* ================= PAGE ================= */

function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("customer");
    const [openFaq, setOpenFaq] = useState(0);
    const [service, setService] = useState("");
    const [location, setLocation] = useState("");
    const [messageSent, setMessageSent] = useState(false);
    const navigate = useNavigate();

    // Smooth scrolling for the in-page navigation links
    useEffect(() => {
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = "smooth";
        return () => {
            root.style.scrollBehavior = previous;
        };
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (service) params.set("service", service);
        if (location.trim()) params.set("location", location.trim());
        navigate(`/signup?${params.toString()}`);
    };

    const handleContactSubmit = (event) => {
        event.preventDefault();
        // TODO: send the form data to your backend (POST /api/contact)
        setMessageSent(true);
    };

    const steps = activeTab === "customer" ? CUSTOMER_STEPS : WORKER_STEPS;

    return (
        <div className="tc-landing min-h-screen bg-[#2d50a0] text-white">
            <style>{`
                .tc-landing {
                    --tc-violet: #8b5cf6;
                    --tc-cyan: #22d3ee;
                    --tc-pink: #f472b6;
                    background:
                        radial-gradient(ellipse at 12% 4%, rgba(99,102,241,.14), transparent 34rem),
                        radial-gradient(ellipse at 92% 30%, rgba(34,211,238,.07), transparent 30rem),
                        #070b14;
                    overflow: clip;
                }
                .tc-landing section[id] { scroll-margin-top: 88px; }
                .tc-landing nav {
                    background: rgba(7,11,20,.78);
                    box-shadow: 0 1px 0 rgba(255,255,255,.035);
                    backdrop-filter: blur(22px);
                }
                .tc-landing nav a { transition: color .2s ease, background .2s ease, border-color .2s ease, transform .2s ease; }
                .tc-landing nav a:hover { color: #fff; }
                .tc-landing #home { isolation: isolate; }
                .tc-landing #home::before {
                    content: "";
                    position: absolute;
                    z-index: -1;
                    width: min(72vw, 760px);
                    height: min(72vw, 760px);
                    top: -28%;
                    left: -22%;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99,102,241,.17), rgba(139,92,246,.05) 45%, transparent 70%);
                    filter: blur(12px);
                    pointer-events: none;
                }
                .tc-landing #home h1 { letter-spacing: -.055em; text-wrap: balance; }
                .tc-landing #home h1 span {
                    background-image: linear-gradient(105deg, #a5b4fc 0%, #818cf8 36%, #67e8f9 72%, #f0abfc 100%);
                    background-size: 180% auto;
                    animation: tc-gradient 8s ease-in-out infinite alternate;
                }
                .tc-landing #home form {
                    border-color: rgba(165,180,252,.2);
                    background: linear-gradient(135deg, rgba(30,41,59,.72), rgba(15,23,42,.55));
                    box-shadow: 0 20px 70px rgba(0,0,0,.22), inset 0 1px rgba(255,255,255,.05);
                    backdrop-filter: blur(18px);
                }
                .tc-landing #home form input:focus,
                .tc-landing #home form select:focus,
                .tc-landing #contact input:focus,
                .tc-landing #contact textarea:focus {
                    box-shadow: 0 0 0 4px rgba(129,140,248,.12);
                }
                .tc-landing #home > div > div:last-child > div.relative,
                .tc-landing #workers div.relative > div.relative {
                    border-color: rgba(165,180,252,.22);
                    box-shadow: 0 30px 100px rgba(0,0,0,.36), 0 0 55px rgba(99,102,241,.08), inset 0 1px rgba(255,255,255,.06);
                    backdrop-filter: blur(16px);
                }
                .tc-landing section:not(#home) { position: relative; }
                .tc-landing section:not(#home) h2 { letter-spacing: -.035em; text-wrap: balance; }
                .tc-landing section:not(#home) h2 span,
                .tc-landing #workers h2 span,
                .tc-landing footer .text-indigo-400 {
                    background: linear-gradient(110deg, #a5b4fc, #818cf8 45%, #67e8f9);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                .tc-landing #services a.group,
                .tc-landing section .group.rounded-2xl,
                .tc-landing #how-it-works .grid > div,
                .tc-landing section .grid > div.rounded-2xl {
                    box-shadow: 0 8px 28px rgba(0,0,0,.10);
                }
                .tc-landing #services a.group {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(145deg, rgba(17,24,39,.94), rgba(10,15,28,.96));
                    transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
                }
                .tc-landing #services a.group::before {
                    content: "";
                    position: absolute;
                    inset: 0 0 auto;
                    height: 2px;
                    opacity: 0;
                    background: linear-gradient(90deg, #818cf8, #22d3ee, #f0abfc);
                    transition: opacity .25s ease;
                }
                .tc-landing #services a.group:hover {
                    transform: translateY(-7px);
                    border-color: rgba(129,140,248,.48);
                    box-shadow: 0 22px 48px rgba(79,70,229,.12);
                }
                .tc-landing #services a.group:hover::before { opacity: 1; }
                .tc-landing #services a.group > div:first-child,
                .tc-landing section .group.rounded-2xl > div:first-child {
                    box-shadow: inset 0 1px rgba(255,255,255,.08);
                }
                .tc-landing #how-it-works .grid > div { transition: transform .25s ease; }
                .tc-landing #how-it-works .grid > div:hover { transform: translateY(-5px); }
                .tc-landing #contact form input,
                .tc-landing #contact form textarea {
                    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
                }
                .tc-landing #contact form input:focus,
                .tc-landing #contact form textarea:focus { background: rgba(17,24,39,.95); }
                .tc-landing footer { background: linear-gradient(180deg, transparent, rgba(15,23,42,.22)); }
                .tc-landing button, .tc-landing a { -webkit-tap-highlight-color: transparent; }
                @keyframes tc-gradient { from { background-position: 0% center; } to { background-position: 100% center; } }
                @media (prefers-reduced-motion: reduce) {
                    .tc-landing *, .tc-landing *::before, .tc-landing *::after {
                        animation-duration: .01ms !important;
                        animation-iteration-count: 1 !important;
                        scroll-behavior: auto !important;
                        transition-duration: .01ms !important;
                    }
                }
            `}</style>

            {/* ================= NAVBAR ================= */}
            <nav className="sticky top-0 z-50 border-b-2 border-white/60 rounded-b-3xl bg-[#070b14]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

                    <Link
                        to="/"
                        className="text-2xl font-extrabold tracking-wide text-indigo-400 sm:text-3xl"
                    >
                        TechConnect
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden items-center gap-7 lg:flex">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-gray-300 transition hover:text-white"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons + Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/login"
                            className="rounded-xl border-2 border-white/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500/10 sm:px-6 sm:py-2.5"
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="hidden rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 sm:block sm:px-6 sm:py-2.5"
                        >
                            Sign Up
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-lg text-gray-200 transition hover:bg-white/5 lg:hidden"
                        >
                            {menuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="border-t border-white/10 bg-[#070b14] px-5 py-5 lg:hidden">
                        <div className="flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-sm text-gray-300 transition hover:text-white"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <Link
                                to="/signup"
                                className="rounded-xl bg-indigo-500 px-4 py-3 text-center text-sm font-semibold text-white sm:hidden"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                )}
            </nav>


            {/* ================= HERO ================= */}
            <section id="home" className="relative overflow-hidden">
                <div className="pointer-events-none absolute left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 lg:py-28">

                    {/* Hero Content */}
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                            <span>✦</span>
                            Local services, made simple
                        </div>

                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            The right technician,
                            <br />
                            <span className="bg-linear-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                                just around the corner.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                            TechConnect connects customers with skilled local
                            workers. Find electricians, plumbers, AC and
                            appliance experts near you, or join as a worker and
                            get jobs that match your skills.
                        </p>

                        {/* Search Card */}
                        <form
                            onSubmit={handleSearch}
                            className="mt-8 grid max-w-xl gap-3 rounded-2xl border border-white/10 bg-white/3 p-3 sm:grid-cols-[1fr_1fr_auto]"
                        >
                            <select
                                value={service}
                                onChange={(event) => setService(event.target.value)}
                                aria-label="Service"
                                className="rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm text-gray-200 outline-none transition focus:border-indigo-400/60"
                            >
                                <option value="">Select service</option>
                                {SERVICE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                placeholder="Your area or city"
                                aria-label="Location"
                                className="rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-500 focus:border-indigo-400/60"
                            />

                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-600 cursor-pointer"
                            >
                                Find
                            </button>
                        </form>

                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                            <span>Are you a skilled worker?</span>
                            <Link
                                to="/signup"
                                className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                            >
                                Join as a worker →
                            </Link>
                        </div>
                    </div>


                    {/* Hero Visual: sample technician list */}
                    <div className="relative mx-auto w-full max-w-lg">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[90px]" />

                        <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-[#111827] to-[#0b1020] p-6 shadow-2xl">

                            <div className="mb-6 flex items-center justify-between">
                                <div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs text-indigo-300">
                                    Nearby technicians
                                </div>
                                <span className="text-xs text-gray-500">Sample preview</span>
                            </div>

                            {/* Mini map */}
                            <div className="relative mb-5 h-36 overflow-hidden rounded-2xl border border-white/5 bg-[#0d1320]">
                                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[28px_28px]" />
                                <span className="absolute left-[48%] top-[45%] flex h-4 w-4 items-center justify-center rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                                <span className="absolute left-[25%] top-[28%] h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/40" />
                                <span className="absolute left-[68%] top-[30%] h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/40" />
                                <span className="absolute left-[60%] top-[68%] h-3 w-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/40" />
                                <span className="absolute bottom-2 left-3 text-[10px] text-gray-500">
                                    You are here
                                </span>
                            </div>

                            <div className="space-y-3">
                                <TechnicianRow initials="RK" name="Ravi K." trade="Electrician" distance="0.8 km" rating="4.8" available />
                                <TechnicianRow initials="SM" name="Sunita M." trade="AC Technician" distance="1.4 km" rating="4.7" available />
                                <TechnicianRow initials="AJ" name="Rahul" trade="Plumber" distance="2.1 km" rating="4.5" available={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ================= TRUST STRIP ================= */}
            <section className="border-y border-white/20 bg-white/2">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4">
                    <TrustItem icon="🛡️" text="Verified Profiles" />
                    <TrustItem icon="📍" text="Distance-Based Search" />
                    <TrustItem icon="🔔" text="Real-Time Updates" />
                    <TrustItem icon="⭐" text="Genuine Reviews" />
                </div>
            </section>


            {/* ================= SERVICES ================= */}
            <section id="services" className="px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">

                    <SectionHeading
                        eyebrow="SERVICES"
                        title="Help for every"
                        highlight="repair job"
                        description="From a leaking tap to a laptop that will not boot, find a skilled person for the job."
                    />

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {SERVICES.map((item) => (
                            <ServiceCard key={item.title} {...item} />
                        ))}
                    </div>
                </div>
            </section>


            {/* ================= HOW IT WORKS ================= */}
            <section
                id="how-it-works"
                className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto max-w-7xl">

                    <SectionHeading
                        eyebrow="HOW IT WORKS"
                        title="Simple."
                        highlight="Transparent."
                    />

                    {/* Tabs */}
                    <div className="mx-auto mt-8 flex w-fit rounded-xl border border-white/10 bg-white/3 p-1">
                        <TabButton
                            active={activeTab === "customer"}
                            onClick={() => setActiveTab("customer")}
                        >
                            I need a service
                        </TabButton>
                        <TabButton
                            active={activeTab === "worker"}
                            onClick={() => setActiveTab("worker")}
                        >
                            I am a worker
                        </TabButton>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-4">
                        {steps.map((step) => (
                            <Step key={step.number} {...step} />
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            to="/signup"
                            className="inline-block rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-600"
                        >
                            {activeTab === "customer" ? "Find a Technician →" : "Join as a Worker →"}
                        </Link>
                    </div>
                </div>
            </section>


            {/* ================= FEATURES ================= */}
            <section className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">

                    <SectionHeading
                        eyebrow="WHY TechConnect"
                        title="Built for"
                        highlight="trust and speed"
                        description="Everything customers and workers need to find each other, agree on the job and get it done."
                    />

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </div>
            </section>


            {/* ================= JOB TRACKING ================= */}
            <section className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">

                    <SectionHeading
                        eyebrow="TRACK EVERY JOB"
                        title="Always know"
                        highlight="where things stand"
                        description="Each request moves through clear stages, and both sides see the same status."
                    />

                    <div className="mt-12 grid gap-4 md:grid-cols-4">
                        {JOB_STATES.map((state, index) => (
                            <div
                                key={state.title}
                                className="relative rounded-2xl border border-white/10 bg-[#0d1320] p-6"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-400">
                                        {index + 1}
                                    </span>
                                    <h3 className="font-bold">{state.title}</h3>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    {state.description}
                                </p>

                                {index < JOB_STATES.length - 1 && (
                                    <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-indigo-400/60 md:block">
                                        →
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Requests can also be Rejected or Cancelled, and both are saved in your history.
                    </p>
                </div>
            </section>


            {/* ================= FOR WORKERS ================= */}
            <section
                id="workers"
                className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

                    <div>
                        <p className="text-sm font-bold tracking-[0.2em] text-indigo-400">
                            FOR WORKERS
                        </p>

                        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                            Turn your skill into{" "}
                            <span className="text-indigo-400">steady work</span>
                        </h2>

                        <p className="mt-4 max-w-xl text-gray-400">
                            Most skilled workers still depend on word of mouth.
                            TechConnect gives you a profile, a reputation and a
                            steady stream of nearby requests.
                        </p>

                        <ul className="mt-6 space-y-3">
                            {WORKER_BENEFITS.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-xs text-indigo-400">
                                        ✓
                                    </span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/signup"
                            className="mt-8 inline-block rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-600"
                        >
                            Join as a Worker →
                        </Link>
                    </div>

                    {/* Sample request card */}
                    <div className="relative mx-auto w-full max-w-md">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[80px]" />

                        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-[#111827] to-[#0b1020] p-6 shadow-2xl">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-200">
                                    Worker dashboard
                                </span>
                                <span className="flex items-center gap-2 text-xs text-green-400">
                                    <span className="h-2 w-2 rounded-full bg-green-400" />
                                    Available
                                </span>
                            </div>

                            <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold tracking-wide text-indigo-300">
                                        NEW REQUEST
                                    </p>
                                    <p className="text-xs text-gray-500">2.4 km away</p>
                                </div>

                                <h3 className="mt-3 font-bold">AC not cooling</h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Split AC, running but warm air. Preferred time: tomorrow, 11 AM.
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <span className="rounded-xl bg-indigo-500 py-2.5 text-center text-sm font-semibold">
                                        Accept
                                    </span>
                                    <span className="rounded-xl border border-white/15 py-2.5 text-center text-sm font-semibold text-gray-300">
                                        Reject
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                <MiniStat value="4.8" label="Rating" />
                                <MiniStat value="126" label="Jobs done" />
                                <MiniStat value="12 min" label="Avg. response" />
                            </div>

                            <p className="mt-4 text-center text-[11px] text-gray-600">
                                Sample preview with example data
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* ================= WHY NOW (MARKET FACTS) ================= */}
            <section className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">

                    <SectionHeading
                        eyebrow="WHY NOW"
                        title="A huge market,"
                        highlight="still offline"
                        description="Home services in India are largely unorganised. Good technicians are hard to find, and good workers are hard to discover."
                    />

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {MARKET_STATS.map((stat) => (
                            <div
                                key={stat.value}
                                className="rounded-2xl border border-white/10 bg-[#0d1320] p-7 text-center"
                            >
                                <p className="text-4xl font-extrabold text-indigo-400">
                                    {stat.value}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-gray-400">
                                    {stat.label}
                                </p>
                                <p className="mt-3 text-xs text-gray-600">{stat.note}</p>
                            </div>
                        ))}
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-600">
                        Sources:{" "}
                        <a
                            href="https://ibef.org/news/india-s-online-home-services-market-to-grow-22-to-rs-8-800-crore-us-1-billion-by-fy30-report"
                            target="_blank"
                            rel="noreferrer"
                            className="underline transition hover:text-gray-400"
                        >
                            IBEF, citing Redseer (Sept 2025)
                        </a>
                        {" • "}
                        <a
                            href="https://www.smilefoundationindia.org/blog/?p=13842"
                            target="_blank"
                            rel="noreferrer"
                            className="underline transition hover:text-gray-400"
                        >
                            Smile Foundation
                        </a>
                    </p>
                </div>
            </section>


            {/* ================= FAQ ================= */}
            <section
                id="faq"
                className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto max-w-3xl">

                    <SectionHeading
                        eyebrow="FAQ"
                        title="Questions,"
                        highlight="Answered"
                    />

                    <div className="mt-10 space-y-3">
                        {FAQS.map((faq, index) => (
                            <FaqItem
                                key={faq.question}
                                question={faq.question}
                                answer={faq.answer}
                                open={openFaq === index}
                                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                            />
                        ))}
                    </div>
                </div>
            </section>


            {/* ================= CTA ================= */}
            <section className="px-5 py-16 sm:px-8 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-linear-to-br from-indigo-500/10 via-[#111827] to-[#0b1020] p-8 sm:p-12">

                        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

                        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

                            <div>
                                <div className="mb-3 inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs text-indigo-300">
                                    Free to get started
                                </div>

                                <h2 className="text-3xl font-bold sm:text-4xl">
                                    Ready to{" "}
                                    <span className="text-indigo-400">connect?</span>
                                </h2>

                                <p className="mt-3 max-w-xl text-gray-400">
                                    Whether you need a repair done today or want
                                    more work tomorrow, TechConnect is the place to start.
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <Link
                                    to="/signup"
                                    className="rounded-xl bg-indigo-500 px-7 py-3.5 text-center text-sm font-bold transition hover:bg-indigo-600"
                                >
                                    Sign Up
                                </Link>

                                <Link
                                    to="/login"
                                    className="rounded-xl border border-white/15 px-7 py-3.5 text-center text-sm font-semibold transition hover:bg-white/5"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ================= CONTACT ================= */}
            <section
                id="contact"
                className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto max-w-2xl">

                    <SectionHeading
                        eyebrow="CONTACT"
                        title="Get in"
                        highlight="touch"
                        description="Questions, feedback or a problem with a request? Send us a message."
                    />

                    {messageSent ? (
                        <div className="mt-10 rounded-2xl border border-green-400/20 bg-green-500/5 p-8 text-center">
                            <p className="text-lg font-bold text-green-400">Message sent</p>
                            <p className="mt-2 text-sm text-gray-400">
                                Thanks for reaching out. We will get back to you soon.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleContactSubmit} className="mt-10 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    type="text"
                                    required
                                    placeholder="Your name"
                                    aria-label="Your name"
                                    className="rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-500 focus:border-indigo-400/60"
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    aria-label="Email address"
                                    className="rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-500 focus:border-indigo-400/60"
                                />
                            </div>

                            <textarea
                                required
                                rows={5}
                                placeholder="How can we help?"
                                aria-label="Message"
                                className="w-full rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-500 focus:border-indigo-400/60"
                            />

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-600 cursor-pointer"
                            >
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </section>


            {/* ================= FOOTER ================= */}
            <footer className="border-t border-white/10 px-5 py-12 sm:px-8">
                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-10 md:grid-cols-4">

                        <div className="md:col-span-2">
                            <p className="text-2xl font-bold text-indigo-400">
                                TechConnect
                            </p>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
                                A platform that connects customers with skilled
                                local workers for repair and maintenance services.
                            </p>
                        </div>

                        <FooterColumn
                            title="Platform"
                            links={[
                                { label: "Services", href: "#services" },
                                { label: "How It Works", href: "#how-it-works" },
                                { label: "For Workers", href: "#workers" },
                                { label: "FAQ", href: "#faq" },
                            ]}
                        />

                        <div>
                            <p className="text-sm font-semibold text-gray-200">Account</p>
                            <ul className="mt-4 space-y-3 text-sm text-gray-500">
                                <li>
                                    <Link to="/login" className="transition hover:text-white">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/signup" className="transition hover:text-white">
                                        Sign up as customer
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/signup" className="transition hover:text-white">
                                        Join as worker
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                        <p>© {new Date().getFullYear()} TechConnect. All rights reserved.</p>
                        <p>People • Skills • Progress</p>
                    </div>
                </div>
            </footer>

            <button
            
            className="flex items-center justify-center m-3 gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white font-semibold disabled:opacity-70 text-lg"
            >
                <div className="p-2 h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white">
                </div>
                Loading Profile
            </button>

        </div>
    );
}


/* ================= SMALL COMPONENTS ================= */

function SectionHeading({ eyebrow, title, highlight, description }) {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-indigo-400">
                {eyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {title} <span className="text-indigo-400">{highlight}</span>
            </h2>

            {description && (
                <p className="mt-4 text-gray-400">{description}</p>
            )}
        </div>
    );
}

function TrustItem({ icon, text }) {
    return (
        <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-lg">
                {icon}
            </span>
            {text}
        </div>
    );
}

function TechnicianRow({ initials, name, trade, distance, rating, available }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border-2 border-white/5 bg-white/3 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
                {initials}
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-200">{name}</p>
                <p className="text-xs text-gray-500">
                    {trade} • {distance}
                </p>
            </div>

            <div className="text-right">
                <p className="text-sm font-semibold text-amber-300">★ {rating}</p>
                <p className={`text-xs ${available ? "text-green-400" : "text-amber-400"}`}>
                    {available ? "Available" : "Busy"}
                </p>
            </div>
        </div>
    );
}

function ServiceCard({ icon, title, description }) {
    return (
        <Link
            to="/signup"
            className="group rounded-2xl border border-white/10 bg-[#0d1320] p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-[#111827]"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">
                {icon}
            </div>

            <h3 className="mt-5 text-lg font-bold">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>

            <span className="mt-4 inline-block text-sm font-semibold text-indigo-400 opacity-0 transition group-hover:opacity-100">
                Find Technicians →
            </span>
        </Link>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
        >
            {children}
        </button>
    );
}

function Step({ number, title, description }) {
    return (
        <div className="relative text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10 text-sm font-bold text-indigo-400">
                {number}
            </div>

            <h3 className="mt-5 font-bold">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group rounded-2xl border border-white/10 bg-white/3 p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/5">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">
                {icon}
            </div>

            <h3 className="text-lg font-bold">{title}</h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
        </div>
    );
}

function MiniStat({ value, label }) {
    return (
        <div className="rounded-xl border border-white/5 bg-white/3 px-2 py-3">
            <p className="text-lg font-bold text-indigo-400">{value}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{label}</p>
        </div>
    );
}

function FaqItem({ question, answer, open, onToggle }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#0d1320]">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
            >
                <span className="font-semibold">{question}</span>
                <span
                    className={`flex h-8 text-xl w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-indigo-400 transition ${open ? "rotate-45" : ""
                        }`}
                >
                    +
                </span>
            </button>

            {open && (
                <p className="px-6 pb-5 text-sm leading-6 text-gray-400">{answer}</p>
            )}
        </div>
    );
}

function FooterColumn({ title, links }) {
    return (
        <div>
            <p className="text-sm font-semibold text-gray-200">{title}</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
                {links.map((link) => (
                    <li key={link.href}>
                        <a href={link.href} className="transition hover:text-white">
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LandingPage;