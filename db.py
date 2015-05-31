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
    createTable('users', [('username','text'),('pw','text')]) ##not sure what else needs to go here
    createTable('trips', [('user', 'text'), ('name', 'text')])
    createTable('nodes', [('tripID', 'integer'), ('name', 'text'),
                          ('position', "integer"), ('list', 'integer')])
    createTable('links', [("startID", "integer"), ("endID", "integer")])

def dropTables():
    dropTable('users')
    dropTable('trips')
    dropTable('nodes')
    dropTable('links')
    
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
        return True
    else:
        print "Username already taken. Please enter a different username"
        return False

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
    if (getUser(username) != None and oldpw == getUser(username)["pw"]):
        conn = sqlite3.connect('data.db')
        c = conn.cursor()
        c.execute("UPDATE users SET pw = ? WHERE username = ? and pw = ?", (newpw,username,oldpw)) 
        conn.commit()
        print "updated password"
        return True
    print "wrong"
    return False

def getUser(user):
    '''returns user as a dictionary
    This dictionary will also contain the user's oid'''
    users = getUsers()
    for userID in users.keys():
        some = users[userID]
        if some['username'] == user:
            some['oid']=userID
            return some

def getUserID(username):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    userID = -1
    t = (username, )
    for row in c.execute('SELECT oid FROM users WHERE username=?',t):
        userID = row[0]
    return userID
        
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
    return getTrip(user,name)


# def getTrips():
#     'returns a list of trips'
#     conn=sqlite3.connect('data.db')
#     c = conn.cursor()
#     trips = []
#     for row in c.execute("SELECT rowid,* FROM trips"):
#         trips.append({"id":row[0], "user":row[1], "name":row[2]})
#     print "list of all trips"
#     return trips

def getTrips(userID):
    'returns a collection of trips'
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (userID, )
    trips = []
    for row in c.execute('SELECT rowid,* FROM trips WHERE user=?',t):
        trips.append({"id":row[0], "user":row[1], "name":row[2]})
    print 'trips for user with id '+`userID`+": "+`trips`
    return trips

def getTrip(userID,name):
    'returns given trip'
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (userID, name)
    trip = {}    
    for row in c.execute('SELECT rowid,* FROM trips WHERE user=? AND name=?',t):
        trip['id']=row[0]
        trip['user']=row[1]
        trip['name']=row[2]
    print 'trip for user with id %s and name %s'%(userID,name) + `trip`
    return trip

def addNode(tripID, name, li=1):
    position = 0
    oid = 0
    conn=sqlite3.connect('data.db')
    c = conn.cursor()
    c.execute("SELECT last_insert_rowid()")
    t = (tripID, name, position, li)
    R = (tripID, )
    c.execute("INSERT INTO nodes VALUES (?,?,?,?)", t)
    for row in c.execute("SELECT rowid,* FROM nodes WHERE tripID=?", R):
        position = position + 1
        oid = row[0]
    P = (position, oid)
    print P
    c.execute("UPDATE nodes SET position = ? WHERE oid = ?", P)
    conn.commit()
    print "added %s to trip %s's nodes" %(name, tripID)
    return oid

def updateNodeInfo(node):
    t = (node['name'],node['id'])
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    c.execute("UPDATE nodes SET name = ? WHERE oid = ?", t) 
    conn.commit()
    print "updated node info"
    return True
       
def getNodes(tripID):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (tripID, )
    nodes = []
    for row in c.execute("SELECT rowid,* FROM nodes WHERE tripID=?", t):
        nodes.append({"id":row[0], "tripID":row[1], "name":row[2],"position":row[3],"list":row[4]})
    print "nodes for trip with id "+`tripID`+": "+`nodes`
    return nodes

def updateNodeList(tripID, name, newlist):
    if (newlist == 1 or newlist == 0):
        conn = sqlite3.connect('data.db')
        c = conn.cursor()
        c.execute("UPDATE nodes SET list = ? WHERE tripID = ? and name = ?", (newlist,tripID,name))
        ##FIGURE OUT WHAT TO DO ABOUT DUPLICATE NAMES AT SOME POINT
        ##MAYBE USE OID FOR THE NODE? BUT THATS COMPLICATED IDEK MAN WE WILL SEE
        conn.commit()
        print "updated trip for "+`name`+" from tripID = "+`tripID`+" to "+`newlist`
    else:
        print "invalid input, newlist must be 0 or 1"
    
def getTripProperNodes(tripID):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (tripID, )
    nodes = []
    for row in c.execute("SELECT rowid,* FROM nodes WHERE tripID=? AND list=0", t):
        nodes.append({"id":row[0], "tripID":row[1], "name":row[2],"position":row[3],"list":row[4]})
    print "reserve nodes for trip with id "+`tripID`+": "+`nodes`
    return nodes
def getReserveNodes(tripID):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (tripID, )
    nodes = []
    for row in c.execute("SELECT rowid,* FROM nodes WHERE tripID=? AND list=1", t):
        nodes.append({"id":row[0], "tripID":row[1], "name":row[2],"position":row[3],"list":row[4]})
    print "reserve nodes for trip with id "+`tripID`+": "+`nodes`
    return nodes

def getNode(nodeID):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (nodeID, )
    for row in c.execute("SELECT rowid,* FROM nodes WHERE rowid=?", t):
        return {"id":row[0], "tripID":row[1], "name":row[2],"position":row[3],"list":row[4]}

def removeNode(nodeID):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (nodeID, )
    c.execute('DELETE FROM nodes WHERE rowid=?',t)
    conn.commit()
    print 'removed node with nodeID %s'%nodeID
        
def changePosition(node, newPos):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (newPos, node)
    c.execute("UPDATE nodes SET position = ? WHERE oid = ?", t)
    conn.commit()
   # print "changed node "+node+" position to "+newPos
    return True
    
def addLink(startID, endID):
    conn=sqlite3.connect('data.db')
    c = conn.cursor()
    t = (startID, endID)
    c.execute("INSERT INTO links VALUES (?,?)", t)
    conn.commit()
    print "added link from node %s to node %s"%(startID,endID)

def getLink(startID, endID):
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    t = (startID, endID)
    link = {}
    for row in c.execute("SELECT rowid,* FROM links WHERE startID=? AND endID=?", t):
        link['id']=row[0]
        link['startID']=row[1]
        link['endID']=row[2]
    print "link from node %s to node %s"%(startID,endID)
    return link
