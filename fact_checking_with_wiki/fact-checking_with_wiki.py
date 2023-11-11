import socket
from googlesearch import search
from urllib.request import urlopen
import requests
from bs4 import BeautifulSoup
import wikipedia as wp
import time
from scrapingbee import ScrapingBeeClient 
import threading

scentences = []

def google(num_results, query):
    search_results = search(query, stop=num_results)
    return search_results

def wiki_summarize(topic):
    try:
        response = wp.summary(topic, sentences = 2)
    except:
        response = f'you entered some random dogshit. please use a topic instead of {topic}'
    
    if response:
        return response
    else:
        return "Sorry, I didn't find anything :("

def check_url(url, cli):
    global scentences
    req = cli.get(url)
    if (req.status_code == 200):
        html = req.content
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text().lower()
        text = text.split(".")
        for sc in text:
            scentences.append(sc)

def factcheck(dc_message, res, BEECLIENT):
    global scentences
    split_msg = dc_message.lower().split()
    good_scentences = []
    threads = []
    response = ''
    num_results = res
    search_results = google(num_results, dc_message)
    for url in search_results:
        if not '#' in str(url):
            print(f"reading {url} right now...")
            URLthread = threading.Thread(target=check_url, args=(url, BEECLIENT))
            URLthread.start()
            threads.append(URLthread)
    for URLthread in threads:
        URLthread.join()
    print("done with readin urls")
    for scentence in scentences:
        correct = 0
        for word in split_msg:
            if word in scentence:
                correct += 1
        if correct == len(split_msg)-1:
            print(f"new good scentence {scentence}")
            good_scentences.append(scentence)
        
    if response == '':
        highest_similarity = 0
        highest_similarity_index = None
        print("picking the best scentence...")
        for i in range(len(good_scentences)):
            similarity = 0
            for j in range(len(good_scentences)):
                if i != j:
                    this_sim = 0
                    for word in good_scentences[i].split():
                        if word in good_scentences[j]:
                            this_sim += 1
                    this_sim = this_sim / len(good_scentences[i].split())
                    similarity += this_sim
                    
            if similarity > highest_similarity:
                highest_similarity = similarity
                highest_similarity_index = i
    
        try:
            response = good_scentences[highest_similarity_index]
            
            return response
        except TypeError:
            return factcheck(dc_message, num_results + 10)
    
    else:
        return response

def main():
    global scentences
    BEECLIENT = ScrapingBeeClient(api_key='BNF5GS7P1J7AZ8A6O6A252T8CN4JA9OZH3UDFZ48PE3AKJK7PW4KU6SM8JZUMF8XI9OJTWL41Y3A4RP2')
    PORT = 8080
    IP_ADRESS = socket.gethostbyname(socket.gethostname())

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((IP_ADRESS, PORT))
    server.listen(1)
    
    print('Python server is listening...')

    connection, address = server.accept()
    
    online = True
    
    while online:
        data = connection.recv(1024).decode()
        if not data:
            break
        
        
        if 'factcheck' in data:
            scentences.clear()
            data = data[:-9]
            print("someone asked: " + data)
            response = factcheck(data, 10, BEECLIENT)
            connection.send(response.encode())
            print("sent it back to js")
        
        if 'get-info' in data:
            data = data[:-8]
            response = wiki_summarize(data)
            connection.send(response.encode())

    connection.close()
    
if __name__ == "__main__":
    print(socket.gethostbyname(socket.gethostname()))
    main()
