import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import random

class Hero:
    def __init__(self, name, url):
        self.name = name
        self.url = url
        self.img = ''
        self.abilities = []

class Ability:
    def __init__(self, heroname, name, mana, cooldown, img):
        self.name = name
        self.cooldown = cooldown
        self.mana = mana
        self.img = img

    def getWrongAnswers_Mana(self):
        result = '['

        # if self.mana <= 25:
        #     return '[]'
        # if self.mana > 25:
        #     factor = 5
        #     limit = 5
        # if self.mana > 100:
        #     factor = 10
        #     limit = 8
        # if self.mana > 400:
        #     factor = 10
        #     limit = 20
        #     if self.mana % 25 == 0:
        #         factor = 25
        #         limit = 10
        # if self.mana > 800:
        #     factor = 25
        #     limit = 30
        # if self.mana > 1400:
        #     factor = 25
        #     limit = 50
        # if self.mana > 2000:
        #     factor = 100
        #     limit = 15

        count = random.randint(5, 8)
        for r in range(0, count):
            valid = False
            while not valid:
                x = random.randint(-limit, limit)
                if x != 0 and result.find(str(self.cost + x*factor)) == -1:
                    valid = True
                    result += str(self.cost + x*factor) + ', '
        return result[:-2] + ']'


herodictionary = {}

print('Getting page data... https://dota2.gamepedia.com/Heroes')
page = requests.get('https://dota2.gamepedia.com/Heroes')
soup = BeautifulSoup(page.content, 'html.parser')

print('Parsing HTML...')
heroes = soup.find_all('div', attrs={'style': 'width:150px; height:84px; display:inline-block; overflow:hidden; margin:1px'})

if len(heroes) == 0:
    print('Parse failed - could not find any div elements representing heroes')
    exit()
print(len(heroes), 'heroes found')

for hero in heroes:
    if hero.find('a') is None:
        continue
    else:
        h_name = hero.find('a')['title']
        h_url = hero.find('a')['href']
        herodictionary[h_name] = Hero(h_name, h_url)
print(len(herodictionary), 'heroes added to dictionary\n')

print('Getting abilities...\n')
json = '    {'
for key, hero in herodictionary.items():
    print(hero.name.upper() + ' : ', end='')
    page = requests.get('https://dota2.gamepedia.com' + str(hero.url))
    soup = BeautifulSoup(page.content, 'html.parser')

    # GET HERO IMAGE
    infobox = soup.find('table', 'infobox')
    if infobox is not None:
        hero.img = infobox.find('a', 'image').find('img')['src']
    print(hero.img)

    # GO TO ABILITIES SECTION
    abilities_heading = soup.find('span', attrs={'id': 'Abilities'}).parent
    if abilities_heading is None:
        print('    No abilities found...\n')
        continue

    elem_prev = abilities_heading       # Start with the heading and work down...
    while True:
        elem = elem_prev.find_next_sibling()

        # Stop at the next header/the end of the page
        if elem is None or elem.name == 'h2' or elem.name == 'h3':
            break

        if elem.name == 'p' and elem.find('span') is not None:
            ability_div = elem.find_next_sibling()

            # GET ABILITY NAME
            if ability_div is not None:
                a_name = ability_div.find('div').find('div').contents[0]
            else:
                a_name = "ERROR_ABILITY_DIV_NOT_FOUND"

            # GET ABILITY MANA COST
            cd_icon_link = ability_div.find('a', attrs={'href': '/Cooldown'})
            if cd_icon_link is not None:
                a_cooldown = cd_icon_link.parent.parent.text.strip()
                if a_cooldown.find('(') != -1:                              # Remove talent cooldown info
                    a_cooldown = a_cooldown[:(a_cooldown.find('(')-1)]
            else:
                a_cooldown = 'NO_COOLDOWN'

            # GET ABILITY COOLDOWN
            mana_icon_link = ability_div.find('a', attrs={'href': '/Mana'})
            if mana_icon_link is not None:
                a_mana = mana_icon_link.parent.parent.text.strip()
                if a_mana.find('(') != -1:                              # Remove talent mana cost info
                    a_mana = a_mana[:(a_mana.find('(')-1)]
            else:
                a_mana = 'NO_MANA_COST'

            # GET ABILITY IMAGE
            ability_image = ability_div.find('a', 'image')
            if ability_image is not None:
                a_img = ability_image.find('img')['src']
            else:
                a_img = 'NO_IMAGE'

            print('   ', a_name, ':', a_cooldown, ':', a_mana, ':', a_img)

            ability = Ability(hero.name, a_name, a_mana, a_cooldown, a_img)
            hero.abilities.append(ability)
        elem_prev = elem

    continue


    # TODO: loop through heroes and generate questions on ability mana costs and cooldowns like in items.py



