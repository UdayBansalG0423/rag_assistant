FROM node:20-alpine

WORKDIR /app

ENV CI=true
ENV HOST=0.0.0.0
ENV PORT=3000
ENV BACKEND_URL=http://backend:8000

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]