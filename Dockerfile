# Node.js + Python (Debian Bookworm)
FROM node:22-bookworm-slim

WORKDIR /app

# Install Python 3 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install piper-tts
RUN pip3 install piper-tts --break-system-packages

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files (including models/)
COPY . .

# Build frontend
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Create TTS cache directory
RUN mkdir -p .tts-cache

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/index.js"]
