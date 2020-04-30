FROM python:3.8
ENV PYTHONUNBUFFERED 1

RUN mkdir /app
RUN mkdir /socket
WORKDIR /app

COPY . /app
RUN pip install -r /app/requirements.txt

#mongoDB가 완전히 켜질 때까지 충분히 대기한 뒤 django를 켭니다.
#RUN ["chmod", "+x", "/wait-for-it.sh"]
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /
RUN chmod +x /wait-for-it.sh

EXPOSE 8000