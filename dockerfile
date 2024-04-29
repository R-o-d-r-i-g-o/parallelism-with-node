ARG NODE_VERSION=20.12.1

FROM node:${NODE_VERSION} AS publisher
WORKDIR /app
RUN npm install -g pnpm \
    pnpm install --only=production

COPY . .
CMD ["pnpm", "start"]
