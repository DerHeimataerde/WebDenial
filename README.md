# WebDenial

## API

This application will utilize a simulated API, hosted locally with NodeJS, which will be attached to a basic front end. This API will not actually perform any task, but instead just maintain a queue, where each task will beging being processed, and 15ms later it will be removed from the queue.

## Denial of Service

To demonstrate a simple Denial of Service attack, we will create a python application that utilizes third party libraries to overwhelm the API server, and we will demonstrate the increase in response time before and after this attack starts.

## Security Solution (Milestone 4)

To solve this vulnerability, we will begin by utilizing a system where if a computer with a certain IP address, for example 1.2.3.4.5.6, already has a request in the queue, and more requests will be rejected until its original request is done processing. So, if the queue came from the following IP address, [6.5.4.3.2.1, 1.2.3.4.5.6, 1.1.1.1.1.1], then the computer with the address 1.2.3.4.5.6 sends any more requests in the next 30ms, they will be rejected by the server.

### Core Protections
- **Rate Limiting:** Per-endpoint rate limiting to prevent request flooding
  - Echo endpoint: 10 requests per 2 seconds
  - Message endpoint: 5 requests per 2 seconds  
  - Session creation: 3 requests per minute
- **Queue Management:** One request per IP in queue, sequential processing
- **Automatic IP Blocking:** IPs are auto-blocked after 5 violations within 1 minute
- **Request Size Limits:** Maximum 100kb request body size
- **IP Spoofing Mitigation:** Real IP prioritized over X-Forwarded-For header

### Enhanced Features
- **Integrity Protection:** SHA-256 checksum validation on all messages
- **Session Security:** IP address matching for session validation
- **Error Handling:** Sanitized error responses (413 for oversized requests)
- **Violation Tracking:** Automatic detection and blocking of abusive IPs

## Software Documentation

### Installation

- Clone the most recent branch, currently `milestone_4`.
- Install Node.js (which includes npm) from `https://nodejs.org`.
- From the project root, install dependencies:

```bash
npm i
```

### Usage

**Start the server:**
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

**Available Endpoints:**
- `POST /echo` - Echo endpoint with rate limiting and queue protection
- `POST /api/access` - Create a new session (rate limited)
- `POST /api/message` - Send a message (requires session, rate limited)
- `GET /api/message/echo` - Retrieve and echo a message (requires session)
- `GET /api/message/retrieve` - Retrieve latest message (requires session)

### Testing Security Protections

**Manual testing with attack script:**
You can use the Python attack script to manually test security protections against various attack patterns.

### Security Features (MS-4)

- **Rate Limiting:** Per-endpoint limits prevent request flooding
- **Queue Protection:** One request per IP prevents queue saturation
- **Automatic IP Blocking:** Violators are blocked after threshold violations
- **Request Size Limits:** 100kb maximum prevents large payload DoS
- **IP Spoofing Mitigation:** Real IP detection prevents header-based bypass
- **Integrity Validation:** SHA-256 checksums ensure message integrity
- **Session Security:** IP matching prevents session hijacking

### Attack Script Features

The `attack_script.py` provides various attack patterns for testing:
- IP Randomization: Uses X-Forwarded-For header to simulate different IPs
- Multiple Endpoints: Can target /echo, /api/message, or both
- Concurrent Attacks: Multi-threaded requests to test concurrency handling
- Rate Limit Testing: Observes and reports rate limiting responses (429 status)
- Session Management: Automatically creates sessions for message endpoint attacks
- Error Handling: Graceful handling of network errors and timeouts
- Progress Tracking: Real-time feedback on attack progress and latency

### Attack Script Usage Examples:

## Simple attack on both endpoints
python attack_script.py

## Attack only echo endpoint with IP randomization
python attack_script.py --endpoint echo --randomize-ip

## Attack message endpoint with 50 requests
python attack_script.py --endpoint message --count 50

## Concurrent attack with 10 threads
python attack_script.py --concurrent --threads 10 --count 100

## Full stress test with IP randomization
python attack_script.py --randomize-ip --concurrent --threads 20 --count 200

## Slow attack to test rate limiting
python attack_script.py --count 100 --delay 0.5

## Target different server
python attack_script.py --url http://192.168.1.100:3000 --randomize-ip

### Security Configuration

Security settings can be configured in `config.js`:

- `ECHO_RATE_LIMIT_MAX`: 10 requests per window
- `ECHO_RATE_LIMIT_WINDOW_MS`: 2000ms (2 seconds)
- `SESSION_RATE_LIMIT_MAX`: 3 requests per window
- `SESSION_RATE_LIMIT_WINDOW_MS`: 60000ms (1 minute)
- `RATE_LIMIT_MAX`: 5 requests per window (message endpoint)
- `MAX_VIOLATIONS_BEFORE_BLOCK`: 5 violations
- `VIOLATION_WINDOW_MS`: 60000ms (1 minute)
- `BLOCK_DURATION_MS`: 300000ms (5 minutes)
- `MAX_REQUEST_SIZE`: "100kb"
- `MAX_CONCURRENCY`: 1 (queue processing)

### Test Results

All security protections have been tested and validated:
- ✅ Echo rate limiting: Working (10 requests, then 429)
- ✅ Session rate limiting: Working (3 requests, then 429)
- ✅ Request size limits: Working (413 for >100kb)
- ✅ Queue protection: Working (87% requests blocked under concurrent load)
- ✅ Auto-blocking: Working (IP blocked after 5 violations)
- ⚠️ IP spoofing: Works for real IPs (localhost limitation for testing)
