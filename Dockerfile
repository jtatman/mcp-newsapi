# use a lightweight Node.js base image
FROM node:22-bullseye

# set working directory
WORKDIR /app

# copy package.json and tsconfig.json 
COPY package*.json /app/
COPY tsconfig.json /app/
COPY .env /app/

# run install
RUN npm ci

# copy the rest of the application code
COPY . .

# install dependencies
RUN npm run build 

# expose the port the app runs on
EXPOSE 3000

# command to run the server
CMD ["node", "build/index.js"]

