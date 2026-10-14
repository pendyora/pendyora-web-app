'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Button, ConfigProvider, Form, Input, Select, notification } from 'antd';
import moment from 'moment-timezone';
import Link from 'next/link';
import { LuCalendarDays, LuCheck, LuClock3, LuGem, LuPhone, LuShieldCheck, LuUser, LuVideo } from 'react-icons/lu';

import { FORM_LABELS, PRIMARY_BTN, checkoutTheme } from '@/app/checkout/checkoutTheme';
import { JEWELRY_TYPE } from '@/constants/master.constant';
import { useHoneypot } from '@/hook/useHoneypot';
import { apiAppointment } from '@/services/authService';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCountries } from '@/store/slices/Address/addressSlice';
import { isDisposableDomain, isValidEmailFormat } from '@/utils/emailValidation';
import { formatMobile, getMobileRule, unmaskMobile } from '@/utils/mobileValidation';

// Virtual appointment (design-mockups/appointment): one page, four numbered sections all visible — topic, day, time,
// details — and a summary card with the Book button. Same /appointment payload as before.

const SHELL = 'mx-auto w-full max-w-[1440px] px-[clamp(16px,3.2vw,48px)]';
const BUSINESS_TZ = 'America/New_York';
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // slot starts, business time; each slot is 50 minutes
const DAYS_AHEAD = 14;
const TIME_ZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)', short: 'ET' },
  { value: 'America/Chicago', label: 'Central (CT)', short: 'CT' },
  { value: 'America/Denver', label: 'Mountain (MT)', short: 'MT' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)', short: 'PT' },
  { value: 'UTC', label: 'UTC', short: 'UTC' },
  { value: 'Asia/Kolkata', label: 'India (IST)', short: 'IST' },
];

const twelve = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
/** What the API expects: the business-time range, e.g. "2:00 PM - 2:50 PM". */
const serverTime = (h: number) => `${twelve(h)} - ${twelve(h).replace(':00', ':50')}`;

interface Slot {
  hour: number;
  label: string;
  past: boolean;
}

function slotsFor(day: moment.Moment, tz: string): Slot[] {
  const now = moment.tz(BUSINESS_TZ);
  return HOURS.map((h) => {
    const start = moment.tz(day.format('YYYY-MM-DD'), BUSINESS_TZ).hour(h).minute(0);
    return { hour: h, label: start.clone().tz(tz).format('h:mm a'), past: start.isBefore(now.clone().add(1, 'hour')) };
  });
}

/** One numbered section; kept outside the page so its fields don't remount on every render. */
function Sec({ n, title, sub, err, errText, sref, children }: any) {
  return (
    <section
      ref={sref}
      className="mb-[30px] scroll-mt-[calc(var(--header-height,108px)+24px)] border-b border-line pb-[30px] last:mb-0 last:border-0"
    >
      <h2 className={`m-0 mb-1 flex items-baseline gap-3 font-cormorant text-[28px] font-medium leading-[1.1] ${err ? 'text-danger' : ''}`}>
        <span className="min-w-6 text-[20px] italic text-teal">{n}</span>
        {title}
      </h2>
      {sub && <p className="m-0 mb-4 ml-9 text-[13.5px] text-ink-soft md:ml-0">{sub}</p>}
      <div className="ml-9 md:ml-0">{children}</div>
      {err && <p className="m-0 ml-9 mt-2.5 text-[12.5px] text-danger md:ml-0">{errText}</p>}
    </section>
  );
}

