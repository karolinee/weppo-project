'''
Simple script to generate dump of database for tests
After running this scrupt simply type 
\i tictactoe.dump 
in postgres
'''

from random import randint
from random import choice
file = open('tictactoe.dump', 'w')
print('DROP TABLE IF EXISTS "tictactoe" CASCADE;', file=file)
print('CREATE TABLE tictactoe (id integer NOT NULL PRIMARY KEY, state integer[3][3], playeroneid int, playertwoid int);', file=file)
print('COPY tictactoe (id, state, playeroneid, playertwoid) FROM stdin;', file=file)
for _ in range(100):
    print(randint(int(1e6),int(1e7-1)), '{', sep='\t', end='', file=file)
    for i in range(3):
        print('{', randint(0,2), ',', randint(0,2), ',', randint(0,2), '}', sep='', end='', file=file)
        if i != 2:
            print(',', end='', file=file)
    print('}', randint(int(1e6), int(1e7-1)), choice(['\\N', randint(int(1e6), int(1e7-1))]), sep='\t', file=file)

print('\.', file=file)

