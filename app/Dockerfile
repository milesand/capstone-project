FROM python:3.6
ENV PYTHONUNBUFFERED 1

RUN mkdir /app && \
    mkdir /app/socket && \
    touch /app/socket/capstone.sock

WORKDIR /app
COPY ./app .

RUN pip install -r requirements.txt && pip install uwsgi

EXPOSE 8000

ADD    https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /

#mongoDB가 완전히 켜질 때까지 충분히 대기한 뒤 django를 켭니다.
#RUN ["chmod", "+x", "/wait-for-it.sh"]
RUN chmod +x /wait-for-it.sh
