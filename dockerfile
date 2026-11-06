# base img
FROM python:3.11-slim

# Set environment variables to keep Python from buffering logs and writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# work dir
WORKDIR /code

# copy
COPY requirements.txt /code/
# run
RUN pip install -r requirements.txt

# copy folders
COPY app /code/app
COPY models /code/models

# port 
EXPOSE 8000
# command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]