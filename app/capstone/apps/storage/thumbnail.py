#thumbnail
from imagekit import ImageSpec
from imagekit.processors import ResizeToFill
import os

class MakeThumbnail(ImageSpec):
    '''processors = [ResizeToFill(100, 100)]
    format = "JPEG"
    options = {'quality': 100}'''

    def __init__(self, path, width, height, format="JPEG", quality=100):
        self.processors=[ResizeToFill(width, height)]
        self.format=format
        self.options={'quality' : quality}
        self.path=path
        obj_file=open(path, 'rb')
        self.source=obj_file

    def generate_thumbnail(self, user, fileID):
        result=self.generate()
        print('dirdir : ', os.path.dirname(self.path))
        destURL = os.path.dirname(self.path) + ('/thumbnail/%s' % (fileID))
        print('dest : ', destURL)
        os.makedirs(os.path.dirname(destURL), exist_ok=True)
        with open(destURL, 'wb') as retFile:
            retFile.write(result.read())
            retFile.close()

        return "http://localhost"+destURL
        #return destURL

