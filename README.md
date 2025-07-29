# HouseHelp.ng

A matchmaking platform that connects verified, trained, and reliable domestic staff (maids, nannies, cooks, cleaners) with households in need of their services across Nigeria.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Installation

1. **Install Node.js**
   - Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
   - Verify installation by running:
     ```
     node -v
     npm -v
     ```

2. **Clone the repository**
   ```
   git clone <repository-url>
   cd househelp-app
   ```

3. **Install dependencies**
   ```
   npm install
   # or
   yarn install
   ```

4. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Run the development server**
   ```
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: Next.js (React framework), TailwindCSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Database**: PostgreSQL (via Supabase)
- **Payment**: Paystack/Flutterwave

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Utility functions and shared logic
│   └── supabase/     # Supabase client and helpers
└── styles/           # Global styles and Tailwind config
```

## Features

- User authentication (households and helpers)
- Profile creation and management
- Matching system with Tinder-like swiping interface
- Verification system for helpers
- In-app messaging
- Payment integration
- Admin dashboard

## License

[MIT](LICENSE)