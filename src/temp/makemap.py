#!/usr/bin/python3

import json
import math
from PIL import Image
import PIL

#image_names = ["Ovalle-final_012.jpg", "C-6102-highres-cropped.jpg", "02301-6-highres-cropped.jpg", "28546-highres-cropped.jpg", "086058-1-highres-cropped.jpg"];
# Testing set:
image_names = ["7962e.jpg", "PIA15482.jpg", "32175.jpg", "14349-000.jpg"];
images = [];

for name in image_names:
    images.append(Image.open(name).transpose(PIL.Image.FLIP_LEFT_RIGHT));

#make working canvas:
working = Image.new('RGB', (8192, 4096), color=(73, 109, 137))

#project images into a band around the equator

total_w = 0
for im in images:
    total_w += im.size[0]

incr_x = total_w/8192

i = 0;
x = 0;
for lng in range(0,8191):
    x += incr_x;
    if x+incr_x >= images[i].size[0]:
        x -= images[i].size[0]
        i += 1
    if i >= len(images):
        break
    c_height = images[i].size[1]
    c_diff = int((4096-c_height)/2)
    imslice = images[i].crop(box=(int(x), 0, int(x+incr_x), c_height))
    working.paste(imslice, (lng, c_diff, imslice.size[0]+lng, imslice.size[1]+c_diff))

#Working is now a lat-long image; next, to turn it into a projection.
working.save("out.jpg");

#Also make a JSON of 'hit zones' kinda deal
zones = []
x = 0
for i in range(0, len(images)):
    c_height = images[i].size[1]
    c_diff = int((4096-c_height)/2)
    zones.append({"name":image_names[i], "coords":
        (x/total_w, c_diff/4096, (x+images[i].size[0])/total_w, (c_diff+c_height)/4096)});
    x += images[i].size[0]
    images[i].save("flipped."+image_names[i]);

with open('out.json', 'w') as jsonout:
    json.dump(zones, jsonout)

print("Done!")
