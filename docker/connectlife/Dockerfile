# The ConnectLife bridge for the Hisense AC. Runs beside the dashboard so that
# machine needs Docker only — no Python install.
#
# Built from the repo root so it uses scripts/connectlife_service.py directly;
# keeping a second copy here would let the two drift apart.
FROM python:3.12-slim

WORKDIR /app
COPY scripts/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY scripts/connectlife_service.py .

# Listen on all interfaces *inside* the container; the port binding in compose
# is what decides who can actually reach it.
ENV CONNECTLIFE_BIND=0.0.0.0
ENV CONNECTLIFE_PORT=8787
EXPOSE 8787

CMD ["python", "-u", "connectlife_service.py"]
