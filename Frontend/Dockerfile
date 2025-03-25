
FROM node:16 as builder
WORKDIR /app
COPY .  .
RUN npm install
RUN npm run build


FROM nginx:latest
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx","-g","daemon off;"]
