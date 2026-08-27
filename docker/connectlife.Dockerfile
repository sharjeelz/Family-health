# The Hisense/ConnectLife bridge. Hisense ACs have no local protocol — control
# goes out to ConnectLife's cloud, which needs a Gigya login, an OAuth2 exchange
# and RSA-signed requests, so this uses the maintained Python library rather
# than reimplementing any of it in JavaScript.
#
# In a container so it starts with everything else instead of being a Python
# process someone has to remember to launch.

FROM python:3.12-slim

WORKDIR /app

# Just the requirements first, so a change to the script does not reinstall
# the dependency tree on every rebuild.
COPY scripts/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/connectlife_service.py ./connectlife_service.py

# Inside the container it must listen on all interfaces for the port mapping to
# work. It stays private because the host side binds to 127.0.0.1 only.
ENV CONNECTLIFE_BIND=0.0.0.0
ENV CONNECTLIFE_PORT=8787

EXPOSE 8787
CMD ["python", "-u", "connectlife_service.py"]
