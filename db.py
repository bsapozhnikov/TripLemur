import sqlite3

conn = sqlite3.connect("data.db")

c = conn.cursor()

def dropTable(tablename):
    c.execute("DROP TABLE %s" % (tablename))
    conn.commit()
    print ("DROP TABLE %s" % (tablename))

def createTable(tablename, attr):
    """Creates a table in the database \'blog.db\'
    1st parameter - name of table (string)
    2nd parameter - Dictionary with keys and types as values'
    """
    print tablename
    L = [k[0]+' '+k[1] for k in attr]
##    L = [k+' '+attr[k] for k in attr.keys()]
    s = ','.join(L)
    c.execute("CREATE TABLE %s(%s)" % (tablename, s))
    conn.commit()
    print ("CREATE TABLE %s(%s)") % (tablename, s)

def createTables():
    '(re)creates tables for users, places, and reviews'
    #dropTable('users')
    #dropTable('trips')
    createTable('users', [('username','text'),('pw','text')]) ##not sure what else needs to go here
    createTable('trips', [('user', 'text'), ('name', 'text')])
   
def validateUser(user, pw):
   # for row in c.execute("SELECT oid,* FROM users"):
    #    content = {'username':row[1],'pw':row[2]}
     #   users[row[0]]=content
   # for x in users:
   #     if (len(username) <= 5):
    #        return False
     #   if (len(pw) <= 5):
      #      return False
   # else:
    #    return True
    users = getUsers()
    ##print [x for x in users.keys()]
    for userID in users.keys():
        some = users[userID]
        if some['username'] == user:
            return some['pw'] == pw
    return False
    
def addUser(username, pw):
    if not existingName(username):## removed for testing purposes ## and validateUser(username,pw): 
        conn = sqlite3.connect('data.db')
        c = conn.cursor()
        c.execute("INSERT INTO users VALUES ('%s','%s')" %(username,pw))
        conn.commit()
        print "added %s to users" % (username)
    else:
        print "Username already taken. Please enter a different username"

'''add place into db
still needs an existingPlace method to check if a the place is already in the db'''

def existingName(username):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    users = {}
    for row in c.execute("SELECT oid,* FROM users"):
        content = {'username':row[1],'pw':row[2]}
        users[row[0]]=content
    for x in users:
        if (username == x):
            return True
            ## I (Brian) don't this is right
            ##else:
            ##     return False
    return False ## I think this IS right

def updatePass(username, oldpw, newpw):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    c.execute("UPDATE users SET pw = ? WHERE username = ? and pw = ?", (newpw,username,oldpw)) 
    conn.commit()
    print "updated password"

def getUser(user):
    '''returns user as a dictionary
    This dictionary will also contain the user's oid'''
    users = getUsers()
    for userID in users.keys():
        some = users[userID]
        if some['username'] == user:
            some['oid']=userID
            return some
    
def getUsers():
    '''returns dictionary of users: 
    the key is the unique id
    the value is a dictionary containing the rest of the data'''
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    users = {}
    for row in c.execute("SELECT oid,* FROM users"):
        content = {'username':row[1],'pw':row[2]}
        users[row[0]]=content
    return users


def addTrip(user, name):
    conn=sqlite3.connect('data.db')
    c = conn.cursor()
    t = (user, name)
    c.execute("INSERT INTO trips VALUES (?,?)", t)
    conn.commit()
    print "added %s to %s's trips" %(name, user)


def getTrips():
    'returns a list of trips'
    conn=sqlite3.connect('data.db')
    c = conn.cursor()
    trips = []
    for row in c.execute("SELECT rowid,* FROM trips"):
        trips.append({"id":row[0], "user":row[1], "name":row[2]})
    print "list of all trips"
    return trips

    
    
