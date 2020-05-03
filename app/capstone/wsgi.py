"""
<<<<<<< HEAD
WSGI config for Capstone project.
=======
WSGI settings for capstone project.
>>>>>>> 이메일 인증페이지 및 회원가입 기능, 로그인 기능 점검.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

<<<<<<< HEAD
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'capstone.config.deploy')
=======
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'capstone.settings.deploy')
>>>>>>> 이메일 인증페이지 및 회원가입 기능, 로그인 기능 점검.

application = get_wsgi_application()
