# Step 1: Build the Go binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy dependency files and install them
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go application
# CGO_ENABLED=0 ensures a static binary which is safer and smaller
RUN CGO_ENABLED=0 GOOS=linux go build -o glintspark-api main.go

# Step 2: Create the minimal production image
FROM alpine:latest

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/glintspark-api .

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run the binary
CMD ["./glintspark-api"]
