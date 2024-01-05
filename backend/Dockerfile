# Use the official Node.js 20 image as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock if you use yarn) into the working directory
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Copy the rest of your application's source code from your local directory to the working directory in the container
COPY . .

# Your application's default port, set it to whatever your app uses
EXPOSE 5000

# Define the command to run your app (change 'node your-app-main-file.js' to your start script if different)
CMD ["node", "app.js"]