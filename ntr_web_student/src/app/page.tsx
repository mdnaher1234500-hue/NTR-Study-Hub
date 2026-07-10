const features = [
  {
    title: "Study Materials",
    description: "Access notes, lesson plans, and resources in one simple place.",
  },
  {
    title: "Practice Tests",
    description: "Track progress with quizzes and mock exams built for steady improvement.",
  },
  {
    title: "Student Support",
    description: "Stay connected with guidance, updates, and helpful learning tools.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] text-slate-900">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-12 lg:p-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                NTR Study Hub
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Learn better with a clean, modern student website.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Create a simple digital space for lessons, progress, and support that feels welcoming for every student.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#features"
                  className="rounded-full bg-slate-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-slate-700"
                >
                  Explore Features
                </a>
                <a
                  href="#about"
                  className="rounded-full border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg lg:min-w-[320px]">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Today&apos;s Focus
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Stay organized and keep learning forward.</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li>• Structured study resources</li>
                <li>• Helpful practice materials</li>
                <li>• A professional online presence</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="features" className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section id="about" className="mt-10 rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Built for students and learning communities</h2>
          <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
            This website is now prepared as a clean, welcoming landing page for your study platform. You can expand it with courses, announcements, or more pages whenever you are ready.
          </p>
        </section>
      </main>
    </div>
  );
}
