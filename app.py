from flask import Flask, request, redirect, render_template, session, flash
import db, cgi

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
            if 'return_to' in session:
                s = session['return_to']
                session.pop('return_to',None)
                return redirect(s)
            else:
                return redirect('home.html')
        else:
            flash('Please enter a valid username and password')
            return render_template('login.html')

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
    return redirect('/login')

## RETURNS USERS, NOT PLACES ##
@app.route('/places',methods=['GET','POST'])
def handlePlaces():
    if request.method=='GET':
        return db.getUsers() 
    
if __name__ == '__main__':
    app.debug=True
    app.run()
        
