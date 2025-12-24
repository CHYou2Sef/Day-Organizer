FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod init day-organizer || true
RUN go get github.com/lib/pq && go build -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]