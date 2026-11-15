import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Clock3,
    MapPin,
    Menu,
    ShieldCheck,
    Star,
    X,
    Zap,
    Wrench,
    Droplets,
    Snowflake,
    WashingMachine,
    Laptop,
    Paintbrush,
    Hammer,
    Search,
    Users,
} from "lucide-react";

const NAV_LINKS = [
    { label: "Services", href: "#services" },
    { label: "How it works", href: "#how-it-works" },
    { label: "For technicians", href: "#workers" },
    { label: "FAQs", href: "#faq" },
];

const SERVICES = [
    { title: "Electrician", description: "Wiring, switches, fans and electrical repairs.", icon: Zap },
    { title: "Plumber", description: "Leaks, taps, pipes and bathroom fittings.", icon: Droplets },
    { title: "AC repair", description: "AC servicing, installation and repair.", icon: Snowflake },
    { title: "Appliance repair", description: "Washing machines, refrigerators and geysers.", icon: WashingMachine },
    { title: "Computer & laptop", description: "Hardware, software and networking support.", icon: Laptop },
    { title: "Carpenter", description: "Furniture repairs, fittings and woodwork.", icon: Hammer },
    { title: "Painter", description: "Room painting, touch-ups and waterproofing.", icon: Paintbrush },
    { title: "Home maintenance", description: "Reliable help for everyday home repairs.", icon: Wrench },
];

const CUSTOMER_STEPS = [
    { number: "01", title: "Choose a service", description: "Tell us what needs fixing and where you need help." },
    { number: "02", title: "Compare technicians", description: "Explore nearby profiles, ratings and availability." },
    { number: "03", title: "Book with confidence", description: "Send a request for a date and time that works for you." },
];

const WORKER_STEPS = [
    { number: "01", title: "Create your profile", description: "Add your skills, experience and service location." },
    { number: "02", title: "Get verified", description: "Your profile is reviewed before you start receiving requests." },
    { number: "03", title: "Grow your work", description: "Manage bookings and build your reputation with reviews." },
];

const FEATURES = [
    { title: "Local discovery", description: "Find technicians based on your location and service needs.", icon: MapPin },
    { title: "Verified profiles", description: "Worker profiles are reviewed before being approved.", icon: ShieldCheck },
    { title: "Clear availability", description: "Check working hours and request a suitable time slot.", icon: Clock3 },
    { title: "Trusted reviews", description: "Read customer feedback and review completed work.", icon: Star },
];

const FAQS = [
    {
        question: "How do I find a technician near me?",
        answer: "Choose a service and provide your location. TechConnect helps you discover technicians nearby and compare their profiles.",
    },
    {
        question: "Are technicians verified?",
        answer: "Technicians submit their profile details for review. Approved profiles are then made available to customers.",
    },
    {
        question: "Can I choose a booking date and time?",
        answer: "Yes. You can select your preferred date, start time and service duration while creating a booking request.",
    },
    {
        question: "Can I cancel a booking?",
        answer: "You can cancel a booking according to its current status and the platform's booking rules.",
    },
    {
        question: "How can I join as a technician?",
        answer: "Create an account as a worker, complete your profile and submit it for verification.",
    },
];

