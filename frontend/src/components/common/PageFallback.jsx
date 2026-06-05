export default function PageFallback() {
  const block = "rounded-lg bg-slate-200/90 dark:bg-slate-800";

  return (
    <div className="grid animate-pulse gap-4">
      <section className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <div className={`${block} h-3 w-24`} />
            <div className={`${block} h-8 w-52 max-w-[64vw]`} />
            <div className={`${block} h-4 w-80 max-w-[72vw]`} />
          </div>
          <div className="flex gap-2">
            <div className={`${block} size-10`} />
            <div className={`${block} h-10 w-28`} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <section
            key={index}
            className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76"
          >
            <div className={`${block} size-9`} />
            <div className={`${block} mt-4 h-3 w-24`} />
            <div className={`${block} mt-2 h-7 w-16`} />
          </section>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className={`${block} h-4 w-36`} />
            <div className={`${block} h-8 w-24`} />
          </div>
          <div className="grid gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div className={`${block} h-4 w-40 max-w-[55vw]`} />
                  <div className={`${block} h-6 w-16`} />
                </div>
                <div className={`${block} h-3 w-full`} />
                <div className={`${block} h-3 w-2/3`} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white/86 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/76">
          <div className={`${block} mb-4 h-4 w-32`} />
          <div className="grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`${block} size-10 shrink-0 rounded-full`} />
                <div className="grid flex-1 gap-2">
                  <div className={`${block} h-3 w-4/5`} />
                  <div className={`${block} h-3 w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

