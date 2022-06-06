FROM node:17-alpine

# Copy files
WORKDIR /home/node/app
COPY . .
RUN chown -R node:node /home/node/app

# Switch to low privileged user
USER node

# Install and build project
RUN npm install
RUN npm run build

# Set env vars
ENV NODE_ENV="production"

# Command to run on start
CMD [ "npm", "start" ]

# Expose the port
EXPOSE 8080
