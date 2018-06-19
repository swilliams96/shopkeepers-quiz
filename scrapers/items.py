import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import random

class Item:
    def __init__(self, name, cost, url):
        self.name = name
        self.cost = cost
        self.url = url

    def getWrongAnswers(self):
        result = '['

        if self.cost <= 25:
            return '[]'
        if self.cost > 25:
            factor = 5
            limit = 5
        if self.cost > 100:
            factor = 10
            limit = 8
        if self.cost > 400:
            factor = 10
            limit = 20
            if self.cost % 25 == 0:
                factor = 25
                limit = 10
        if self.cost > 800:
            factor = 25
            limit = 30
        if self.cost > 1400:
            factor = 25
            limit = 50
        if self.cost > 2000:
            factor = 100
            limit = 15

        count = random.randint(5, 8)
        for r in range(0, count):
            valid = False
            while not valid:
                x = random.randint(-limit, limit)
                if x != 0 and result.find(str(self.cost + x*factor)) == -1:
                    valid = True
                    result += str(self.cost + x*factor) + ', '
        return result[:-2] + ']'


itemdictionary = {}

print('Getting page data... https://dota2.gamepedia.com/Items')
page = requests.get('https://dota2.gamepedia.com/Items')
soup = BeautifulSoup(page.content, 'html.parser')

print('Parsing HTML...')
itemlists = soup.find_all('div', attrs={'class': 'itemlist'})
if len(itemlists) == 0:
    print('Parse failed - could not find any itemlist div elements')
    exit()
print(len(itemlists), 'itemlists found')

aegisReached = False
for itemlist in itemlists:
    if itemlist.find('div') is None:
        continue
    items = itemlist.find_all('div')
    for item in items:
        if item.find('a'):
            link = item.find('a')
            text = link['title']
            text = text.replace(' (Agility)', '')           # For Power Treads
            text = text.replace(' (Strength)', '')          # For Power Treads
            text = text.replace(' (Intelligence)', '')      # For Power Treads

            if text.lower().find('aegis') != -1:  # Items after the aegis are event/temporary items
                print('\nReached Aegis of the Immortal - end of purchasable items...')
                aegisReached = True
                break

            split = str.split(text, '(', 1)
            if len(split) <= 1:                 # Item has no cost/is not purchasable so skip
                continue

            i_name = split[0][:-1]
            i_cost = int(split[1][:-1])
            i_url = link['href']
            itemdictionary[i_name] = Item(i_name, i_cost, i_url)
    if aegisReached:                            # Don't proceed to the next itemlist if we've reached the aegis
        break
print(len(itemdictionary), 'items found\n')

print('Getting high quality item image URLs...\n\n')
json = '    {'
for name, item in itemdictionary.items():
    page = requests.get('https://dota2.gamepedia.com' + str(item.url))
    soup = BeautifulSoup(page.content, 'html.parser')
    img = soup.find('td', attrs={'id': 'itemmainimage'}).find('img')
    if img is not None:
        img_url = img['src'].split('?')[0]
        print(name, ':', item.cost, ':', img_url)
        json += '\n      '
        json += '"question": "How much does {name} cost?",\n      '.format(name=name)
        json += '"image": "{url}",\n      '.format(url=img_url)
        json += '"type": "gold",\n      "correct": "{cost}",\n      '.format(cost=item.cost)
        json += '"wrong": {wronganswers}\n    '.format(wronganswers=item.getWrongAnswers())
        json += '}, {'
    time.sleep(0.33)

full_json = '{\n  "questions": [\n' + json[:-3] + '\n  ]\n}'
print('JSON:\n\n' + full_json)

f = open('output/itemcost-' + str(datetime.now().date().isoformat()) + '.json', 'w')
f.write(full_json)

