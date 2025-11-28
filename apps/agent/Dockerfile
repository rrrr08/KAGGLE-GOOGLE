FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install -r /app/requirements.txt
COPY app /app/app
RUN useradd --create-home appuser
USER appuser
ENV PORT=8080
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
