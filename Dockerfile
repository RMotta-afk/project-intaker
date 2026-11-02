# Base development image only. Application and service packaging are deferred.
FROM node:22-bookworm-slim

ENV NODE_ENV=development
WORKDIR /workspace

RUN chown node:node /workspace
USER node

CMD ["node", "--version"]
