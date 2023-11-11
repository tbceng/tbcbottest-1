# Do some imports
import socket
from googlesearch import search
from urllib.request import urlopen
import requests
from bs4 import BeautifulSoup
import wikipedia as wp
import time
from scrapingbee import ScrapingBeeClient 
import threading

# This list will be used later to storeall the scentences found on the websites
scentences = []

# Function to do the googlesearch
def google(num_results, query):
    search_results = search(query, stop=num_results)
    return search_results

# Function to do the summarize command, pretty simple to understand
def wiki_summarize(topic):
    try:
        response = wp.summary(topic, sentences = 2)
    except:
        response = f'you entered some random dogshit. please use a topic instead of {topic}'
    
    if response:
        return response
    else:
        return "Sorry, I didn't find anything :("

# This function will get all the scentences foumd on one website. It will be multithreaded
def check_url(url, cli):
    # gloabal scentences to add them into a list that can be easily usen in the main function
    global scentences
    # get the request from scrapingbee
    req = cli.get(url)
    if (req.status_code == 200): # code 200 means SUCCEED
        # html to get the html code out of the request and BeatifulSoup to get the wanted text
        html = req.content
        soup = BeautifulSoup(html, "html.parser")
        # the text will be lowered to make it mpre compatible with the discord message wich will be lowered too to avoid an unsimilarity in the words
        text = soup.get_text().lower()
        text = text.split(".") # splits the text into scentences
        for sc in text:
            scentences.append(sc)

def factcheck(dc_message, res, BEECLIENT):
    global scentences  # to get access to the list where the scentences are stored
    split_msg = dc_message.lower().split() # make the message compatible with the text
    good_scentences = []
    threads = []
    response = ''
    num_results = res
    search_results = google(num_results, dc_message) # get the first results from a googlesearch
    for url in search_results:
        if not '#' in str(url): # this is done so that for example wikipedia/usa#history wont be looked through because it's the same content as wikipedia/usa
            print(f"reading {url} right now...")
            URLthread = threading.Thread(target=check_url, args=(url, BEECLIENT))
            URLthread.start() # start the threading...
            threads.append(URLthread)
    for URLthread in threads:
        URLthread.join() # join the threads so that the code waits for them to be finished before moving on
    print("done with readin urls")
    for scentence in scentences: # goes through every scentence to check if it's relevant
        correct = 0
        for word in split_msg:
            if word in scentence:
                correct += 1
        if correct == len(split_msg)-1: # checks if enough words from the message are used in the scentence
            print(f"new good scentence {scentence}")
            good_scentences.append(scentence)
        
    if response == '':
        highest_similarity = 0
        highest_similarity_index = None
        print("picking the best scentence...")
        for i in range(len(good_scentences)): # goes through every relevant scentence and checks wich one has the most similarity to the other ones
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
        except TypeError: # if there were no scentences found it will consult in a TypeError, that means that the google searc will check the next 10 results
            return factcheck(dc_message, num_results + 10)
    
    else:
        return response

def main():
    global scentences
    BEECLIENT = ScrapingBeeClient(api_key='BNF5GS7P1J7AZ8A6O6A252T8CN4JA9OZH3UDFZ48PE3AKJK7PW4KU6SM8JZUMF8XI9OJTWL41Y3A4RP2')
    PORT = 8080
    IP_ADRESS = socket.gethostbyname(socket.gethostname())

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM) # set up the socket server
    server.bind((IP_ADRESS, PORT)) # bind the server
    server.listen(1)
    
    print('Python server is listening...')

    connection, address = server.accept() # let the server accept the js connection
    
    online = True
    
    while online:
        data = connection.recv(1024).decode()
        if not data:
            break
        
        # if he recives data: (the js code will add factcheck to the message in the factcheck command was done and summarize if the summarizecommand was wanted)
        if 'factcheck' in data:
            scentences.clear()
            data = data[:-9] # remove the factcheck string from the data
            print("someone asked: " + data)
            response = factcheck(data, 10, BEECLIENT)
            connection.send(response.encode()) # send the data
            print("sent it back to js")
        
        if 'get-info' in data:
            data = data[:-8] # remove the get-info string from the data
            response = wiki_summarize(data)
            connection.send(response.encode())# send the data

    connection.close()
    
if __name__ == "__main__":
    print(socket.gethostbyname(socket.gethostname()))
    main()