function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("customer");
    const [openFaq, setOpenFaq] = useState(0);
    const [service, setService] = useState("");
    const [location, setLocation] = useState("");
    const navigate = useNavigate();

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

    const steps = activeTab === "customer" ? CUSTOMER_STEPS : WORKER_STEPS;

    return (
        <main className="min-h-screen overflow-hidden bg-[#090b10] text-slate-100 selection:bg-indigo-500/30">
            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#090b10]/90 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                    <Link to="/" className="flex items-center gap-2.5" aria-label="TechConnect home">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
                            <Wrench size={19} strokeWidth={2.4} />
                        </span>
                        <span className="text-xl font-bold tracking-tight">Tech<span className="text-indigo-400">Connect</span></span>
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        {NAV_LINKS.map((item) => (
                            <a key={item.href} href={item.href} className="text-sm text-slate-400 transition hover:text-white">
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 sm:flex">
                        <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                            Log in
                        </Link>
                        <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400">
                            Get started <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 sm:hidden"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </nav>

                {menuOpen && (
                    <div className="border-t border-white/[0.07] bg-[#0d1018] px-5 py-5 sm:hidden">
                        <div className="flex flex-col gap-4">
                            {NAV_LINKS.map((item) => (
                                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm text-slate-300">
                                    {item.label}
                                </a>
                            ))}
                            <div className="flex gap-3 border-t border-white/10 pt-4">
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-center text-sm">Log in</Link>
                                <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-center text-sm font-semibold">Get started</Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero */}
            <section id="home" className="relative border-b border-white/[0.06]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(99,102,241,0.14),transparent_38%),radial-gradient(ellipse_at_10%_80%,rgba(79,70,229,0.08),transparent_35%)]" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.08] px-3.5 py-2 text-xs font-medium text-indigo-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                            Your neighbourhood service network
                        </div>
                        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                            Skilled help, <span className="text-indigo-400">closer</span> to home.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                            Discover trusted local technicians for everyday repairs and home services. Compare profiles, check availability and book with confidence.
                        </p>

                        <form onSubmit={handleSearch} className="mt-9 grid max-w-2xl gap-3 rounded-2xl border border-white/10 bg-[#11151f] p-3 shadow-2xl shadow-black/20 sm:grid-cols-[1fr_1fr_auto]">
                            <label className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2">
                                <Wrench size={18} className="shrink-0 text-slate-500" />
                                <select
                                    value={service}
                                    onChange={(event) => setService(event.target.value)}
                                    aria-label="Choose a service"
                                    className="w-full min-w-0 bg-transparent text-sm text-slate-200 outline-none"
                                >
                                    <option value="" className="bg-[#11151f]">Select a service</option>
                                    {SERVICES.map((item) => <option key={item.title} value={item.title} className="bg-[#11151f]">{item.title}</option>)}
                                </select>
                            </label>
                            <label className="flex min-w-0 items-center gap-3 rounded-xl border-t border-white/[0.07] px-3 py-2 sm:border-l sm:border-t-0">
                                <MapPin size={18} className="shrink-0 text-slate-500" />
                                <input
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="Your area or pincode"
                                    aria-label="Your area or pincode"
                                    className="w-full min-w-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
                                />
                            </label>
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
                                <Search size={17} /> Find help
                            </button>
                        </form>

                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-indigo-400" /> Reviewed worker profiles</span>
                            <span className="inline-flex items-center gap-2"><Clock3 size={15} className="text-indigo-400" /> Check working hours</span>
                            <span className="inline-flex items-center gap-2"><Star size={15} className="text-indigo-400" /> Customer reviews</span>
                        </div>
                    </div>

                    {/* Compact product preview */}
                    <div className="relative mx-auto w-full max-w-lg">
                        <div className="absolute -inset-6 rounded-[2rem] bg-indigo-500/[0.08] blur-3xl" />
                        <div className="relative rounded-2xl border border-white/10 bg-[#11151f] p-5 shadow-2xl shadow-black/30 sm:p-6">
                            <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                                <div>
                                    <p className="text-sm font-semibold text-white">Nearby technicians</p>
                                    <p className="mt-1 text-xs text-slate-500">A simple way to find local help</p>
                                </div>
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-300">Discover</span>
                            </div>
                            <div className="mt-5 space-y-3">
                                <TechnicianPreview initials="RK" name="Rahul Kumar" trade="Electrician" distance="1.2 km away" rating="4.9" />
                                <TechnicianPreview initials="AS" name="Amit Sharma" trade="Plumber" distance="2.4 km away" rating="4.8" />
                                <TechnicianPreview initials="MS" name="Mohit Singh" trade="AC technician" distance="3.1 km away" rating="4.7" />
                            </div>
                            <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-400/15 bg-indigo-400/[0.06] px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300"><MapPin size={17} /></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-200">Find help around you</p>
                                        <p className="mt-0.5 text-[11px] text-slate-500">Explore by service and location</p>
                                    </div>
                                </div>
                                <ArrowRight size={17} className="text-indigo-300" />
                            </div>
                            <p className="mt-3 text-center text-[10px] text-slate-600">Illustrative preview · Actual results depend on your search</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
                <SectionHeading eyebrow="WHAT YOU NEED, WHEN YOU NEED IT" title="Services for everyday fixes" description="Find local professionals across common home and personal service categories." />
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {SERVICES.map((item) => <ServiceCard key={item.title} {...item} />)}
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="border-y border-white/[0.06] bg-[#0d1018] px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <SectionHeading eyebrow="SIMPLE BY DESIGN" title="How TechConnect works" description="A straightforward process for customers and skilled workers." />
                    <div className="mx-auto mt-8 flex w-fit rounded-xl border border-white/10 bg-[#090b10] p-1">
                        <TabButton active={activeTab === "customer"} onClick={() => setActiveTab("customer")}>For customers</TabButton>
                        <TabButton active={activeTab === "worker"} onClick={() => setActiveTab("worker")}>For technicians</TabButton>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={step.number} className="relative rounded-2xl border border-white/[0.07] bg-[#11151f] p-7">
                                <p className="text-sm font-semibold tracking-widest text-indigo-400">{step.number}</p>
                                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
                                {index < steps.length - 1 && <ArrowRight className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-slate-700 md:block" size={20} />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why TechConnect */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
                <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-indigo-400">WHY TECHCONNECT</p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Local services, with more clarity.</h2>
                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">Finding reliable help should feel simple. TechConnect brings discovery, worker information and booking details together in one place.</p>
                        <Link to="/signup" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200">
                            Explore TechConnect <ArrowUpRight size={17} />
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {FEATURES.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
                    </div>
                </div>
            </section>

            {/* Worker CTA */}
            <section id="workers" className="px-5 pb-20 sm:px-8 lg:pb-24">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-indigo-400/20 bg-[#111522] p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:p-14">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-indigo-300"><Users size={15} /> FOR SKILLED TECHNICIANS</div>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your skills deserve to be discovered.</h2>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">Create your profile, share the services you offer and connect with customers looking for local expertise.</p>
                    </div>
                    <Link to="/signup" className="mt-8 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 lg:mt-0">
                        Join as a technician <ArrowRight size={17} />
                    </Link>
                </div>
            </section>

            {/* FAQs */}
            <section id="faq" className="border-t border-white/[0.06] bg-[#0d1018] px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-3xl">
                    <SectionHeading eyebrow="NEED TO KNOW" title="Frequently asked questions" description="A few quick answers to help you get started." />
                    <div className="mt-10 space-y-3">
                        {FAQS.map((faq, index) => (
                            <div key={faq.question} className="rounded-xl border border-white/[0.07] bg-[#11151f]">
                                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left">
                                    <span className="text-sm font-medium text-slate-200">{faq.question}</span>
                                    <ChevronDown size={18} className={`shrink-0 text-slate-500 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                                </button>
                                {openFaq === index && <p className="px-5 pb-5 text-sm leading-7 text-slate-400">{faq.answer}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.07] px-5 py-10 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link to="/" className="text-lg font-bold tracking-tight text-white">Tech<span className="text-indigo-400">Connect</span></Link>
                        <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">Connecting customers with skilled local technicians for everyday services.</p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
                        <a href="#services" className="hover:text-white">Services</a>
                        <a href="#how-it-works" className="hover:text-white">How it works</a>
                        <a href="#workers" className="hover:text-white">For technicians</a>
                        <a href="#faq" className="hover:text-white">FAQs</a>
                        <Link to="/login" className="hover:text-white">Log in</Link>
                    </div>
                    <p className="text-xs text-slate-600">© {new Date().getFullYear()} TechConnect</p>
                </div>
            </footer>
        </main>
    );
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-indigo-400">{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
            {description && <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p>}
        </div>
    );
}

function TechnicianPreview({ initials, name, trade, distance, rating }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0d111a] p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-400/10 text-xs font-semibold text-indigo-300">{initials}</div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{name}</p>
                <p className="mt-1 text-xs text-slate-500">{trade} · {distance}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-amber-300"><Star size={13} fill="currentColor" /> {rating}</div>
        </div>
    );
}

function ServiceCard({ title, description, icon: Icon }) {
    return (
        <Link to="/signup" className="group rounded-xl border border-white/[0.07] bg-[#11151f] p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-[#141a27]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300 transition group-hover:bg-indigo-400/15">
                <Icon size={19} />
            </div>
            <h3 className="mt-5 text-sm font-semibold text-slate-100">{title}</h3>
            <p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300">Explore <ArrowRight size={13} /></span>
        </Link>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button type="button" onClick={onClick} className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${active ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}>
            {children}
        </button>
    );
}

function FeatureCard({ title, description, icon: Icon }) {
    return (
        <div className="rounded-xl border border-white/[0.07] bg-[#11151f] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300"><Icon size={18} /></div>
            <h3 className="mt-4 text-sm font-semibold text-slate-100">{title}</h3>
            <p className="mt-2 text-xs leading-6 text-slate-500">{description}</p>
        </div>
    );
}

export default LandingPage;
