FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
# Normally we would compile TS here, but for this dev setup we use ts-node
# RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
CMD ["npm", "run", "dev"]
