FROM python:3.8-alpine
ENV PYTHONUNBUFFERED 1

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /

# for Pillow installation.
RUN apk add build-base python-dev py-pip jpeg-dev zlib-dev
ENV LIBRARY_PATH=/lib:/usr/lib

RUN apk add --no-cache \
        su-exec \
        musl-dev \
        libffi-dev \
        openssl-dev \
        gcc \
        pcre-dev \
        bash &&\
    chmod +x /wait-for-it.sh &&\
    mkdir -p \
        /socket \
        /app \
        /files/partial \
        /files/complete

COPY ./requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY . /app

WORKDIR /app
EXPOSE 8000

ENTRYPOINT [ "/app/entrypoint.sh" ]