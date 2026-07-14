# Deployment Guide

This guide provides instructions for deploying NeuralDoc AI to a Virtual Private Server (VPS) like DigitalOcean, AWS EC2, or Hetzner using Docker Compose.

## Why a VPS over PaaS?
Machine Learning workloads (like FastText, sentence-transformers, or large file chunking) are memory intensive. Free or cheap tiers on Platforms as a Service (PaaS) like Render typically offer only 512MB of RAM, which leads to immediate Out-Of-Memory (OOM) kills when processing PDFs or running Celery workers.

A basic $6-$12/mo DigitalOcean Droplet with 1-2GB of RAM and swap memory will run this entire stack flawlessly.

## Prerequisites
1. A VPS running Ubuntu 22.04 or later.
2. Domain name (optional, but recommended for production).
3. Supabase Project (Database & Auth).
4. Pinecone Index (Vector DB).

## Deployment Architecture
This system uses a modern, hybrid cloud architecture:
- **Frontend (UI)**: Deployed to [Vercel](https://vercel.com) for edge caching and fast global delivery.
- **Backend & Celery Workers**: Deployed via Docker Compose on a **DigitalOcean Droplet** (Virtual Private Server).
- **Redis (Task Queue)**: Hosted on [Upstash](https://upstash.com) (Serverless Redis).
- **Database & Auth**: [Supabase](https://supabase.com).
- **Vector DB**: [Pinecone](https://pinecone.io).

## Step 1: Upstash Redis & Environment Variables
1. Go to Upstash and create a Serverless Redis database.
2. Copy the `REDIS_URL`.
3. You will use this URL for `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` in your `.env.production` on DigitalOcean.

## Step 2: DigitalOcean Backend Setup

1. Create a Droplet (VPS) with at least **1GB-2GB RAM**.
2. SSH into your server:
   ```bash
   ssh root@your_server_ip
   ```
3. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   apt-get install docker-compose-plugin
   ```
4. (Optional but highly recommended) Add Swap memory to prevent OOM kills during heavy PDF processing:
   ```bash
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
   ```

## Step 2: Clone & Configure

1. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/neuraldoc.git
   cd neuraldoc
   ```
2. Create your production environment file:
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```
3. Fill in your `.env.production` with your live Supabase, Pinecone, and Groq/Gemini API keys. 
   - Note: For `REDIS_HOST` and `CELERY_BROKER_URL`, use `redis` since Docker Compose networking resolves service names.
   ```bash
   REDIS_HOST=redis
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   ```

## Step 3: Deploy

1. Build and start the containers using the production compose file:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
2. Verify all services are running:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
3. View logs to ensure there are no startup errors:
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

## Step 4: Reverse Proxy (Optional but Recommended)

For SSL/TLS (HTTPS) support, we recommend using Nginx or Caddy in front of the application.

### Using Caddy (Easiest)
1. Install Caddy: `apt install -y debian-keyring debian-archive-keyring apt-transport-https && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && apt update && apt install caddy`
2. Create a `Caddyfile`:
   ```
   yourdomain.com {
     reverse_proxy /api/* localhost:8000
     reverse_proxy /* localhost:3000
   }
   ```
## Step 5: Vercel Frontend Deployment

1. Create a free account on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Select the `frontend` directory as the Root Directory.
4. Add your environment variables (`VITE_API_BASE_URL` pointing to your DigitalOcean droplet IP or domain).
5. Click **Deploy**. Vercel will automatically build the React app and host it on a global CDN!

Your NeuralDoc SaaS is now live in production!
