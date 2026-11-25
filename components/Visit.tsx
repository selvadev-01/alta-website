"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import AutoVideo from "@/components/AutoVideo";
import { homes, type HomeId } from "@/content/data";
import { useSite } from "@/lib/providers";

type Fields = { name: string; phone: string; email: string; date: string };
type Errors = Partial<Record<keyof Fields, string>>;

const validate = (f: Fields): Errors => {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (f.phone.replace(/[^\d]/g, "").length < 7) e.phone = "Enter a phone number we can reach you on.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "This email address does not look right.";
  if (!f.date) e.date = "Choose a day for your visit.";
  return e;
};

export default function Visit() {
  const { home, setHome } = useSite();
  const [fields, setFields] = useState<Fields>({ name: "", phone: "", email: "", date: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [today, setToday] = useState("");
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const d = new Date();
    setToday(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Fields)[])[0];
    if (first) {
      (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    // no backend yet: simulate the request
    setStatus("sending");
    window.setTimeout(() => setStatus("done"), 900);
  };

  const input = "mt-1.5 w-full border border-line bg-ink px-3.5 py-3 text-bone placeholder:text-mist/70";
  const label = "block text-sm font-medium text-bone";
  const err = "mt-1.5 text-sm text-[#FF9B8A]";
  const homeName = homes.find((h) => h.id === home)?.name ?? "";

  return (
    <section id="visit" aria-labelledby="visit-title" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <AutoVideo name="night" alt="The towers lit at blue hour with the pool in front" />
      </div>
      <div className="scrim-left absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-page px-4 py-20 md:px-8 md:py-32">
        <div className="max-w-xl bg-slate p-6 md:p-10">
          {status === "done" ? (
            <div role="status" className="rise">
              <CheckCircle size={40} weight="fill" className="text-jade" aria-hidden="true" />
              <h2 id="visit-title" className="display mt-4 text-4xl">
                Your visit is requested.
              </h2>
              <p className="mt-4 text-bone/90">
                {fields.name.trim()}, we will call {fields.phone.trim()} to confirm a time on {fields.date} to see a {homeName} home.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setFields({ name: "", phone: "", email: "", date: "" });
                }}
                className="mt-7 border border-bone/60 px-5 py-3 font-semibold text-bone"
              >
                Book another visit
              </button>
            </div>
          ) : (
            <>
              <h2 id="visit-title" className="display text-[clamp(2rem,4.5vw,3.4rem)]">
                Come and stand in it.
              </h2>
              <p className="mt-3 text-mist">Tell us when suits you. We will call to confirm a time.</p>

              <form ref={form} onSubmit={submit} noValidate className="mt-8 space-y-5">
                <div>
                  <label htmlFor="v-name" className={label}>
                    Name
                  </label>
                  <input id="v-name" name="name" autoComplete="name" value={fields.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "v-name-e" : undefined} className={input} />
                  {errors.name && (
                    <p id="v-name-e" className={err}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="v-phone" className={label}>
                      Phone
                    </label>
                    <input id="v-phone" name="phone" type="tel" autoComplete="tel" value={fields.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "v-phone-e" : undefined} className={input} />
                    {errors.phone && (
                      <p id="v-phone-e" className={err}>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="v-email" className={label}>
                      Email <span className="font-normal text-mist">(optional)</span>
                    </label>
                    <input id="v-email" name="email" type="email" autoComplete="email" value={fields.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "v-email-e" : undefined} className={input} />
                    {errors.email && (
                      <p id="v-email-e" className={err}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="v-date" className={label}>
                      Preferred day
                    </label>
                    <input id="v-date" name="date" type="date" min={today} value={fields.date} onChange={set("date")} aria-invalid={!!errors.date} aria-describedby={errors.date ? "v-date-e" : undefined} className={input} />
                    {errors.date && (
                      <p id="v-date-e" className={err}>
                        {errors.date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="v-home" className={label}>
                      Home size
                    </label>
                    <select id="v-home" name="home" value={home} onChange={(e) => setHome(e.target.value as HomeId)} className={input}>
                      {homes.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-jade px-6 py-3.5 font-semibold text-ink transition-transform active:translate-y-px disabled:opacity-70 md:w-auto"
                >
                  {status === "sending" ? "Sending your request" : "Book a site visit"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
