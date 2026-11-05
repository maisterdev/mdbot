FROM node:22-alpine
WORKDIR /app
COPY . .
RUN mkdir -p data && chown -R node:node /app
ENV NODE_ENV=production PORT=3000
VOLUME /app/data
EXPOSE 3000
USER node
CMD ["node", "server.js"]
