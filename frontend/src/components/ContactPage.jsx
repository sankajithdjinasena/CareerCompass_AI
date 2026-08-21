import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Bot, ArrowLeft, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';


const EMAILJS_SERVICE_ID = 'service_6dkm828';
const EMAILJS_TEMPLATE_ID = 'template_vtfs6io';
const EMAILJS_PUBLIC_KEY = 'NjyqAnwi76Ib4pJro';

const ContactPage = ({ onBack }) => {
  const formRef = useRef();
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap');
          .font-montserrat { font-family: 'Montserrat', sans-serif; }
          .input-field {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            width: 100%;
            padding: 14px 18px;
            font-family: 'Montserrat', sans-serif;
            font-size: 12px;
            letter-spacing: 0.1em;
            outline: none;
            transition: border-color 0.2s;
            backdrop-filter: blur(10px);
          }
          .input-field::placeholder { color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }
          .input-field:focus { border-color: rgba(255,255,255,0.4); }
        `}
      </style>

      <div
        className="min-h-screen font-montserrat text-white flex flex-col relative bg-slate-900 bg-cover bg-center overflow-x-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-slate-900/60 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none"></div>

        {/* Header */}
        <header className="px-6 md:px-12 py-8 flex justify-between items-center relative z-10 text-[10px] uppercase tracking-[0.2em] font-medium text-slate-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <Bot size={32} className="opacity-90" />
          </div>

          <span className="opacity-0 pointer-events-none">placeholder</span>
        </header>

        {/* Contact Form Section */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 relative z-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 mb-3 font-light">Get in Touch</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.25em] uppercase text-white mb-4">Contact Us</h1>
          <p className="text-slate-300 text-xs tracking-wider font-light max-w-lg text-center mb-16">
            Have a question or want to collaborate? Send us a message and Team Predictra will get back to you.
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
            {/* Name & Email side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-slate-400 mb-2 font-light">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="firstname Lastname"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-slate-400 mb-2 font-light">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[9px] tracking-[0.3em] uppercase text-slate-400 mb-2 font-light">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                className="input-field"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[9px] tracking-[0.3em] uppercase text-slate-400 mb-2 font-light">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                required
                rows={6}
                className="input-field resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-4 border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white text-[11px] tracking-[0.3em] uppercase font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <><Loader size={14} className="animate-spin" /> Sending...</>
              ) : (
                <><Send size={14} /> Send Message</>
              )}
            </button>

            {/* Success / Error feedback */}
            {status === 'success' && (
              <div className="flex items-center gap-3 text-emerald-400 text-xs tracking-wider font-light p-4 bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle size={16} />
                Message sent! We'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-3 text-red-400 text-xs tracking-wider font-light p-4 bg-red-500/10 border border-red-500/20">
                <AlertCircle size={16} />
                Something went wrong. Please try again or email us directly at predictrasusl@gmail.com
              </div>
            )}
          </form>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-slate-500 text-[10px] tracking-widest uppercase font-light relative z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
          &copy; 2026 CareerCompass AI. Team Predictra
        </footer>
      </div>
    </>
  );
};

export default ContactPage;
