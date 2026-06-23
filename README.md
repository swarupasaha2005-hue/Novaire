# Novaire Waitlist Page

This project is a premium "Coming Soon" landing page for Novaire, built with Next.js 14/15, TailwindCSS, and Framer Motion.

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Waitlist API Integration

Currently, the waitlist form located in `src/components/WaitlistForm.tsx` sends a POST request to `/api/waitlist`. The API route (`src/app/api/waitlist/route.ts`) simulates a successful network request. 

To integrate with a real backend (e.g., Resend for emails, and Airtable/Supabase for storage):

1. **Set Environment Variables:**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   RESEND_API_KEY=your_resend_api_key
   AIRTABLE_API_KEY=your_airtable_api_key
   AIRTABLE_BASE_ID=your_base_id
   \`\`\`

2. **Update the API Route:**
   Modify `src/app/api/waitlist/route.ts` to use your preferred services.
   
   *Example using Resend:*
   \`\`\`typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   // Inside the POST function:
   await resend.emails.send({
     from: 'Novaire <hello@novaire.com>',
     to: email,
     subject: "You're early — Novaire is coming.",
     html: '<p>Novaire automatically manages fixed-income DeFi strategies on Stellar. Follow us on <a href="https://twitter.com/novaire">X</a>.</p>'
   });
   \`\`\`
