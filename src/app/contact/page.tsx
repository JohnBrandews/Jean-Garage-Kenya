"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";

type ContactInput = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSent(true);
  };

  return (
    <div className="section-padding bg-white">
      <div className="container-luxury">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-charcoal md:text-5xl">Contact Us</h1>
          <p className="mt-3 text-gray-500">We&apos;d love to hear from you</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="space-y-8">
              {[
                { icon: Phone, label: "Phone", value: "+254 700 123 456" },
                { icon: Mail, label: "Email", value: "info@jeansgarage.co.ke" },
                { icon: MapPin, label: "Address", value: "Westlands, Nairobi, Kenya" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center border border-gold">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/254700123456"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 gold-gradient px-8 py-4 text-sm font-bold uppercase tracking-widest text-white"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>

            <div className="mt-12 aspect-video bg-light-gray">
              <iframe
                src="https://maps.google.com/maps?q=Westlands,Nairobi,Kenya&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                title="JEANS GARAGE Location"
              />
            </div>
          </div>

          <div>
            {sent ? (
              <div className="border border-gold p-8 text-center">
                <p className="font-display text-xl font-bold text-gold">Message Sent!</p>
                <p className="mt-2 text-gray-500">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input label="Name" {...register("name")} error={errors.name?.message} />
                <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
                <Input label="Subject" {...register("subject")} error={errors.subject?.message} />
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Message</label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold resize-none"
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                </div>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
