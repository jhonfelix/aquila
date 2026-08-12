FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    gettext \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
CMD ["gunicorn", "dedalo.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--log-level", "debug", "--capture-output", "--enable-stdio-inheritance"]
