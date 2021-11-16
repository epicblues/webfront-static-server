sudo docker stop $(sudo docker ps -a -q)
sudo docker rm $(sudo docker ps -a -q)
sudo docker rmi epicblues/static-server:latest
cp ../.env .env
sudo docker build -t epicblues/static-server .
sudo docker run -d -p 5000:5000 -v /var/lib/jenkins/workspace/webfront-static-server/public/static:/app/public/static epicblues/static-server
