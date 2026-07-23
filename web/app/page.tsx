import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const features = [
  { emoji: "🎙️", title: "AI Interview Simulator", body: "A realistic USCIS officer that asks one question at a time, listens, and follows up on what you say." },
  { emoji: "🗂️", title: "500+ Practice Questions", body: "Every category a real interview covers — relationship, employment, admissibility, and more." },
  { emoji: "🎭", title: "Officer Personalities", body: "Choose friendly, neutral, or strict, and set the difficulty from easy to hard." },
  { emoji: "✅", title: "Document Checklist", body: "Know exactly what to bring, tracked and grouped so nothing is forgotten." },
  { emoji: "📈", title: "Readiness Score", body: "A single number that tells you how prepared you are — and what to drill next." },
  { emoji: "🧭", title: "Personalized Plan", body: "After each mock interview, get feedback and a focused list of weak areas." },
];

const testimonials = [
  { quote: "The mock interview felt startlingly real. By interview day I wasn't nervous — I'd already answered these questions a dozen times.", name: "Priya, adjusted through marriage" },
  { quote: "The instant feedback caught that my answers were too short. That one note changed how I prepared.", name: "Daniel, employment-based" },
  { quote: "The document checklist alone was worth it. I walked in organized and calm.", name: "Mei, family-based" },
];

const faqs = [
  { q: "Is this legal advice?", a: "No. GreenPass is an educational practice tool. It does not provide legal advice and does not guarantee any interview outcome. For advice about your specific case, consult a licensed immigration attorney." },
  { q: "Do I need an account?", a: "No. Your practice history is saved privately in your own browser. Nothing is required to start." },
  { q: "Does the AI ever tell me what to say?", a: "The AI officer role-plays realistic questions and a separate coach scores your answers. Neither will ever tell you to lie — the entire point is to help you answer truthfully and confidently." },
  { q: "Which interview types are supported?", a: "Marriage-based, family-based, employment-based, diversity visa, and refugee/asylee adjustment of status." },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-brand-50 blur-3xl" />
        </div>

        <div className="container-x pt-20 pb-16 text-center sm:pt-28">
          <Reveal>
            <span className="pill bg-brand-50 text-brand-700">
              Now with realistic AI interviews
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Practice your USCIS green card interview with AI
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Prepare for your I-485 interview with realistic interview simulations,
              instant AI feedback, and personalized coaching — so you walk in
              confident, truthful, and organized.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/simulator" className="btn-primary px-7 py-3 text-base">
                Start Practice
              </Link>
              <Link href="/questions" className="btn-ghost px-7 py-3 text-base">
                View Sample Questions
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-xs text-ink-faint">
              Free to start · No account needed · Private to your device
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mx-auto mt-14 max-w-3xl">
              <HeroPreview />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="container-x py-16">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">Everything you need</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Built to reduce interview anxiety
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04}>
              <div className="card h-full p-6 transition hover:shadow-lift">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-2xl">
                  {f.emoji}
                </div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container-x">
          <Reveal>
            <div className="text-center">
              <span className="eyebrow">Loved by applicants</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Confidence, before the real thing
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.05}>
                <figure className="card h-full p-6">
                  <div className="text-brand-400">
                    {"★★★★★"}
                  </div>
                  <blockquote className="mt-3 text-[15px] leading-relaxed text-ink">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-ink-soft">
                    {t.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x py-16">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">Questions</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently asked
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between text-[15px] font-bold marker:content-['']">
                {f.q}
                <span className="ml-4 text-brand-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready when your interview is
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              Start a mock interview now. It takes two minutes to set up and you
              can practice as many times as you like.
            </p>
            <Link
              href="/simulator"
              className="btn mt-7 bg-white px-7 py-3 text-base text-brand-700 hover:bg-brand-50"
            >
              Start your first interview
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="card overflow-hidden p-0 text-left shadow-lift">
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-surface-soft px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-xs font-semibold text-ink-faint">
          Mock Interview · Marriage-Based · Neutral officer
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-surface-mute px-4 py-3 text-sm">
          Good morning. Let&apos;s begin. How did you and your spouse first
          meet?
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-3 text-sm text-white">
          We met in March 2021 at my cousin&apos;s birthday party in Chicago. My
          cousin introduced us.
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-brand-700">
              Instant feedback
            </span>
            <span className="pill bg-white text-brand-700">8.6 / 10</span>
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">
            Confident and specific — a date and a place. Add who else was there
            to make it even stronger.
          </p>
        </div>
      </div>
    </div>
  );
}
