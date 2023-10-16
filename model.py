from flask import Flask, request, jsonify

import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering

app = Flask(__name__)
class TransformerBot:
    def __init__(self, model_name):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForQuestionAnswering.from_pretrained(model_name)

    def generate_answer(self, question, context):
        encoding = self.tokenizer.encode_plus(question, context, return_tensors='pt')
        input_ids = encoding['input_ids']
        attention_mask = encoding['attention_mask']
        start_scores, end_scores = self.model(input_ids, attention_mask=attention_mask, return_dict=False)
        start_index = torch.argmax(start_scores)
        end_index = torch.argmax(end_scores)
        answer_tokens = input_ids[0][start_index:end_index+1]
        answer = self.tokenizer.decode(answer_tokens)
        return answer

bot = TransformerBot('bert-large-uncased-whole-word-masking-finetuned-squad')

@app.route('/ask', methods=['POST'])
def ask():
    
    data = request.get_json()
    print(data, "data")
    answer = bot.generate_answer(data['question'], data['context'])
    return jsonify(answer=answer)





if __name__ == '__main__':
    app.run(port=5050)
