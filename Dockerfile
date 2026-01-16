# Comments: Build stage for the Go application
FROM golang:1.23-alpine AS builder
WORKDIR /app
# Comments: Copy dependency files first to leverage Docker layer caching
COPY go.mod go.sum* ./
RUN go mod download
# Comments: Copy the rest of the source code
COPY . .
# Comments: Build the Go application
RUN go build -o main .

# Comments: Lightweight final image
FROM alpine:latest
WORKDIR /root/
# Comments: Copy the compiled binary from the builder stage
COPY --from=builder /app/main .
# Comments: Expose the port the application listens on
EXPOSE 8080
# Comments: Run the Go backend application
CMD ["./main"]