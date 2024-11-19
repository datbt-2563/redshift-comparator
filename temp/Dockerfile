# Sử dụng image MySQL chính thức
FROM mysql:latest

# Copy file init.sql vào thư mục khởi tạo MySQL
COPY init.sql /docker-entrypoint-initdb.d/

# Thiết lập biến môi trường cho MySQL
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=mydatabase
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword
