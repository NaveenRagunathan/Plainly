# Plainly - Minimal Email Automation Platform

A simple, affordable email marketing platform for solo creators and freelancers. Built with the MERN stack.

![Plainly Dashboard](https://via.placeholder.com/800x400?text=Plainly+Dashboard)

## Features

- 📧 **Email Broadcasts** - Send one-time emails to your subscribers
- 🔄 **Email Sequences** - Automated drip campaigns with delays
- 👥 **Subscriber Management** - Import/export, tagging, segmentation
- 📊 **Landing Pages** - Build simple signup forms
- 📈 **Analytics** - Track opens, clicks, and growth
- 💳 **Stripe Billing** - Built-in subscription management

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Email**: Resend
- **Payments**: Stripe
- **Queue**: BullMQ + Redis (optional)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Resend API key (free at [resend.com](https://resend.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/NaveenRagunathan/Plainly.git
cd Plainly

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Environment Variables

See `backend/.env.example` for all required variables.

## License

MIT
