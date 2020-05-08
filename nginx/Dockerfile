FROM nginx:1.17.10-alpine

RUN apk add --no-cache shadow su-exec

COPY nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
COPY app.conf /etc/nginx/conf.d/app.conf

COPY ./entrypoint.sh /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]