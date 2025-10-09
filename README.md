# WebDenial

## API

This application will utilize a simulated API, hosted locally with NodeJS, which will be attached to a basic front end. This API will not actually perform any task, but instead just maintain a queue, where each task will beging being processed, and 15ms later it will be removed from the queue.

## Denial of Service

To demonstrate a simple Denial of Service attack, we will create a python application that utilizes third party libraries to overwhelm the API server, and we will demonstrate the increase in response time before and after this attack starts.

## Solution

To solve this vulnerability, we will begin by utilizing a system where if a computer with a certain IP address, for example 1.2.3.4.5.6, already has a request in the queue, and more requests will be rejected until its original request is done processing. So, if the queue came from the following IP address, [6.5.4.3.2.1, 1.2.3.4.5.6, 1.1.1.1.1.1], then the computer with the address 1.2.3.4.5.6 sends any more requests in the next 30ms, they will be rejected by the server.

After this solution is implemented, we may implement a more advanced solution, with an extra way to differentiate between an attack and a regular user.

## Software Documentation

### Installation

- Clone the most recent branch, currently `milestone_2-2`.
- Install Node.js (which includes npm) from `https://nodejs.org`.
- From the project root, install dependencies:

```bash
npm i
```

### Usage

- Start the server:

```bash
npm start
```

- At this point, you can either attempt to DDoS/DoS manually or run the Python script (currently under construction) to simulate a DDoS/DoS attack against the server.
