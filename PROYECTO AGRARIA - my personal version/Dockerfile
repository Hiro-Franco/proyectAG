# --- Imagen base ---
FROM python:3.11-slim

# --- Tesseract OCR + idioma español (esto es lo que pytesseract necesita
# y que "pip install" solo NO instala) ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-spa \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Dependencias Python ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# --- Código de la app ---
COPY python/ ./python/
COPY json/ ./json/

# Carpeta donde se va a ir armando el Excel. La montamos como volumen
# para que las facturas NO se pierdan cada vez que se reinicia el contenedor.
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV EXCEL_FILE=/app/data/facturas.xlsx
ENV PORT=5000
EXPOSE 5000

# gunicorn en vez de "flask run" / app.run(debug=True): eso es solo para
# desarrollo, no aguanta tráfico real ni concurrencia bien.
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "--chdir", "python", "app:app"]
