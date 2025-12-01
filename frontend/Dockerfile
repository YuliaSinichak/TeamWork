# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the project code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Command to run the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
