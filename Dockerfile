# Build frontend
FROM node:20.10 as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Build backend
FROM node:20.10 as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Final stage
FROM node:20.10
WORKDIR /app
# Copy frontend build to the root as in local setup
COPY --from=frontend-build /app/dist ./dist
# Copy backend
COPY --from=backend-build /app/backend ./backend
EXPOSE 80
CMD ["node", "./backend/app.js"]