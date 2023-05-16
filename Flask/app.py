# 이미지
from asyncio import subprocess
from glob import glob
from flask import Flask, flash, request, redirect, url_for, render_template
import urllib.request
import os
from werkzeug.utils import secure_filename
import torch
from torchvision import transforms
from PIL import Image

# 자연어처리
from urllib import request
from flask import Flask
import h5py
import pandas as pd
from tqdm.notebook import tqdm
import numpy as np
import matplotlib.pyplot as plt
from flask import Flask, request, render_template
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.layers.experimental.preprocessing import TextVectorization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import os
import re
import string
import random
from defs import TokenAndPositionEmbedding, TransformerBlock

# embed_dim = 256  # Embedding size for each token
# num_heads = 2  # Number of attention heads
# feed_forward_dim = 256  # Hidden layer size in feed forward network inside transformer
# maxlen = 20
# vocab_size = 200000

# def create_model():
#     inputs = layers.Input(shape=(maxlen,), dtype=tf.int32) 
#     # input 정의
    
#     embedding_layer = TokenAndPositionEmbedding(maxlen, vocab_size, embed_dim) 
#     # token Embedding + positional Embedding layer class 정의
    
#     x = embedding_layer(inputs) 
#     # 선언한 Embedding layer class 이용해 Embedding
    
#     transformer_block = TransformerBlock(embed_dim, num_heads, feed_forward_dim) 
#     # transformer block layer class 정의
    
#     x = transformer_block(x) 
#     # 선언한 transformer layer class 이용해 학습
    
#     outputs = layers.Dense(vocab_size)(x) 
#     # 압축된 결과를 vocab에 맞춰 팽창 (후보단어 선별을 위한 각 단어에 대한 결과치 도출)
    
#     model = keras.Model(inputs=inputs, outputs=[outputs, x])  
#     # model 정의
    
#     loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True) 
#     model.compile(
#         "adam", loss=[loss_fn, None],
#     )  # No loss and optimization based on word embeddings from transformer block
#     model.summary()
#     return model

# # 우리의 리뷰 모델 만들기
# class ReviewModel():
#   def __init__(self, model, word_to_index, index_to_word, max_tokens=20, top_k=10):
#     self.model = model
#     self.word_to_index = word_to_index
#     self.index_to_word = index_to_word
#     self.max_tokens = max_tokens
#     self.k = top_k

#   def detokenize(self, number):
#     # if number == '[UNK]':
#     #     return ''
#     # else:
#         return self.index_to_word[number]

#   def sample_from(self, logits):
#     logits, indices = tf.math.top_k(logits, k=self.k, sorted=True)
#     indices = np.asarray(indices).astype("int32")
#     preds = keras.activations.softmax(tf.expand_dims(logits, 0))[0]
#     preds = np.asarray(preds).astype("float32")
#     return np.random.choice(indices, p=preds)

#   def tag_to_token(self, tag):
#     tokens = [self.word_to_index.get(_, 1) for _ in tag.split()]
#     return tokens
  
#   def tag_to_sentence(self, tag, n=1):
#     token = self.tag_to_token(tag)
#     res_text = []
#     for i in range(n):
#       start_tokens = [_ for _ in token]
#       num_tokens_generated = 0
#       tokens_generated = []
#       while num_tokens_generated <= self.max_tokens:
#           pad_len = maxlen - len(start_tokens)
#           sample_index = len(start_tokens) - 1
#           if pad_len < 0:
#               x = start_tokens[:maxlen]
#               sample_index = maxlen - 1
#           elif pad_len > 0:
#               x = start_tokens + [0] * pad_len
#           else:
#               x = start_tokens
#           x = np.array([x])
#           y, _ = self.model.predict(x)
#           sample_token = self.sample_from(y[0][sample_index])
#           tokens_generated.append(sample_token)
#           start_tokens.append(sample_token)
#           num_tokens_generated = len(tokens_generated)
#       txt = " ".join(
#           [self.detokenize(_) for _ in token + tokens_generated]
#       )
#       txt.replace('[UNK]','')
#       res_text.append(txt)
      
#     return res_text   


           
# model = {'cafe':{}, 'camping' : {}, 'enter' : {}, 'fish' : {}, 'food' : {}, 'park' : {}, 'sports' : {}}
# model_wn = ['cafe', 'fish', 'park', 'food']

# def init():
#     for wn in model_wn:
#         model[wn]['model'] = create_model()
#         model[wn]['model'].load_weights('./model/'+ wn + '_weight.h5')
        
#         temp = pd.read_csv("./model/" + wn + "_vocab.csv", encoding='utf-8-sig')
#         temp.rename(columns={'Unnamed: 0':'vocab'}, inplace=True)
        
#         model[wn]['vocab'] = ['']
#         for i in range(len(temp)):
#             model[wn]['vocab'].append(temp.vocab[i])
#         # vocab[:5]
        
#         model[wn]['word_to_index'] = {}
#         for index, word in enumerate(model[wn]['vocab']):
#             model[wn]['word_to_index'][word] = index
            
#         model[wn]['index_to_word'] = {}
#         for index, word in enumerate(model[wn]['vocab']):
#             model[wn]['index_to_word'][index] = word
            
#         model[wn]['ReviewModel'] = ReviewModel(model[wn]['model'], model[wn]['word_to_index'], model[wn]['vocab'])

        
        
# # 분류 모델 로드
# clfmodel = torch.load('model/clfmodel.pt')
# class_names = ['계곡', '공부', '낚시', '놀이공원','등산', '레저스포츠', '바다', '산', '어린이', '역사유적지', '워터파크','캠핑','피크닉']

