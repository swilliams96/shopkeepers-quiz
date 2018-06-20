import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import random
import os

class Hero:
    def __init__(self, name, url):
        self.name = name
        self.url = url
        self.img = ''
        self.abilities = []

class Ability:
    def __init__(self, name, mana, cooldown, img):
        self.name = name
        self.cooldown = cooldown
        self.mana = mana
        self.img = img

    def getWrongAnswersMana(self, lvls=4):
        count = 1
        result = ''
        while count <= 7:
            if count == 1:
                answer = str(self.getWrongAnswerMana(1))                        # One of each type...
            elif count == 2:
                answer = str(self.getWrongAnswerMana(3))
            elif count == 3:
                answer = str(self.getWrongAnswerMana(4))
            else:
                answer = str(self.getWrongAnswerMana(lvls))                     # Plus an extra four of the same type

            if result.find(answer) == -1 and answer != self.mana:           # If this is a valid wrong answer...
                count += 1                                                          # Allow the counter to progress
                result += '"' + answer + '", '                                      # Add the wrong answer to the pool
        result = '[' + result[:-2] + ']'
        return result


    def getWrongAnswerMana(self, lvls=4):
        if levels == 3:
            low = random.randint(4, 50) * 5         # Higher mana cost for ultimate abilities
        elif levels == 1:
            low = random.randint(1, 50) * 5         # Wider range for single scaling abilities
        else:
            low = random.randint(1, 40) * 5

        if lvls == 1:
            return str(low)

        steps = [5]
        if low >= 25:
            steps.extend([10, 10, 15, 15, 20, 25, 50])
        if low >= 50:
            steps.extend([30, 75])
        if low >= 100:
            steps.extend([10, 15, 100])
        if low >= 200:
            steps.extend([50, 75, 250])

        values = []
        step = random.choice(steps)
        for x in range(lvls):
            values.append(low + (x * step))

        if low < 200 and random.random() < 0.4:                   # 40% chance to reverse order
            values.reverse()
        return '/'.join(str(v) for v in values)

    def getWrongAnswersCooldown(self, lvls=4):
        count = 1
        result = ''
        while count <= 7:
            if count == 1:
                answer = str(self.getWrongAnswerCooldown(1))                    # One of each type...
            elif count == 2:
                answer = str(self.getWrongAnswerCooldown(3))
            elif count == 3:
                answer = str(self.getWrongAnswerCooldown(4))
            else:
                answer = str(self.getWrongAnswerCooldown(lvls))                 # Plus an extra four of the same type

            if result.find(answer) == -1 and answer != self.cooldown:           # If this is a valid wrong answer...
                count += 1                                                          # Allow the counter to progress
                result += '"' + answer + '", '                                      # Add the wrong answer to the pool
        result = '[' + result[:-2] + ']'
        return result

    def getWrongAnswerCooldown(self, lvls=4):
        correct_first = float(self.cooldown.split('/')[0])
        if (correct_first % 5) == 0:                        # If the cooldown is divisible by 5...
            if lvls == 3:
                low = random.randint(2, 24) * 5                 # Higher cooldown for ultimate abilities
            elif lvls == 1:
                low = random.randint(1, 50) * 5                 # Wider range for single scaling abilities
                return str(low)
            else:
                low = random.randint(1, 40) * 5
        else:                                               # Otherwise...
            if lvls == 3:
                low = random.randint(5, 60) * 2                 # Higher cooldown for ultimate abilities
            elif lvls == 1:
                low = random.randint(2, 70) * 2                 # Wider range for single scaling abilities
                return str(low)
            else:
                low = random.randint(1, 30) * 2

        steps = [1]
        if low >= 6:
            steps.extend([2, 3, 4, 5])
        if low >= 12:
            steps.extend([2, 4, 6, 10, 12])
        if low >= 30:
            steps.extend([15, 15, 20, 25, 30, 35])
        if low >= 45:
            steps.extend([30, 30, 60])

        if (correct_first % 10) == 0:
            steps = [2, 3, 4, 5, 5, 10, 15]
            if low >= 30 and lvls != 4:
                steps.extend([10, 15, 15, 20, 25, 30, 30, 35, 45, 60])

        values = []
        step = random.choice(steps)
        for x in range(lvls):
            values.append(low + (x * step))

        if low < 200 and random.random() < 0.7:                   # 70% chance to reverse order
            values.reverse()
        return '/'.join(str(v) for v in values)




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

            ability = Ability(a_name, a_mana, a_cooldown, a_img)
            hero.abilities.append(ability)
        elem_prev = elem
    time.sleep(0.33)

json = '    {'
print('\nGenerating mana cost questions...\n')
for i, hero in herodictionary.items():
    for ability in hero.abilities:
        # Skip abilities with no mana cost
        if ability.mana == 'NO_MANA_COST' or ability.mana == '0':
            continue
        # Skip abilities with words in the scraped mana cost (only accept format similar to 00/00/00)
        if any(c.isalpha() for c in ability.mana):
            continue

        levels = ability.mana.count('/') + 1

        json += '\n      '
        json += '"question": "What is the mana cost of {name}?",\n      '.format(name=ability.name)
        json += '"image": "{url}",\n      '.format(url=ability.img)
        json += '"type": "mana",\n      "correct": "{mana}",\n      '.format(mana=ability.mana)
        json += '"wrong": {wronganswers}\n    '.format(wronganswers=ability.getWrongAnswersMana(levels))
        json += '}, {'

print('Generating cooldown questions...\n')
for i, hero in herodictionary.items():
    for ability in hero.abilities:
        # Skip abilities with no mana cost
        if ability.cooldown == 'NO_COOLDOWN' or ability.cooldown == '0':
            continue
        # Skip abilities with words in the scraped mana cost (only accept format similar to 00/00/00)
        if any(c.isalpha() for c in ability.cooldown):
            continue

        levels = ability.cooldown.count('/') + 1

        json += '\n      '
        json += '"question": "What is the cooldown of {name}?",\n      '.format(name=ability.name)
        json += '"image": "{url}",\n      '.format(url=ability.img)
        json += '"type": "cooldown",\n      "correct": "{cooldown}",\n      '.format(cooldown=ability.cooldown)
        json += '"wrong": {wronganswers}\n    '.format(wronganswers=ability.getWrongAnswersCooldown(levels))
        json += '}, {'

full_json = '{\n  "questions": [\n' + json[:-3] + '\n  ]\n}'
print('\nJSON:\n\n' + full_json)

if not os.path.exists('output'):
    os.makedirs('output')
f = open('output/manacost-' + str(datetime.now().date().isoformat()) + '.json', 'w')
f.write(full_json)

