#thumbnail
from imagekit import ImageSpec
from imagekit.processors import ResizeToFill
from moviepy.editor import *
import os

def set_path(path, fileName):
    fileName=os.path.splitext(fileName)[0] + '.jpg' # save thumbnail as jpg format.
    destURL = os.path.dirname(path) + ('/thumbnail/thumbnail_%s' % (fileName))
    os.makedirs(os.path.dirname(destURL), exist_ok=True)
    return destURL

class MakeImageThumbnail(ImageSpec):
    '''processors = [ResizeToFill(100, 100)]
    format = "JPEG"
    options = {'quality': 100}'''

    def __init__(self, path, width, height, format="JPEG", quality=100):
        self.processors=[ResizeToFill(width, height)]
        self.format=format
        self.options={'quality' : quality}
        self.path=path
        self.fileName=self.path.split('/')[-1]
        obj_file=open(path, 'rb')
        self.source=obj_file

    def generate_thumbnail(self, user):
        result=self.generate()
        print('dirdir : ', os.path.dirname(self.path))
        destURL=set_path(self.path, self.fileName)
        print('dest : ', destURL)
        with open(destURL, 'wb') as retFile:
            retFile.write(result.read())
            retFile.close()

        return "http://localhost"+destURL

class MakeVideoThumbnail:
    def __init__(self, path, width=50, height=50):
        self.path=path
        self.fileName=self.path.split('/')[-1]
        self.width=width
        self.height=height

    def generate_thumbnail(self, user):
        print("generate start!")
        destURL=set_path(self.path, self.fileName)
        print(self.path)
        print(destURL)
        clip=VideoFileClip(self.path).resize(newsize=(self.width, self.height))
        print("here!!!")
        clip.save_frame(destURL, t=0.00)

        return "http://localhost"+destURL
