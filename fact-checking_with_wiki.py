import socket
from googlesearch import search
from urllib.request import urlopen
from bs4 import BeautifulSoup
import wikipedia as wp
import time



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

def factcheck(dc_message, res, timeout, timeoutStart):
    split_msg = dc_message.lower().split()
    good_scentences = []
    response = ''
    num_results = res
    search_results = google(num_results, dc_message)
    try:
        search_results = [url for url in search_results if "#" not in url]
        for url in search_results:
            print(f"reading {url} right now...")
            try:
                page = urlopen(url)
                html = page.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")
                text = soup.get_text().lower()
                text = text.split(".")
            except:
                continue
            print("checking if message is in the site...")
            for scentence in text:
                correct = 0
                for word in split_msg:
                    if word in scentence:
                        correct += 1
                if correct == len(split_msg)-1:
                    print(f"new good scentence {scentence}")
                    good_scentences.append(scentence)
    except Exception as e:
        print(e)
        timeout = 60
        timeoutStart = time.time()
        response = f'My search has been blocked by google, this feature will probably be available again in 60 seconds. Error: {e}'
        
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
        return response, timeout, timeoutStart

def main():
    timeout = 0
    timeoutStart = time.time()
    
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
            if time.time() > timeoutStart + timeout:
                data = data[:-9]
                response, newtimeout, newtimeoutStart = factcheck(data, 20, timeout, timeoutStart)
                timeout = newtimeout
                timeoutStart = newtimeoutStart
                connection.send(response.encode())
                print("sent it back to js")
            else:
                connection.send('this feature is not available right now, please try again in a minute'.encode())
        
        if 'get-info' in data:
            data = data[:-8]
            response = wiki_summarize(data)
            connection.send(response.encode())

    connection.close()
    
if __name__ == "__main__":
    print(socket.gethostbyname(socket.gethostname()))
    main()