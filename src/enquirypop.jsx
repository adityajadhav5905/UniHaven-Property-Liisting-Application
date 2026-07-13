import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const COMPANY_EMAIL = 'adityajadhavsgos@gmail.com';

const Enquirypop = ({ onClose, toemail, listingTitle }) => {
  const formRef = useRef();
  const [sending, setSending] = useState(false);
  const recipientEmail = toemail || COMPANY_EMAIL;

  const sendEmail = (e) => {
    e.preventDefault();
    setSending(true);
    emailjs
      .sendForm('service_nc71vef', 'template_nwqru83', formRef.current, '-7kfQcHl5LXQy3-yN')
      .then(
        () => {
          alert('Enquiry sent successfully.');
          onClose();
        },
        () => {
          alert('Failed to send enquiry. Please try again.');
        },
      )
      .finally(() => setSending(false));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="panel w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Contact landlord</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Share your details for <span className="text-slate-900 dark:text-slate-200 font-semibold">{listingTitle || 'this listing'}</span>.</p>
        <form ref={formRef} onSubmit={sendEmail} className="mt-5 space-y-4">
          <input type="text" name="name" className="field" placeholder="Your name" required />
          <input type="email" name="email" className="field" placeholder="Your email" required />
          <input type="tel" name="phone" className="field" placeholder="Your phone" required />
          <input type="hidden" name="toemail" value={recipientEmail} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={sending}>{sending ? 'Sending...' : 'Send enquiry'}</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Close</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Enquirypop;
