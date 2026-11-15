import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, MapPin, Menu,
  ShieldCheck, Star, X, Zap, Wrench, Droplets, Snowflake,
  WashingMachine, Laptop, Paintbrush, Hammer, Search, Users,
  BadgeCheck, CalendarDays, Sparkles, LocateFixed,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Why TechConnect", href: "#why" },
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how" },
  { label: "For technicians", href: "#workers" },
];

const SERVICES = [
  { title: "Electrician", detail: "Wiring, switches & repairs", icon: Zap, tone: "text-amber-300 bg-amber-300/10" },
  { title: "Plumber", detail: "Leaks, taps & pipelines", icon: Droplets, tone: "text-sky-300 bg-sky-300/10" },
  { title: "AC repair", detail: "Service, install & repair", icon: Snowflake, tone: "text-cyan-300 bg-cyan-300/10" },
  { title: "Appliance repair", detail: "Fridge, washer & more", icon: WashingMachine, tone: "text-violet-300 bg-violet-300/10" },
  { title: "Laptop repair", detail: "Hardware & software help", icon: Laptop, tone: "text-blue-300 bg-blue-300/10" },
  { title: "Carpenter", detail: "Furniture & woodwork", icon: Hammer, tone: "text-orange-300 bg-orange-300/10" },
  { title: "Painter", detail: "Painting & finishing", icon: Paintbrush, tone: "text-pink-300 bg-pink-300/10" },
  { title: "Home maintenance", detail: "Everyday fixes, made easy", icon: Wrench, tone: "text-emerald-300 bg-emerald-300/10" },
];

