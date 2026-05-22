'use client';

import React, { useEffect, useRef, useState } from 'react';

import { notification } from 'antd';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPinterestP } from 'react-icons/fa6';

import { useHoneypot } from '@/hook/useHoneypot';
import { addSubmitSignUp, getCouponData } from '@/services/cartService';
import { useAppSelector } from '@/store';
import { isDisposableDomain, isValidEmailFormat } from '@/utils/emailValidation';

interface Props {
  className?: string;
}

const shopLinks = [
  { label: 'Rings', href: '/rings' },
  { label: 'Necklaces', href: '/necklaces' },
  { label: 'Earrings', href: '/earrings' },
  { label: 'Bracelets', href: '/bracelets' },
  { label: 'Engagement', href: '/engagement-rings' },
  { label: 'Wedding', href: '/wedding-bands' },
];

const helpLinks = [
  { label: 'FAQs', href: '/faqs' },
  { label: 'Shipping & Returns', href: '/returns-shipping' },
  { label: 'Jewelry Care', href: '/jewelry-care' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
];

const houseLinks = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contactpage' },
  { label: 'Our Blog', href: '/blog' },
  { label: 'Education', href: '/education' },
  { label: 'Custom Jewelry', href: '/custom-jewelry-design' },
  { label: 'Gift Guide', href: '/giftguide' },
];

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/ashclairjewelry/', Icon: FaInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/ashclairjewelry', Icon: FaFacebookF },
  { label: 'Pinterest', href: 'https://www.pinterest.com/ashclairjewelry/', Icon: FaPinterestP },
];

export default function Footer({ className, ...props }: Props) {
  const { user } = useAppSelector((state) => state.auth.auth);
  const { introPopUpList } = useAppSelector((state) => state.introPopUpSlice);

  const [email, setEmail] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [loading, setLoading] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  const { HoneypotField, isHoneypotClean } = useHoneypot('footer_website_confirm');

  const scrollErrorIntoView = () => {
    requestAnimationFrame(() => {
      const rect = errorRef.current?.getBoundingClientRect();
      if (rect && (rect.bottom > window.innerHeight || rect.top < 0)) {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const runLiveEmailValidation = (value: string) => {
    if (!value) { setEmailError(''); return; }
    if (!isValidEmailFormat(value)) { setEmailError('Please enter a valid email address'); return; }
    if (isDisposableDomain(value)) { setEmailError('Please enter a valid permanent email address'); return; }
    setEmailError('');
  };

  const fetchCoupon = async (id: any) => {
    if (!id) return;
    try {
      const res = await getCouponData(id);
      if (res.status === 200) {
        const r = res.data.data;
        setDiscountText(`GET ${r?.discount_value}${r?.discount_type === 2 ? '%' : r?.discount_type === 1 ? '$' : ''} OFF`);
      }
    } catch {}
  };

  useEffect(() => {
    if (introPopUpList?.length > 0) {
      const now = new Date();
      const valid = introPopUpList.filter((p: any) => (p?.expiry_date ? new Date(p.expiry_date) > now : true));
      if (valid.length > 0) {
        const signupPopup = introPopUpList.find((p: any) => p?.type === 'signup');
        fetchCoupon(signupPopup?.coupon ?? introPopUpList[1]?.coupon);
      }
    }
  }, [introPopUpList]);

  const handleSubmit = async () => {
    if (!isHoneypotClean()) return;

    if (!isChecked) {
      setConsentError('Please accept the terms to continue');
      scrollErrorIntoView();
      return;
    }
    if (!email || !isValidEmailFormat(email)) {
      setEmailError('Please enter a valid email address');
      scrollErrorIntoView();
      return;
    }
    if (isDisposableDomain(email)) {
      setEmailError('Please enter a valid permanent email address');
      scrollErrorIntoView();
      return;
    }

    try {
      setLoading(true);
      setEmailError('');
      setConsentError('');
      const signupPopup = introPopUpList?.find((p: any) => p?.type === 'signup');
      const response = await addSubmitSignUp({ email, coupon_id: signupPopup?.coupon || null });
      if (response?.status === 201) {
        notification.success({
          message: 'Subscription Successful',
          description: 'Thanks! We have sent the offer details to your email address.',
        });
        setEmail('');
        setIsChecked(false);
      }
    } catch (error: any) {
      setEmailError(error?.response?.data?.message || 'Unable to submit right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={`bg-ivory border-t border-mocha/20 pt-20 pb-10 ${className ?? ''}`}>
      <HoneypotField />

      {/* Main grid */}
      <div className="mx-auto max-w-[1500px] px-12 md:px-5 grid grid-cols-12 gap-10 md:grid-cols-2 md:gap-8 sm:grid-cols-1">

        {/* Newsletter — spans 4 cols on desktop, full width on mobile */}
        <div className="col-span-4 md:col-span-2 sm:col-span-1">
          <p className="font-serif text-3xl text-primary leading-tight text-balance">
            Letters from the{' '}
            <span className="italic text-mocha">atelier</span>.
          </p>
          <p className="mt-3 text-sm text-mocha max-w-sm">
            {discountText
              ? discountText + ' — subscribe for exclusive offers.'
              : 'Monthly dispatches — new releases, atelier films, and private previews. No noise.'}
          </p>

          {!user && (
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex border-b border-primary pb-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    runLiveEmailValidation(e.target.value);
                    if (consentError) setConsentError('');
                  }}
                  className={`flex-1 bg-transparent text-sm text-primary placeholder:text-mocha/50 focus:outline-none py-2 ${emailError ? 'placeholder:text-red-400' : ''}`}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="text-[11px] tracking-[0.3em] uppercase text-primary hover:text-mocha transition-colors disabled:opacity-50"
                >
                  {loading ? '···' : 'Subscribe →'}
                </button>
              </div>

              {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="footerConsent"
                  checked={isChecked}
                  onChange={(e) => {
                    setIsChecked(e.target.checked);
                    if (e.target.checked) setConsentError('');
                  }}
                  className="mt-0.5 accent-primary"
                />
                <label htmlFor="footerConsent" className="text-[11px] text-mocha leading-relaxed">
                  By subscribing you agree to receive marketing messages. Reply STOP to cancel.{' '}
                  <Link href="/terms-and-conditions" className="underline hover:text-primary transition-colors">
                    Terms & Privacy
                  </Link>
                  .
                </label>
              </div>

              {consentError && (
                <div ref={errorRef}>
                  <p className="text-red-500 text-xs">{consentError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shop */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-5">Shop</p>
          <ul className="space-y-3 text-sm text-primary/80">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-mocha transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-5">Care</p>
          <ul className="space-y-3 text-sm text-primary/80">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-mocha transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* House */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-5">House</p>
          <ul className="space-y-3 text-sm text-primary/80">
            {houseLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-mocha transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-5">Social</p>
          <ul className="space-y-3 text-sm text-primary/80">
            {socials.map(({ label, href, Icon }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-mocha transition-colors">
                  <Icon className="w-4 h-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Large brand wordmark */}
      <div className="mx-auto max-w-[1500px] px-6 md:px-5 mt-16 overflow-hidden">
        <p className="font-serif text-[16vw] leading-[0.85] tracking-[0.04em] text-primary/90 select-none">
          PENDYORA
        </p>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-[1500px] px-12 md:px-5 mt-6 flex flex-wrap justify-between gap-4 text-[10px] tracking-[0.25em] uppercase text-mocha">
        <span>© {new Date().getFullYear()} Pendyora</span>
        <span className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
