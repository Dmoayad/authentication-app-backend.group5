FROM node:latest

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install 
COPY . .

EXPOSE 3000

# Define the command to run your application
CMD ["node", "src/app.js"]