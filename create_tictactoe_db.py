'''
Simple script to generate dump of database for tests
After running this scrupt simply type 
\i tictactoe.dump 
in postgres
'''

from random import randint
file = open('tictactoe.dump', 'w')
print('DROP TABLE IF EXISTS "tictactoe" CASCADE;', file=file)
print('CREATE TABLE tictactoe (id integer, state integer[3][3]);', file=file)
print('COPY tictactoe (id, state) FROM stdin;', file=file)
for _ in range(100):
    print(randint(int(1e6),int(1e7-1)), '{', sep='\t', end='', file=file)
    for i in range(3):
        print('{', randint(0,2), ',', randint(0,2), ',', randint(0,2), '}', sep='', end='', file=file)
        if i != 2:
            print(',', end='', file=file)
    print('}', file=file)

print('\.', file=file)

