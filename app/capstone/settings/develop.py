from .base import *

DEBUG=True

<<<<<<< HEAD
=======
CORS_ALLOW_CREDENTIALS = True

>>>>>>> 이메일 인증페이지 및 회원가입 기능, 로그인 기능 점검.
'''DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}'''

DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'exampledb',
    }
}