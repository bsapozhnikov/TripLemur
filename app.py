from flask import Flask, request, redirect, render_template, session, flash
import db

app = Flask(__name__)
app.secret_key = 'insert_clever_secret_here'

@app.route('/login',methods=['GET','POST'])
def login():
    if request.method=='GET':
        return render_template('login.html')
    
if __name__ == '__main__':
    app.debug=True
    app.run()
        
