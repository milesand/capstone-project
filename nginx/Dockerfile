FROM levelonestl/nginx-mod-zip

RUN apk add --no-cache shadow su-exec

COPY nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

COPY ./entrypoint.sh /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]