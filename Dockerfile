FROM nginx:alpine

# Hapus file default Nginx
RUN rm -rf /usr/share/nginx/html/*

# Salin hasil build Angular (dari folder browser jika build-nya SSR-ready)
COPY ./dist/talkvera/browser/ /usr/share/nginx/html

# Salin nginx.conf ke config default
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
