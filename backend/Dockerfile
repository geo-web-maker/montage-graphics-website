FROM python:3.12-slim

# WeasyPrint needs these system libraries for text shaping and rendering.
# The native Render Python buildpack only runs `pip install`, so without
# a Dockerfile these are missing and PDF generation fails at import time.
#
# fonts-liberation covers the 'Courier New'/monospace fallback used for the
# verification code, but invoice.html's primary font is Poppins (weights
# 400/600/700/800) — a Google Font not in Debian's default repos — so the
# specific static weights actually used are pulled directly.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation \
    curl \
    && mkdir -p /usr/share/fonts/truetype/poppins \
    && for weight in Regular SemiBold Bold ExtraBold; do \
         curl -sL "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-${weight}.ttf" \
           -o "/usr/share/fonts/truetype/poppins/Poppins-${weight}.ttf"; \
       done \
    && fc-cache -f \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
