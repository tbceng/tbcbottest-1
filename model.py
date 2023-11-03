from flask import Flask, request, jsonify
import socket
from googlesearch import search
from urllib.request import urlopen
from bs4 import BeautifulSoup
import requests
import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering,T5ForConditionalGeneration, T5Tokenizer
import re


app = Flask(__name__)
'''
class TransformerBot:
    def __init__(self, model_name):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForQuestionAnswering.from_pretrained(model_name)

    def generate_answer(self, question, context):
        context = context[:511]
        encoding = self.tokenizer.encode_plus(question, context, return_tensors='pt')
        input_ids = encoding['input_ids']
        attention_mask = encoding['attention_mask']
        start_scores, end_scores = self.model(input_ids, attention_mask=attention_mask, return_dict=False)
        start_index = torch.argmax(start_scores)
        end_index = torch.argmax(end_scores)
        answer_tokens = input_ids[0][start_index:end_index+1]
        answer = self.tokenizer.decode(answer_tokens)
        return answer
        '''
class t5Bot:
    def __init__(self, model_name):
        self.model = T5ForConditionalGeneration.from_pretrained(model_name)
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        
bot = t5Bot('MaRiOrOsSi/t5-base-finetuned-question-answering')

@app.route('/ask', methods=['POST'])
def ask():
    
    data = request.get_json()
    print(data, "data")
    #context, sources = factcheck(data['question'])
    #answer = bot.generate_answer(data['question'], context)
    input_text = "question: " + data['question']
    input_ids = bot.tokenizer.encode(input_text, return_tensors='pt')

    output = bot.model.generate(input_ids, max_length=100, num_return_sequences=1)

    answer = bot.tokenizer.decode(output[0])
    answer = answer.replace('<pad>', '').replace('</s>', '')

    return jsonify(answer=answer)

'''
def google(num_results, query):
    search_results = search(query, num_results=num_results)
    return search_results




def factcheck(dc_message):
    
    split_msg = dc_message.lower().split()
    context = ''
    cleaned_text = ''
    #print(list(response.links))
    search_results = google(1, dc_message)
    search_results = [url for url in search_results if "#" not in url]
    for url in search_results:
        print(f"reading {url} right now...")
        try:
            page = urlopen(url)
            html = page.read().decode("utf-8")
            soup = BeautifulSoup(html, "html.parser")
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                text += p.get_text()
            #paragraphs = soup.find_all('p')

            text = text.split(".")
            text = " ".join(text)
            text = re.sub(r"(\\n|\\r|\\t|\\)", "", text).strip()
            cleaned_text += ' ' + re.sub(' +', ' ', text)
            print(cleaned_text)
            break
        except Exception as e:
            print(f"Failed to process URL {url}: {e}")
            continue

    return cleaned_text.strip(), search_results
'''

if __name__ == '__main__':
    app.run(port=5050)
