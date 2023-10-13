import socket
from googlesearch import search
from urllib.request import urlopen
from bs4 import BeautifulSoup


def google(num_results, query):
    search_results = search(query, stop=num_results)
    return search_results

#please comment your code 
def factcheck(dc_message):
    split_msg = dc_message.lower().split()
    good_scentences = []
    response = ''
    num_results = 10
    search_results = google(20, dc_message)
    is_video_game = False
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
                    print("found a good word")
                    correct += 1
            if correct == len(split_msg) - 1 - len(split_msg) // 4:
                print(f"new good scentence {scentence}")
                good_scentences.append(scentence)
                break
    
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
    
    response = good_scentences[highest_similarity_index]
        
    return response

def main():
    PORT = 5050
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
        
        response = factcheck(data)

        connection.send(response.encode())

    connection.close()
    
if __name__ == "__main__":
    main()