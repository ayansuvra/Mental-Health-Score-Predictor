import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field
import pandas as pd
from typing import Literal

# load model
model = joblib.load('models/mental_health_score_model.pkl')

app = FastAPI()

# Student Data Pydantic Model
class StudentData(BaseModel):
    Age : int = Field(..., ge=5, le=90)

    Gender : Literal['Male', 'Female']

    Academic_Level : Literal['Undergraduate', 'Graduate', 'High School']
    
    Most_Used_Platform : Literal[ 'Facebook','LinkedIn','Twitter','WhatsApp','Instagram','TikTok','Snapchat','YouTube','LINE','WeChat','VKontakte','KakaoTalk']

    Avg_Daily_Usage_Hours : float = Field(..., ge=0, le=24)

    Daily_Unlocks : int = Field(..., ge=0)

    Study_Hours : float = Field(..., ge=0, le=24)

    Physical_Activity_Hours : float = Field(..., ge=0, le=24)

    Sleep_Hours_Per_Night : float = Field(..., ge=0, le=24)

    Stress_Level : Literal['High', 'Low', 'Medium', 'Very High']

@app.post('/predict')
def prdict(data: StudentData):

    input_row = pd.DataFrame([{
        'Age' : data.Age,
        'Gender' : data.Gender,
        'Academic_Level' : data.Academic_Level,
        'Most_Used_Platform' : data.Most_Used_Platform,
        'Avg_Daily_Usage_Hours' : data.Avg_Daily_Usage_Hours,
        'Daily_Unlocks' : data.Daily_Unlocks,
        'Study_Hours' : data.Study_Hours,
        'Physical_Activity_Hours' : data.Physical_Activity_Hours,
        'Sleep_Hours_Per_Night' : data.Sleep_Hours_Per_Night,
        'Stress_Level' : data.Stress_Level
    }])

    prediction = model.predict(input_row)[0]

    return {'predicted_mental_health_score' : round(float(prediction), 2)}