# def process_image(image):     
#     process = transforms.Compose([
#         transforms.Resize((224,224)),
#         transforms.ToTensor(),
#         transforms.Normalize(mean=[0.485, 0.456, 0.406], 
#                                 std=[0.229, 0.224, 0.225])
#     ])
#     image = process(image)
#     return image




#-------------------------------------------------------------------------------------------------------

app = Flask(__name__)

imgclf = ""
# 이미지 업로드 페이지 라우팅
@app.route('/',methods=['GET'])
def imageupload():
    return render_template('imageupload.html')

@app.route('/clf', methods=['POST','GET'])
def clf():
    if request.method == 'GET':
        return render_template("imageupload.html")
    if request.method == 'POST':
        f = request.files['file']
        f.save(secure_filename(f.filename))
        img = f.filename
        img = process_image(Image.open(img))
        image = img.unsqueeze(0)
        with torch.no_grad():
            outputs = clfmodel(image)
            _, preds = torch.max(outputs, 1)
            # imshow(image.cpu().data[0], title='예측 결과: ' + class_names[preds[0]])

        # result = class_names[preds[0]] + ',' + f.filename
        
        result = class_names[preds[0]]
        output = ''
        #낚시, 산, 역사유적지, 바다, 게곡, 노트, 공부, 캠핑, 어린이, 워터파크, 레저스포츠, 등산, 피크닉
        result_arr = {'낚시':'fish', '캠핑':'camping', '레저스포츠':'sports','공부':'study','':'enter', }
        return redirect(url_for(''))

@app.route('/test',methods=['POST'])
def tetst():
    if request.method == 'POST':
        #test = request.form['kind']
        val = request.form
        form = {}
        f = request.files['file']
        f.save('./static/image/' + f.filename)
        form['file']= './static/image/'+f.filename
        form['kind'] = request.form['kind']
        print(form)
        return render_template('keywordinput.html',value=form)
    
@app.route('/gogo',methods=['POST'])
def test():
    if request.method == 'POST':
        form = {}
        f = request.form['file']
        form['file'] = f
        form['kind'] = request.form['kind']
        form['detail'] = request.form['inputtext']
        
        return render_template('show.html',value = form)

@app.route('/home', methods=['POST'])
def kim():
     if request.method == "POST":
        f = request.form['file']
        os.remove(f)
        return redirect('http://localhost:5000/')
    
       
@app.route('/recommend', methods=['POST'])
def recommend(): 
    global model
    
    if request.method == 'POST':
    # 모델 새로 생성하기
        category = request.form['class']
        # category = output
        inp = request.form['inputtext']
        print(inp)
        
        output = model[category]['ReviewModel'].tag_to_sentence(inp, 5)
            
        print(str(output))
        
        return render_template('recommendresult.html')
    
        #index : 이미지 업로드하는 페이지
        # return render_template('imageupload.html', label = result)

# @app.route('/clf', methods=["GET",'POST'])
# def clf():
#     # if request.method == 'GET':
#     #     return render_template("index.html")
#     if request.method == 'POST':
#         f = request.files['file']
#         f.save(secure_filename(f.filename))
#         img = f.filename
#         img = process_image(Image.open(img))
#         image = img.unsqueeze(0)
#         with torch.no_grad():
#             outputs = clfmodel(image)
#             _, preds = torch.max(outputs, 1)
#             # imshow(image.cpu().data[0], title='예측 결과: ' + class_names[preds[0]])

#         # result = class_names[preds[0]] + ',' + f.filename
#         result = class_names[preds[0]]
#         #낚시, 산, 역사유적지, 바다, 게곡, 노트, 공부, 캠핑, 어린이, 워터파크, 레저스포츠, 등산, 피크닉
#         if result == '낚시':
#             output = 'fish'
        
    
#         #index : 이미지 업로드하는 페이지
#         # return render_template('imageupload.html', label = result)
        
# @app.route('/recommend', methods=['POST'])
# def clf():
#     if request.method == 'GET':
#         return render_template("index.html")
#     if request.method == 'POST':
#         f = request.files['file']
#         f.save(secure_filename(f.filename))
#         img = f.filename
#         img = process_image(Image.open(img))
#         image = img.unsqueeze(0)
#         with torch.no_grad():
#             outputs = clfmodel(image)
#             _, preds = torch.max(outputs, 1)
#             # imshow(image.cpu().data[0], title='예측 결과: ' + class_names[preds[0]])

#         # result = class_names[preds[0]] + ',' + f.filename
#         result = class_names[preds[0]]
#         #낚시, 산, 역사유적지, 바다, 게곡, 노트, 공부, 캠핑, 어린이, 워터파크, 레저스포츠, 등산, 피크닉
#         return result
    
# def recommend(): 
#     global model
    
#     if request.method == 'POST':
       
#     # 모델 새로 생성하기
#         category = request.form['class']
#         inp = request.form['inputtext']
#         print(inp)
        
#         #review_model = ReviewModel(model[category]['model'], model[category]['word_to_index'], model[category]['vocab'])
       
#         output = model[category]['ReviewModel'].tag_to_sentence(inp, 5)
            
#         print(str(output))
        
    
#         return render_template('caferesult.html', result=output)
       
@app.route('/index')

@app.route('/loginPage')

@app.route('/registerPage')

@app.route('/searchPage')

@app.route('/add')

@app.route('/assemble')

def hello():

   return '<h1>Hello World</h1>'



if __name__ == '__main__':
    #init() # 모델 세팅 끝나고 시작
    #print("Model Setup Done.")
    app.run(debug=True)  #app.run(debug=True) 개발자 모드
