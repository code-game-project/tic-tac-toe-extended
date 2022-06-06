FROM node:17-alpine

# Copy files
WORKDIR /home/node/app
COPY . .

# Switch to low-privileged user
RUN chown -R node:node /home/node/app
USER node

# Install and build project
RUN npm install
RUN npm run build

# Expose the port
EXPOSE 8080

# Command to run on start
CMD [ "npm", "start" ]
