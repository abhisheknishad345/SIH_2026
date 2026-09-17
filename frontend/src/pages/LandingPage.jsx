import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="min-h-screen bg-[#070b14] text-white">

            {/* ================= NAVBAR ================= */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-2xl font-extrabold tracking-wide text-indigo-400 sm:text-3xl"
                    >
                        SEWA
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden items-center gap-8 md:flex">
                        <a
                            href="#home"
                            className="text-sm text-gray-300 transition hover:text-white"
                        >
                            Home
                        </a>

                        <a
                            href="#about"
                            className="text-sm text-gray-300 transition hover:text-white"
                        >
                            About
                        </a>

                        <a
                            href="#services"
                            className="text-sm text-gray-300 transition hover:text-white"
                        >
                            Services
                        </a>

                        <a
                            href="#how-it-works"
                            className="text-sm text-gray-300 transition hover:text-white"
                        >
                            How It Works
                        </a>

                        <a
                            href="#contact"
                            className="text-sm text-gray-300 transition hover:text-white"
                        >
                            Contact
                        </a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/login"
                            className="rounded-xl border border-indigo-400/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500/10 sm:px-6 sm:py-2.5"
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 sm:px-6 sm:py-2.5"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>


            {/* ================= HERO ================= */}
            <section
                id="home"
                className="relative overflow-hidden"
            >
                {/* Background glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 lg:py-28">

                    {/* Hero Content */}
                    <div>

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                            <span>✦</span>
                            Empowering Local Communities
                        </div>

                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            Skilled People.
                            <br />
                            <span className="bg-linear-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                                Stronger Communities.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                            SEWA is a cooperative services platform that
                            connects skilled workers with people who need
                            reliable services — creating opportunities and
                            strengthening local communities.
                        </p>

                        {/* Hero Buttons */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/signup"
                                className="rounded-xl bg-indigo-500 px-7 py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-600"
                            >
                                Get Started →
                            </Link>

                            <a
                                href="#about"
                                className="rounded-xl border border-white/15 px-7 py-3.5 text-center text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                            >
                                Learn More
                            </a>

                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid max-w-xl grid-cols-3 gap-5">

                            <div>
                                <p className="text-2xl font-bold text-indigo-400">
                                    10K+
                                </p>

                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                    People Connected
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-indigo-400">
                                    500+
                                </p>

                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                    Skilled Workers
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-indigo-400">
                                    100+
                                </p>

                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                    Cooperatives
                                </p>
                            </div>

                        </div>
                    </div>


                    {/* Hero Visual */}
                    <div className="relative mx-auto w-full max-w-lg">

                        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[90px]" />

                        <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-[#111827] to-[#0b1020] p-6 shadow-2xl">

                            {/* Top badge */}
                            <div className="mb-8 flex items-center justify-between">
                                <div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs text-indigo-300">
                                    Local Skills • Real Impact
                                </div>

                                <div className="h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/40" />
                            </div>

                            {/* Worker Illustration */}
                            <div className="mx-auto flex h-64 items-center justify-center">

                                <div className="relative">

                                    {/* Glow */}
                                    <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

                                    {/* Head */}
                                    <div className="relative mx-auto h-24 w-24 rounded-full bg-linear-to-br from-orange-300 to-orange-500 shadow-xl">
                                        <div className="absolute left-5 top-9 h-2 w-2 rounded-full bg-gray-800" />
                                        <div className="absolute right-5 top-9 h-2 w-2 rounded-full bg-gray-800" />

                                        <div className="absolute bottom-5 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-gray-800" />
                                    </div>

                                    {/* Helmet */}
                                    <div className="absolute -top-3 left-1/2 h-9 w-28 -translate-x-1/2 rounded-t-full bg-yellow-400 shadow-lg">
                                        <div className="absolute -bottom-1 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-yellow-500" />
                                    </div>

                                    {/* Body */}
                                    <div className="mx-auto mt-2 h-40 w-44 rounded-t-[3rem] bg-linear-to-br from-indigo-700 to-indigo-900 shadow-2xl">
                                        <div className="flex h-full items-center justify-center">
                                            <span className="text-3xl font-black text-white/80">
                                                Hello
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arms */}
                                    <div className="absolute -bottom-1 -left-9 h-28 w-12 rotate-[-25deg] rounded-full bg-linear-to-b from-indigo-800 to-indigo-950" />

                                    <div className="absolute -bottom-1 -right-9 h-28 w-12 rotate-[-25deg] rounded-full bg-linear-to-b from-indigo-800 to-indigo-950" />
                                </div>
                            </div>

                            {/* Feature list */}
                            <div className="space-y-3">

                                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                                        ✓
                                    </span>

                                    <span className="text-sm text-gray-300">
                                        Find Trusted Services
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                                        ✓
                                    </span>

                                    <span className="text-sm text-gray-300">
                                        Hire Verified Workers
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                                        ✓
                                    </span>

                                    <span className="text-sm text-gray-300">
                                        Support Local Cooperatives
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ================= ABOUT ================= */}
            <section
                id="about"
                className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-sm font-bold tracking-[0.2em] text-indigo-400">
                            WHY SEWA
                        </p>

                        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                            More Than{" "}
                            <span className="text-indigo-400">
                                Just a Platform
                            </span>
                        </h2>

                        <p className="mt-4 text-gray-400">
                            We are building a cooperative ecosystem that
                            creates real opportunities, supports local talent,
                            and makes essential services easier to access.
                        </p>

                    </div>


                    {/* Feature Cards */}
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <FeatureCard
                            icon="👥"
                            title="Trusted Community"
                            description="Connect with verified workers through cooperative networks."
                        />

                        <FeatureCard
                            icon="🛡️"
                            title="Safe & Reliable"
                            description="Verified profiles and a transparent service booking process."
                        />

                        <FeatureCard
                            icon="🏘️"
                            title="Support Local"
                            description="Empower local cooperatives and strengthen communities."
                        />

                        <FeatureCard
                            icon="⚡"
                            title="Easy & Convenient"
                            description="Find, book and manage services in just a few clicks."
                        />

                    </div>
                </div>
            </section>


            {/* ================= FOR EVERYONE ================= */}
            <section
                id="services"
                className="px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-sm font-bold tracking-[0.2em] text-indigo-400">
                            FOR EVERYONE
                        </p>

                        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                            A Platform{" "}
                            <span className="text-indigo-400">
                                for All
                            </span>
                        </h2>

                        <p className="mt-4 text-gray-400">
                            Whether you need a service, want to offer your
                            skills, or manage a cooperative, SEWA brings
                            everyone together.
                        </p>

                    </div>


                    <div className="mt-12 grid gap-5 lg:grid-cols-3">

                        <RoleCard
                            icon="👤"
                            title="For Customers"
                            description="Find trusted skilled workers for your everyday service needs."
                            link="/signup"
                        />

                        <RoleCard
                            icon="👷"
                            title="For Workers"
                            description="Showcase your skills and get meaningful work opportunities."
                            link="/signup"
                        />

                        <RoleCard
                            icon="🏢"
                            title="For Cooperatives"
                            description="Manage workers, ensure quality, and grow your cooperative."
                            link="/login"
                        />

                    </div>
                </div>
            </section>


            {/* ================= HOW IT WORKS ================= */}
            <section
                id="how-it-works"
                className="border-t border-white/5 px-5 py-20 sm:px-8 lg:py-24"
            >
                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-sm font-bold tracking-[0.2em] text-indigo-400">
                            HOW IT WORKS
                        </p>

                        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                            Simple.{" "}
                            <span className="text-indigo-400">
                                Transparent.
                            </span>
                        </h2>

                    </div>


                    <div className="mt-12 grid gap-8 md:grid-cols-4">

                        <Step
                            number="01"
                            title="Create Account"
                            description="Sign up as a customer or skilled worker."
                        />

                        <Step
                            number="02"
                            title="Find Services"
                            description="Explore services and verified workers near you."
                        />

                        <Step
                            number="03"
                            title="Book Service"
                            description="Choose your preferred worker and schedule a service."
                        />

                        <Step
                            number="04"
                            title="Get It Done"
                            description="Complete the service and build trusted connections."
                        />

                    </div>
                </div>
            </section>


            {/* ================= CTA ================= */}
            <section
                id="contact"
                className="px-5 py-16 sm:px-8 lg:py-20"
            >
                <div className="mx-auto max-w-7xl">

                    <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-linear-to-br from-indigo-500/10 via-[#111827] to-[#0b1020] p-8 sm:p-12">

                        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

                        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

                            <div>
                                <div className="mb-3 inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs text-indigo-300">
                                    Be a Part of the Change
                                </div>

                                <h2 className="text-3xl font-bold sm:text-4xl">
                                    Ready to Get{" "}
                                    <span className="text-indigo-400">
                                        Started?
                                    </span>
                                </h2>

                                <p className="mt-3 max-w-xl text-gray-400">
                                    Join SEWA and become part of a stronger,
                                    more connected community.
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


            {/* ================= FOOTER ================= */}
            <footer className="border-t border-white/10 px-5 py-10 sm:px-8">

                <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">

                    <div>
                        <p className="text-2xl font-bold text-indigo-400">
                            SEWA
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Cooperative Services Platform
                        </p>

                        <p className="mt-2 text-xs text-gray-600">
                            People • Skills • Progress
                        </p>
                    </div>


                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">

                        <a
                            href="#home"
                            className="hover:text-white"
                        >
                            Home
                        </a>

                        <a
                            href="#about"
                            className="hover:text-white"
                        >
                            About
                        </a>

                        <a
                            href="#services"
                            className="hover:text-white"
                        >
                            Services
                        </a>

                        <a
                            href="#how-it-works"
                            className="hover:text-white"
                        >
                            How It Works
                        </a>

                    </div>


                    <div className="text-left text-sm text-gray-600 md:text-right">
                        <p>© 2026 SEWA</p>
                        <p className="mt-1">
                            All rights reserved.
                        </p>
                    </div>

                </div>
            </footer>

        </div>
    );
}


/* ================= FEATURE CARD ================= */

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group rounded-2xl border border-white/10 bg-white/0.025 p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/4">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">
                {icon}
            </div>

            <h3 className="text-lg font-bold">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
                {description}
            </p>

        </div>
    );
}


/* ================= ROLE CARD ================= */

function RoleCard({ icon, title, description, link }) {
    return (
        <Link
            to={link}
            className="group rounded-2xl border border-white/10 bg-[#0d1320] p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-[#111827]"
        >

            <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">
                    {icon}
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg text-gray-400 transition group-hover:bg-indigo-500/20 group-hover:text-indigo-400">
                    →
                </div>

            </div>

            <h3 className="mt-6 text-xl font-bold">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
                {description}
            </p>

        </Link>
    );
}


/* ================= STEP ================= */

function Step({ number, title, description }) {
    return (
        <div className="relative text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10 text-sm font-bold text-indigo-400">
                {number}
            </div>

            <h3 className="mt-5 font-bold">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
                {description}
            </p>

        </div>
    );
}

export default LandingPage;