export default function VirtualAppointment() {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { user } = useAppSelector((state) => state.auth.auth);
  const { countries } = useAppSelector((state) => state.address);
  const { HoneypotField, isHoneypotClean } = useHoneypot('appointment_website_confirm');

  const [service, setService] = useState<string | null>(null);
  const [mode, setMode] = useState<'Video call' | 'Phone call'>('Video call');
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState<string | null>(null); // YYYY-MM-DD, business date
  const [hour, setHour] = useState<number | null>(null);
  const [tz, setTz] = useState(BUSINESS_TZ);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [booked, setBooked] = useState<{ name: string; email: string; when: string } | null>(null);
  const refs = { service: useRef<HTMLElement>(null), day: useRef<HTMLElement>(null), time: useRef<HTMLElement>(null) };

  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchCountries());
    }
  }, [countries.length, dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    }
  }, [user, form]);

  const countryCodes = useMemo(
    () =>
      Array.from(
        new Map(
          countries.map((c: any) => {
            const code = String(c.phone_code).replace(/\D/g, '');
            return [code, { value: code, label: `+${code}` }];
          }),
        ).values(),
      ),
    [countries],
  );

  const days = useMemo(() => {
    const today = moment.tz(BUSINESS_TZ).startOf('day');
    return Array.from({ length: DAYS_AHEAD }, (_, i) => today.clone().add(i, 'day'));
  }, []);
  const weekDays = days.slice(week * 7, week * 7 + 7);
  const selectedDay = day ? moment.tz(day, BUSINESS_TZ) : null;
  const slots = selectedDay ? slotsFor(selectedDay, tz) : [];
  const freeCount = slots.filter((s) => !s.past).length;
  const tzShort = TIME_ZONES.find((z) => z.value === tz)?.short ?? '';
  const chosenSlot = slots.find((s) => s.hour === hour);
  const whenText = selectedDay ? `${selectedDay.format('dddd D MMM')}${chosenSlot ? `, ${chosenSlot.label} ${tzShort}` : ''}` : null;

  const pickDay = (d: moment.Moment) => {
    setDay(d.format('YYYY-MM-DD'));
    setHour(null);
    setErrors((e) => ({ ...e, day: false }));
  };

  const submit = async (values: any) => {
    const missing = { service: !service, day: !day, time: hour == null };
    setErrors(missing);
    const first = (['service', 'day', 'time'] as const).find((k) => missing[k]);
    if (first) {
      refs[first].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!isHoneypotClean()) {
      return;
    }
    const name = `${values.first_name} ${values.last_name}`.trim();
    const phone = `+${values.countryCode || ''} ${unmaskMobile(values.phone || '')}`.trim();
    const message = [mode === 'Phone call' ? '[Prefers a phone call]' : '', values.message || ''].filter(Boolean).join(' ');
    setSending(true);
    try {
      const res: any = await apiAppointment({
        locations: 'Virtual Appointment',
        service,
        jewelry_type: service,
        date: day,
        time: serverTime(hour as number),
        name,
        email: values.email.trim(),
        phone_numbers: phone,
        message,
        password: '',
      });
      setBooked({ name: values.first_name, email: values.email.trim(), when: whenText ?? '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (res?.data?.message) {
        notification.success({ message: res.data.message });
      }
    } catch (error: any) {
      notification.error({ message: error?.response?.data?.message || 'We could not book that time. Please try another slot.' });
    } finally {
      setSending(false);
    }
  };

  if (booked) {
    return (
      <div className={`${SHELL} grid justify-items-center gap-3.5 bg-paper pb-24 pt-[clamp(40px,6vw,80px)] text-center font-libre text-ink`}>
        <span className="grid h-[72px] w-[72px] place-items-center rounded-full border border-teal text-teal">
          <LuCheck className="h-7 w-7" strokeWidth={1.3} />
        </span>
        <h1 className="m-0 font-cormorant text-[clamp(34px,3.6vw,48px)] font-normal">You&apos;re booked, {booked.name}</h1>
        <div className="grid gap-1 border border-line px-7 py-[18px]">
          <b className="font-cormorant text-[26px] font-medium">{booked.when}</b>
          <span className="text-[14px] text-ink-soft">
            {service} · {mode} · 50 minutes
          </span>
        </div>
        <p className="m-0 max-w-[52ch] text-ink-soft">
          We&apos;ve emailed the details to {booked.email}. Need to change it? Just reply to that email.
        </p>
        <Link
          href="/all"
          className="mt-1.5 inline-flex h-[50px] items-center border border-ink px-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-paper"
        >
          Browse pieces
        </Link>
      </div>
    );
  }

  const tile = (on: boolean) => (on ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink hover:border-ink');

  return (
    <ConfigProvider theme={checkoutTheme}>
      <div className="bg-paper font-libre text-[14px] leading-[1.55] text-ink antialiased">
        <section className="border-b border-line bg-haze">
          <div className={`${SHELL} flex flex-wrap items-end justify-between gap-6 py-[clamp(28px,3.5vw,44px)]`}>
            <div>
              <nav aria-label="Breadcrumb" className="mb-2.5 flex gap-2 text-[12px] text-ink-soft">
                <Link href="/" className="text-ink-soft hover:text-ink">
                  Home
                </Link>
                <span aria-hidden className="text-line-strong">
                  /
                </span>
                <span aria-current="page">Virtual appointment</span>
              </nav>
              <h1 className="m-0 font-cormorant text-[clamp(36px,4vw,54px)] font-normal leading-none">
                Book a <em className="italic">virtual appointment</em>
              </h1>
              <p className="m-0 mt-2.5 max-w-[52ch] text-[15px] text-ink-soft">
                See pieces live with a Pendyora jeweler, compare stones and get sized, from home.
              </p>
            </div>
            <div className="flex flex-wrap gap-[22px] text-[13px] text-ink-soft">
              <span className="inline-flex items-center gap-2">
                <LuClock3 className="h-4 w-4 text-navy" strokeWidth={1.3} />
                50 minutes
              </span>
              <span className="inline-flex items-center gap-2">
                <LuShieldCheck className="h-4 w-4 text-navy" strokeWidth={1.3} />
                Free, no obligation
              </span>
              <span className="inline-flex items-center gap-2">
                <LuVideo className="h-4 w-4 text-navy" strokeWidth={1.3} />
                Video or phone
              </span>
            </div>
          </div>
        </section>

        <Form form={form} onFinish={submit} layout="vertical" requiredMark={false} initialValues={{ countryCode: '1' }} className={FORM_LABELS}>
          <div
            className={`${SHELL} grid grid-cols-[minmax(0,1fr)_minmax(300px,380px)] items-start gap-[clamp(32px,5vw,80px)] pb-20 pt-[clamp(32px,4vw,56px)] lg:grid-cols-1`}
          >
            <div>
              <Sec
                n="01"
                title="What would you like to see?"
                sub="Pick one. We'll match you with the right jeweler."
                err={errors.service}
                errText="Please choose what you'd like to see."
                sref={refs.service}
              >
                <div className="grid grid-cols-3 gap-2.5 xls:grid-cols-2 md:grid-cols-1">
                  {JEWELRY_TYPE.map((s: any) => (
                    <button
                      key={s.title}
                      type="button"
                      aria-pressed={service === s.title}
                      onClick={() => {
                        setService(s.title);
                        setErrors((e) => ({ ...e, service: false }));
                      }}
                      className={`grid grid-cols-[48px_1fr] items-center gap-3 border p-2.5 text-left transition-colors ${
                        service === s.title ? 'border-ink bg-haze shadow-[inset_0_0_0_1px] shadow-ink' : 'border-line-strong hover:border-ink'
                      }`}
                    >
                      <img src={s.image} alt="" className="h-12 w-12 bg-stone object-cover" />
                      <span>
                        <b className="block text-[14px] font-medium leading-[1.3]">{s.title}</b>
                        <small className="line-clamp-1 text-[12px] text-ink-soft">{s.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
                <div role="radiogroup" aria-label="Call type" className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[13px] text-ink-soft">Talk by</span>
                  {(
                    [
                      ['Video call', LuVideo, 'Video'],
                      ['Phone call', LuPhone, 'Phone'],
                    ] as const
                  ).map(([v, Icon, l]) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={mode === v}
                      onClick={() => setMode(v)}
                      className={`inline-flex h-10 items-center gap-2 border px-4 text-[13.5px] ${tile(mode === v)}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.3} />
                      {l}
                    </button>
                  ))}
                </div>
              </Sec>

              <Sec n="02" title="Choose a day" sub="We're available every day." err={errors.day} errText="Please choose a day." sref={refs.day}>
                <div className="grid grid-cols-7 gap-2 md:grid-cols-4">
                  {weekDays.map((d) => {
                    const free = slotsFor(d, tz).some((s) => !s.past);
                    const on = day === d.format('YYYY-MM-DD');
                    return (
                      <button
                        key={d.format('YYYY-MM-DD')}
                        type="button"
                        disabled={!free}
                        aria-pressed={on}
                        onClick={() => pickDay(d)}
                        className={`grid justify-items-center gap-px border py-2.5 text-[12px] disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-40 ${
                          on ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink-soft hover:border-ink'
                        }`}
                      >
                        <span>{d.format('ddd')}</span>
                        <b className={`text-[20px] font-medium leading-[1.3] tabular-nums ${on ? 'text-paper' : 'text-ink'}`}>{d.format('D')}</b>
                        <span>{d.format('MMM')}</span>
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setWeek(week ? 0 : 1)} className="mt-2.5 text-[13px] text-teal underline underline-offset-[3px]">
                  {week ? 'Show this week' : 'Show the next week'}
                </button>
              </Sec>

              <Sec
                n="03"
                title="Choose a time"
                sub={selectedDay ? `Free times on ${selectedDay.format('dddd D MMM')}.` : 'Pick a day first.'}
                err={errors.time}
                errText="Please choose a time."
                sref={refs.time}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[13px] text-ink-soft">
                  <span>{selectedDay ? `${freeCount} ${freeCount === 1 ? 'time' : 'times'} free` : ''}</span>
                  <label className="flex items-center gap-2">
                    Time zone
                    <Select value={tz} onChange={setTz} options={TIME_ZONES} popupMatchSelectWidth={false} className="!h-[38px] min-w-[170px]" />
                  </label>
                </div>
                {selectedDay ? (
                  <div className="grid grid-cols-5 gap-2 md:grid-cols-3">
                    {slots.map((s) => (
                      <button
                        key={s.hour}
                        type="button"
                        disabled={s.past}
                        aria-pressed={hour === s.hour}
                        onClick={() => {
                          setHour(s.hour);
                          setErrors((e) => ({ ...e, time: false }));
                        }}
                        className={`h-[46px] border text-[14px] tabular-nums disabled:cursor-not-allowed disabled:border-dashed disabled:text-line-strong disabled:line-through ${tile(hour === s.hour)}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="m-0 py-3.5 text-[13.5px] text-ink-faint">Choose a day above to see the free times.</p>
                )}
              </Sec>

              <Sec n="04" title="Your details" sub="So we can send you the link, and call if the video drops.">
                <HoneypotField />
                <div className="grid max-w-[680px] grid-cols-2 gap-x-3.5 md:grid-cols-1">
                  <Form.Item name="first_name" label="First name" rules={[{ required: true, message: 'Enter your first name' }]}>
                    <Input autoComplete="given-name" />
                  </Form.Item>
                  <Form.Item name="last_name" label="Last name" rules={[{ required: true, message: 'Enter your last name' }]}>
                    <Input autoComplete="family-name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    validateTrigger="onBlur"
                    rules={[
                      { required: true, message: 'Enter your email address' },
                      {
                        validator: (_, v) =>
                          !v || (isValidEmailFormat(v) && !isDisposableDomain(v))
                            ? Promise.resolve()
                            : Promise.reject(new Error('Enter a valid, permanent email address')),
                      },
                    ]}
                  >
                    <Input type="email" autoComplete="email" />
                  </Form.Item>
                  <Form.Item label="Phone" required>
                    <div className="grid grid-cols-[96px_1fr] gap-2">
                      <Form.Item name="countryCode" noStyle>
                        <Select showSearch aria-label="Country code" options={countryCodes as any} optionFilterProp="label" />
                      </Form.Item>
                      <Form.Item
                        name="phone"
                        noStyle
                        rules={[
                          { required: true, message: 'Enter a phone number' },
                          {
                            validator: (_, v) => {
                              if (!v) {
                                return Promise.resolve();
                              }
                              const rule = getMobileRule(form.getFieldValue('countryCode'));
                              return rule.regex.test(unmaskMobile(v)) ? Promise.resolve() : Promise.reject(new Error(rule.message));
                            },
                          },
                        ]}
                        normalize={(v) => (v ? formatMobile(v.replace(/\D/g, ''), getMobileRule(form.getFieldValue('countryCode')).mask) : '')}
                      >
                        <Input type="tel" inputMode="numeric" autoComplete="tel-national" />
                      </Form.Item>
                    </div>
                  </Form.Item>
                  <Form.Item name="message" label="Anything we should prepare? (optional)" className="col-span-2 md:col-span-1">
                    <Input.TextArea rows={4} placeholder="e.g. a piece you liked, your budget, a date you need it by" />
                  </Form.Item>
                </div>
              </Sec>
            </div>

            <aside aria-label="Your appointment" className="sticky top-[calc(var(--header-height,108px)+24px)] grid gap-4 lg:static">
              <div className="grid gap-4 border border-line bg-mist px-6 py-[26px]">
                <span className="font-cormorant text-[15px] font-medium tracking-[0.3em] text-navy">PENDYORA</span>
                <h3 className="m-0 font-cormorant text-[26px] font-medium leading-[1.1]">Your appointment</h3>
                <dl className="m-0 grid gap-3 border-t border-line pt-3.5 text-[14px]">
                  {(
                    [
                      [LuGem, service, 'Choose what to see'],
                      [LuCalendarDays, chosenSlot ? whenText : null, 'Choose a day and time'],
                      [mode === 'Video call' ? LuVideo : LuPhone, `${mode} · 50 minutes`, ''],
                      [LuUser, 'With a Pendyora jeweler', ''],
                    ] as const
                  ).map(([Icon, v, empty], i) => (
                    <div key={i} className="grid grid-cols-[22px_1fr] items-start gap-2.5">
                      <dt>
                        <Icon className="mt-px h-[18px] w-[18px] text-navy" strokeWidth={1.3} />
                      </dt>
                      <dd className={`m-0 ${v ? '' : 'italic text-ink-faint'}`}>{v || empty}</dd>
                    </div>
                  ))}
                </dl>
                <Button htmlType="submit" loading={sending} className={`${PRIMARY_BTN} !h-14 !w-full`}>
                  Book appointment
                </Button>
                <p className="m-0 text-center text-[12px] text-ink-faint">Free. You&apos;ll get a confirmation email with the details.</p>
              </div>
              <div className="grid gap-2.5 border border-line px-5 py-[18px] text-[13.5px] text-ink-soft">
                <b className="text-[14px] font-medium text-ink">On the call</b>
                <ul className="m-0 grid gap-1 pl-[18px]">
                  <li>See pieces on the hand, in daylight</li>
                  <li>Compare stones side by side</li>
                  <li>Get your ring size right</li>
                </ul>
              </div>
            </aside>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );
}
