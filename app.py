from flask import Flask, request, redirect, render_template, session, flash
import db, cgi, json

app = Flask(__name__)
app.secret_key = 'insert_clever_secret_here'

def unescape(s):
    s = s.replace("&lt;", "<")
    s = s.replace("&gt;", ">")
    # this has to be last:
    s = s.replace("&amp;", "&")
    return s

## JUST FOR NOW ##
@app.route('/')
def root():
    if 'user' in session:
        return redirect('/home')
    else:
        return redirect('/login')
        
@app.route('/login',methods=['GET','POST'])
def login():
    if 'user' in session:
        flash("Please logout first to log into another account!")
        return  redirect('home.html')
    if request.method=='GET':
        return render_template('login.html')
    else:
        user = cgi.escape(request.form['user'],quote=True)
        pw = cgi.escape(request.form['pass'],quote=True)
        if db.validateUser(user,pw):
            session['user']=user
            session['userID']=db.getUserID(user)
            if 'return_to' in session:
                s = session['return_to']
                session.pop('return_to',None)
                return redirect(s)
            else:
                return redirect('/home')
        else:
            flash('Please enter a valid username and password')
            return render_template('login.html')

@app.route('/home',methods=['GET','POST'])
def home():
    if 'user' in session:
        if request.method=='GET':
            return render_template('trips.html',userID=session['userID'])
        
@app.route('/register',methods=['GET','POST'])
def register():
    if "user" in session:
        flash("Please logout first to register another account!")
        return render_template('home.html',name=db.getName(session['user']))
    if request.method=='GET':
        return render_template('register.html')
    else:
        user=request.form['user']
        pw=request.form['pass']
        if user == "" or pw =="":
            flash('Please fill in all the fields')
            return redirect('/register')
        elif db.existingName(user):
            flash('Your username is already taken!')
            return redirect('/register')
        else:
            if db.addUser(user,pw):
                return redirect('/login')
            else:
                return redirect('/about') ##should be replaced with flash

@app.route('/logout')
def logout():
    session.pop('user',None)
    session.pop('userID',None)
    return redirect('/login')

@app.route('/trips',methods=['GET','POST'])
def handleTripRequest():
    if request.method=='GET':
        userID = request.args.get('userID')
        print 'requested userID: '+request.args.get('userID')
        print 'returning trips: '+`db.getTrips(userID)`
        return json.dumps(db.getTrips(userID))
    else:
        return `db.addTrip(session['userID'],request.json['name'])['id']`

@app.route('/trips/<tripID>',methods=['PUT', 'DELETE'])
def handleUpdateTripRequest(tripID):
    if request.method=='PUT':
        L = request.json
        trip = db.getTripByID(tripID)
        db.updateTripInfo(L)
        return 'true'
    else:
        db.removeTrip(tripID)
        return 'true'
        
@app.route('/trip/<tripID>',methods=['GET','POST'])
def trip(tripID):
    if 'user' in session:
        if request.method=='GET':
            return render_template('trip.html',userID=session['userID'],tripID=tripID)

@app.route('/places',methods=['GET','POST', 'PUT'])
def handlePlaceRequest():
   # if request.method == "PUT":
        #stuff happens
     #   print "bang"
    if request.method=='GET':
        if request.args.get('getType')=='reserveNodes':
            return json.dumps(db.getReserveNodes(request.args.get('tripID')))
        elif request.args.get('getType')=='tripProperNodes':
            return json.dumps(db.getTripProperNodes(request.args.get('tripID')))
        ## NOT FINISHED
        else:
            return json.dumps([])
    else:
        return `db.addNode(request.json['tripID'],request.json['name'])`
    ##db.addNode(request.json['tripID'],request.json['name'])
    ##return 'User %s added a trip named %s'%(session['userID'],request.json['name'])

@app.route('/places/<nodeID>',methods=['PUT','DELETE'])
def handleUpdatePlaceRequest(nodeID):
    if request.method=='PUT':
        #get new position of node from request.json["position"]
        #update position of node from data.db to new position (see above)
        L = request.json
        node = db.getNode(nodeID)
        print nodeID
        print L
        print node
        changePosition = node['position'] != L['position']
        changeList = node['list']!=L['list']
        if changePosition or changeList:
            if changePosition:
                print 'updating position'
                db.changePosition(nodeID, L["position"])
            if changeList:
                print 'updating list'
                db.updateNodeList(node['tripID'],node['name'],L['list'])
        else:
            print 'updating info'
            db.updateNodeInfo(L);
        return "true"
    else:
        db.removeNode(nodeID)
        return "true"
    
# @app.route('/places',methods=['GET','POST'])
# def handlePlaces():
#     if request.method=='GET':
#         userID = request.args.get('userID')
#         print 'requested userID: '+request.args.get('userID')
#         return json.dumps(db.getTrips(userID))
#     else:
#         db.addTrip(session['userID'],request.json['name'])
#         return 'User %s added a trip named %s'%(session['userID'],request.json['name'])

if __name__ == '__main__':
    app.debug=True
    app.run()
        
