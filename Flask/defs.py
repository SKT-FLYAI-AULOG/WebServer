import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


class TokenAndPositionEmbedding(layers.Layer):
    def __init__(self, maxlen, vocab_size, embed_dim):
        super(TokenAndPositionEmbedding, self).__init__()
        self.token_emb = layers.Embedding(input_dim=vocab_size, output_dim=embed_dim)
        self.pos_emb = layers.Embedding(input_dim=maxlen, output_dim=embed_dim)

    def get_config(self):
      config = super().get_config().copy()
      config.update({
          'token_emb': self.token_emb,
          'pos_emb': self.pos_emb
      })
      return config

    def call(self, x):
        maxlen = tf.shape(x)[-1]
        # token 위치에 따른 embedding을 하기위함
        positions = tf.range(start=0, limit=maxlen, delta=1)
        positions = self.pos_emb(positions)
        x = self.token_emb(x)
        return x + positions

def causal_attention_mask(batch_size, n_dest, n_src, dtype):
    """
    Mask the upper half of the dot product matrix in self attention.
    This prevents flow of information from future tokens to current token.
    1's in the lower triangle, counting from the lower right corner.
    """
    i = tf.range(n_dest)[:, None]
    j = tf.range(n_src)
    m = i >= j - n_src + n_dest
    mask = tf.cast(m, dtype)
    mask = tf.reshape(mask, [1, n_dest, n_src])
    mult = tf.concat(
        [tf.expand_dims(batch_size, -1), tf.constant([1, 1], dtype=tf.int32)], 0
    )
    return tf.tile(mask, mult)


class TransformerBlock(layers.Layer):
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
        super(TransformerBlock, self).__init__()
        self.att = layers.MultiHeadAttention(num_heads, embed_dim)
        self.ffn = keras.Sequential(
            [layers.Dense(ff_dim, activation="relu"), layers.Dense(embed_dim),]
        )
        self.layernorm1 = layers.LayerNormalization(epsilon=1e-6)
        self.layernorm2 = layers.LayerNormalization(epsilon=1e-6)
        self.dropout1 = layers.Dropout(rate)
        self.dropout2 = layers.Dropout(rate)
      
    def get_config(self):
      config = super().get_config().copy()
      config.update({
          'att': self.att,
          'ffn': self.ffn,
          'layernorm1': self.layernorm1,
          'layernorm2': self.layernorm2,
          'dropout1':self.dropout1,
          'dropout2':self.dropout2
      })
      return config

    

    def call(self, inputs):
        input_shape = tf.shape(inputs)
        batch_size = input_shape[0]
        seq_len = input_shape[1]
        causal_mask = causal_attention_mask(batch_size, seq_len, seq_len, tf.bool)
        attention_output = self.att(inputs, inputs, attention_mask=causal_mask)
        attention_output = self.dropout1(attention_output)
        out1 = self.layernorm1(inputs + attention_output)
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output)
        return self.layernorm2(out1 + ffn_output)

# 변수 정의 및 모델 함수 정의

embed_dim = 256  # Embedding size for each token
num_heads = 2  # Number of attention heads
feed_forward_dim = 256  # Hidden layer size in feed forward network inside transformer

def create_model():
    inputs = layers.Input(shape=(maxlen,), dtype=tf.int32) 
    # input 정의
    
    embedding_layer = TokenAndPositionEmbedding(maxlen, vocab_size, embed_dim) 
    # token Embedding + positional Embedding layer class 정의
    
    x = embedding_layer(inputs) 
    # 선언한 Embedding layer class 이용해 Embedding
    
    transformer_block = TransformerBlock(embed_dim, num_heads, feed_forward_dim) 
    # transformer block layer class 정의
    
    x = transformer_block(x) 
    # 선언한 transformer layer class 이용해 학습
    
    outputs = layers.Dense(vocab_size)(x) 
    # 압축된 결과를 vocab에 맞춰 팽창 (후보단어 선별을 위한 각 단어에 대한 결과치 도출)
    
    model = keras.Model(inputs=inputs, outputs=[outputs, x])  
    # model 정의
    
    loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True) 
    model.compile(
        "adam", loss=[loss_fn, None],
    )  # No loss and optimization based on word embeddings from transformer block
    model.summary()
    return model
