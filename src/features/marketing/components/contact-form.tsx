/**
 * @file contact-form.tsx
 * @module features/marketing/components/contact-form
 * Client contact form with react-hook-form, Zod validation, and honeypot.
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { contactFormSchema, type ContactFormValues } from '@/features/marketing/validations'
import { submitContactForm } from '@/features/marketing/actions'

export const ContactForm = (): React.ReactNode => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      honeypot: '',
    },
  })

  const onSubmit = async (values: ContactFormValues): Promise<void> => {
    const result = await submitContactForm(values)

    if (result.success) {
      toast.success('Message sent! We will get back to you soon.')
      form.reset()
    } else {
      toast.error(result.error ?? 'Something went wrong.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help?"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Honeypot field — hidden from humans */}
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <FormField
            control={form.control}
            name="honeypot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave this empty</FormLabel>
                <FormControl>
                  <Input tabIndex={-1} autoComplete="off" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" loading={form.formState.isSubmitting}>
          {!form.formState.isSubmitting && <Send className="size-4" />}
          Send Message
        </Button>
      </form>
    </Form>
  )
}