const TECHNICIANS = [
  { name: "Rahul Kumar", trade: "Electrician", area: "Nearby professional", rating: "4.9", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&auto=format&fit=crop&q=80", initials: "RK", skills: ["Wiring", "Appliances"] },
  { name: "Amit Sharma", trade: "Plumber", area: "Home repair specialist", rating: "4.8", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&auto=format&fit=crop&q=80", initials: "AS", skills: ["Pipelines", "Fittings"] },
  { name: "Mohit Singh", trade: "AC technician", area: "Cooling & servicing", rating: "4.7", image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=700&auto=format&fit=crop&q=80", initials: "MS", skills: ["AC service", "Installation"] },
];

const FAQS = [
  ["How do I find a technician near me?", "Choose the service you need and enter your area. You can explore technician profiles and compare the information available before sending a booking request."],
  ["Are technicians verified?", "Technicians submit their details for review. Only approved worker profiles are made available to customers."],
  ["Can I select a date and time?", "Yes. Select your preferred date, start time and service duration. Booking requests are checked against the technician's working hours and existing bookings."],
  ["When can I chat with a technician?", "Customer-worker chat becomes available after a booking is created, so the conversation is connected to a service request."],
];

function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (location.trim()) params.set("location", location.trim());
    navigate(`/signup?${params.toString()}`);
  };

  const goSignup = () => navigate("/signup");

  return (
    <main className="min-h-screen overflow-hidden bg-[#080b0a] text-zinc-100 selection:bg-lime-300 selection:text-black">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b0a]/90 backdrop-blur-xl">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-300 text-black"><Wrench size={20} strokeWidth={2.5} /></span>
            <span className="text-xl font-bold tracking-tight">Tech<span className="text-lime-300">Connect</span></span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((item) => <a key={item.href} href={item.href} className="text-sm text-zinc-400 transition hover:text-lime-300">{item.label}</a>)}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link to="/login" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:text-white">Log in</Link>
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-lime-200">Get started <ArrowUpRight size={16} /></Link>
          </div>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle navigation" aria-expanded={menuOpen} className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-zinc-200 sm:hidden">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {menuOpen && <div className="absolute left-0 right-0 top-full border-b border-white/10 bg-[#0d1210] px-5 py-5 shadow-xl sm:hidden">
            <div className="flex flex-col gap-5">
              {NAV_LINKS.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm text-zinc-300">{item.label}</a>)}
              <div className="flex gap-3 border-t border-white/10 pt-4">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-white/15 py-3 text-center text-sm">Log in</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-lime-300 py-3 text-center text-sm font-bold text-black">Get started</Link>
              </div>
            </div>
          </div>}
        </nav>
      </header>

      <section className="relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_35%,rgba(163,230,53,0.13),transparent_35%),radial-gradient(ellipse_at_5%_80%,rgba(34,197,94,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.02fr_.98fr] lg:px-8">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/[0.07] px-4 py-2 text-xs font-semibold tracking-wide text-lime-200"><Sparkles size={14} /> LOCAL SKILLS. REAL CONNECTIONS.</div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.6rem]">Your local fix, <span className="text-lime-300">one tap</span> away.</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">Find skilled technicians around your neighbourhood. Compare profiles, check availability and book the right person for the job.</p>
            <form onSubmit={handleSearch} className="mt-9 max-w-2xl rounded-2xl border border-white/10 bg-[#111714] p-2 shadow-2xl shadow-black/40 sm:flex sm:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
                <Wrench size={18} className="shrink-0 text-lime-300" />
                <select value={service} onChange={(e) => setService(e.target.value)} aria-label="Select a service" className="w-full min-w-0 bg-transparent text-sm text-zinc-200 outline-none [color-scheme:dark]">
                  <option value="">What do you need?</option>
                  {SERVICES.map((item) => <option key={item.title} value={item.title}>{item.title}</option>)}
                </select>
              </label>
              <div className="hidden h-9 w-px bg-white/10 sm:block" />
              <label className="flex min-w-0 flex-1 items-center gap-3 border-t border-white/10 px-3 py-3 sm:border-0">
                <MapPin size={18} className="shrink-0 text-lime-300" />
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter your area or pincode" aria-label="Your location" className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500" />
              </label>
              <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-4 text-sm font-bold text-black transition hover:bg-lime-200 sm:mt-0 sm:w-auto"><Search size={17} /> Find a pro</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-zinc-500">
              <span className="flex items-center gap-2"><BadgeCheck size={15} className="text-lime-300" /> Reviewed profiles</span>
              <span className="flex items-center gap-2"><CalendarDays size={15} className="text-lime-300" /> Availability-aware booking</span>
              <span className="flex items-center gap-2"><Star size={15} className="text-lime-300" /> Customer reviews</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-8 rounded-full bg-lime-300/[0.08] blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#111714] p-4 shadow-2xl shadow-black/50 sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 px-1 pb-4">
                <div><p className="text-sm font-semibold text-white">Local professionals</p><p className="mt-1 text-xs text-zinc-500">A preview of what you can discover</p></div>
                <span className="flex items-center gap-1.5 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-[11px] font-semibold text-lime-200"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Discover</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="relative col-span-2 h-48 overflow-hidden rounded-2xl sm:h-56">
                  <img src="https://images.unsplash.com/photo-1621905236667-5b7f5e7b1a2c?w=1200&auto=format&fit=crop&q=85" alt="Technician working on a home repair" className="h-full w-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4"><p className="text-xs font-medium text-lime-200">HELP AROUND THE CORNER</p><p className="mt-1 text-xl font-bold text-white">Skilled hands. Peace of mind.</p></div>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#171f1a] p-4"><div className="flex items-center gap-2 text-lime-300"><ShieldCheck size={17} /><span className="text-xs font-semibold">Verified profiles</span></div><p className="mt-2 text-xs leading-5 text-zinc-400">Worker profiles reviewed before approval.</p></div>
                <div className="rounded-xl border border-white/10 bg-[#171f1a] p-4"><div className="flex items-center gap-2 text-lime-300"><Clock3 size={17} /><span className="text-xs font-semibold">Better booking</span></div><p className="mt-2 text-xs leading-5 text-zinc-400">Choose a time that fits working hours.</p></div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-lime-300/15 bg-lime-300/[0.06] px-4 py-3">
                <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-black"><LocateFixed size={17} /></div><div><p className="text-xs font-semibold text-white">Start with your location</p><p className="mt-0.5 text-[11px] text-zinc-500">Discover services in your area</p></div></div>
                <ArrowUpRight size={18} className="text-lime-300" />
              </div>
              <p className="mt-3 text-center text-[10px] text-zinc-600">Illustrative preview · Actual technicians depend on your search</p>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="relative z-10 border-t border-white/10 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">WHY TECHCONNECT</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Finding reliable help shouldn't be hard.</h2><p className="mt-5 leading-7 text-zinc-400">No endless searching. Discover local skills, understand availability and keep your service booking organised in one place.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[["01","Discover nearby","Explore technicians by service category and location."],["02","Book with clarity","Choose your preferred date, time and service duration."],["03","Build trust","Check profiles, ratings and feedback from customers."]].map(([n,t,d]) => <div key={n} className="rounded-2xl border border-white/10 bg-[#111714] p-7 transition hover:-translate-y-1 hover:border-lime-300/30"><span className="text-sm font-bold text-lime-300">{n}</span><h3 className="mt-8 text-xl font-semibold text-white">{t}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section id="services" className="relative z-10 border-t border-white/10 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">WHAT CAN WE HELP WITH?</p><h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Find the right service.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">From quick fixes to home maintenance, discover skilled people for the job.</p></div><Link to="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">Explore all services <ArrowUpRight size={17} /></Link></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ title, detail, icon: Icon, tone }) => <Link key={title} to={`/signup?service=${encodeURIComponent(title)}`} className="group rounded-2xl border border-white/10 bg-[#111714] p-5 transition duration-200 hover:-translate-y-1 hover:border-lime-300/30 hover:bg-[#151e18]"><div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}><Icon size={21} /></div><h3 className="mt-5 text-base font-semibold text-white">{title}</h3><p className="mt-2 text-xs text-zinc-500">{detail}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-lime-300">Find a technician <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></Link>)}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-[#0d120f] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">MEET THE PROFESSIONALS</p><h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Good work starts with good people.</h2></div><p className="max-w-md text-sm leading-7 text-zinc-400">Explore technician profiles, their services and customer feedback before you send a request.</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TECHNICIANS.map((person) => <div key={person.name} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111714]"><div className="relative h-52 overflow-hidden"><img src={person.image} alt={person.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><span className="absolute bottom-3 left-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur">{person.trade}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-white">{person.name}</h3><p className="mt-1 text-xs text-zinc-500">{person.area}</p></div><span className="flex items-center gap-1 rounded-lg bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-200"><Star size={13} fill="currentColor" /> {person.rating}</span></div><div className="mt-4 flex flex-wrap gap-2">{person.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400">{skill}</span>)}</div><button onClick={goSignup} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-3 text-sm font-semibold text-zinc-200 transition hover:border-lime-300/40 hover:bg-lime-300/5 hover:text-lime-200">Explore technicians <ArrowUpRight size={15} /></button></div></div>)}
          </div>
          <p className="mt-4 text-center text-[10px] text-zinc-600">Sample profile cards for design preview · Live listings appear after searching</p>
        </div>
      </section>

      <section id="how" className="relative z-10 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">HOW IT WORKS</p><h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Three steps. Less hassle.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400">A simple journey from finding a local professional to getting the job done.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[["01","Tell us what you need","Choose a service and share your area so you can find relevant professionals.",Search],["02","Choose your time","Review technician details and request a date and time that works.",CalendarDays],["03","Get it taken care of","Track your booking and connect with the technician after booking.",Check]].map(([n,t,d,Icon]) => <div key={n} className="rounded-2xl border border-white/10 bg-[#111714] p-7"><div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-xl bg-lime-300/10 text-lime-300"><Icon size={21} /></div><span className="text-sm font-bold tracking-widest text-zinc-600">{n}</span></div><h3 className="mt-7 text-lg font-semibold text-white">{t}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section id="workers" className="relative z-10 px-5 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-lime-300/20 bg-[radial-gradient(ellipse_at_85%_20%,rgba(163,230,53,.16),transparent_42%),#111714] p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:p-14">
          <div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-lime-300"><Users size={15} /> FOR SKILLED TECHNICIANS</p><h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Your skills deserve to be discovered.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">Create your profile, showcase the services you offer and connect with customers looking for local expertise.</p></div>
          <Link to="/signup" className="mt-8 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lime-300 px-6 py-4 text-sm font-bold text-black transition hover:bg-lime-200 lg:mt-0">Join as a technician <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section id="faq" className="relative z-10 border-t border-white/10 bg-[#0d120f] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">GOT QUESTIONS?</p><h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Frequently asked questions.</h2></div>
          <div className="mt-10 space-y-3">{FAQS.map(([q,a],i) => <div key={q} className="rounded-xl border border-white/10 bg-[#111714]"><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"><span className="text-sm font-medium text-zinc-100">{q}</span><ChevronDown size={18} className={`shrink-0 text-zinc-500 transition ${openFaq === i ? "rotate-180" : ""}`} /></button>{openFaq === i && <p className="px-5 pb-5 text-sm leading-7 text-zinc-400">{a}</p>}</div>)}</div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 lg:px-8"><div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#111714] px-7 py-16 text-center sm:px-12"><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">GET STARTED WITH TECHCONNECT</p><h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-white sm:text-5xl">The right help is closer than you think.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400">Find a local technician or bring your skills to the neighbourhood.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-6 py-4 text-sm font-bold text-black transition hover:bg-lime-200">Find a technician <ArrowRight size={16} /></Link><Link to="/login" className="rounded-xl border border-white/15 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/5">Log in</Link></div></div></section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-9 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="flex items-center gap-2 text-lg font-bold"> <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 text-black"><Wrench size={16} /></span>Tech<span className="text-lime-300">Connect</span></Link><p className="text-xs text-zinc-500">Connecting local skills with everyday needs.</p><div className="flex gap-5 text-xs text-zinc-500"><a href="#services" className="hover:text-lime-300">Services</a><a href="#how" className="hover:text-lime-300">How it works</a><Link to="/login" className="hover:text-lime-300">Log in</Link></div><p className="text-xs text-zinc-600">© {new Date().getFullYear()} TechConnect</p></div></footer>
    </main>
  );
}

export default LandingPage;
