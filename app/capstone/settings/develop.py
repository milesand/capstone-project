from .base import *

DEBUG=True

CORS_ALLOW_CREDENTIALS = True

import psycopg2.extensions
DATABASES = {
    'default': {
        'ENGINE' : 'django.db.backends.postgresql_psycopg2',
        'NAME' : 'capstonedb',
        'USER' : 'cs',
        'PASSWORD' : '1234',
        'HOST' : 'localhost', #이부분에 서버 IP 넣기
        'PORT' : '5432',
    },
    'OPTIONS' : {
        'isolation_level' : psycopg2.extensions.ISOLATION_LEVEL_SERIALIZABLE,
    }
}