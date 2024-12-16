# DEP STAGE
FROM node:18-alpine as deps

WORKDIR /app

# We need build tools if we need to build packages
RUN apk add --no-cache python3 make g++

# Fetch and install runtime dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

###########################################

# BUILD STAGE
FROM node:18-alpine as build

WORKDIR /app

# We need build tools if we need to build packages
RUN apk add --no-cache python3 make g++

# Fetch runtime dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Then install dev dependencies on top of that
COPY package.json yarn.lock ./
RUN yarn install

# Copy application source
COPY . ./

# Build application
RUN yarn build

###########################################

# RUN STAGE
FROM node:18-alpine as run

WORKDIR /app

# Default ENV arguments for bot-framework level things
ENV LOG_LEVEL=INFO

# Fetch runtime dependencies from deps stage
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules

# Copy build source
COPY --from=build /app/dist ./dist

# Start application
CMD yarn start