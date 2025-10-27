import requests
import json
import time
import random
import argparse
from concurrent.futures import ThreadPoolExecutor
import sys

class APIAttacker:
    def __init__(self, base_url="http://localhost:3000", randomize_ip=False):
        self.base_url = base_url
        self.randomize_ip = randomize_ip
        self.session_id = None
        
    def generate_random_ip(self):
        """Generate a random IP address"""
        return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"
    
    def get_headers(self):
        """Get headers with optional randomized X-Forwarded-For"""
        headers = {"Content-Type": "application/json"}
        if self.randomize_ip:
            headers["X-Forwarded-For"] = self.generate_random_ip()
        return headers
    
    def create_session(self):
        """Create a new session"""
        try:
            response = requests.post(
                f"{self.base_url}/api/access",
                headers=self.get_headers(),
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.session_id = data.get("sessionId")
                print(f"✓ Session created: {self.session_id}")
                return True
            else:
                print(f"✗ Failed to create session: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Session creation error: {e}")
            return False
    
    def attack_echo(self, count=10):
        """Attack the /echo endpoint"""
        print(f"\n🎯 Attacking /echo endpoint {count} times...")
        successful = 0
        
        for i in range(count):
            try:
                payload = {"attack": f"payload_{i}", "timestamp": time.time()}
                response = requests.post(
                    f"{self.base_url}/echo",
                    json=payload,
                    headers=self.get_headers(),
                    timeout=5
                )
                
                if response.status_code == 200:
                    successful += 1
                    print(f"  [{i+1}/{count}] ✓ Echo response received")
                else:
                    print(f"  [{i+1}/{count}] ✗ Failed: {response.status_code}")
                    
            except Exception as e:
                print(f"  [{i+1}/{count}] ✗ Error: {e}")
        
        print(f"Echo attack complete: {successful}/{count} successful")
    
    def attack_message(self, count=10):
        """Attack the /api/message endpoint"""
        if not self.session_id:
            if not self.create_session():
                return
        
        print(f"\n🎯 Attacking /api/message endpoint {count} times...")
        successful = 0
        
        for i in range(count):
            try:
                payload = {
                    "sessionId": self.session_id,
                    "body": f"Attack message {i} at {time.time()}"
                }
                response = requests.post(
                    f"{self.base_url}/api/message",
                    json=payload,
                    headers=self.get_headers(),
                    timeout=5
                )
                
                if response.status_code == 200:
                    successful += 1
                    print(f"  [{i+1}/{count}] ✓ Message sent")
                else:
                    print(f"  [{i+1}/{count}] ✗ Failed: {response.status_code}")
                    if response.status_code == 429:
                        print(f"    Rate limited - waiting 1s...")
                        time.sleep(1)
                    
            except Exception as e:
                print(f"  [{i+1}/{count}] ✗ Error: {e}")
        
        print(f"Message attack complete: {successful}/{count} successful")
    
    def attack_concurrent(self, endpoint="echo", count=20, threads=5):
        """Launch concurrent attacks"""
        print(f"\n🚀 Launching concurrent attack on /{endpoint} with {threads} threads...")
        
        def single_attack():
            response = None
            if endpoint == "echo":
                payload = {"concurrent": True, "timestamp": time.time()}
                url = f"{self.base_url}/echo"
                response = requests.post(url, json=payload, headers=self.get_headers(), timeout=5)
            elif endpoint == "message":
                if not self.session_id:
                    return False
                payload = {"sessionId": self.session_id, "body": f"Concurrent attack {time.time()}"}
                url = f"{self.base_url}/api/message"
                response = requests.post(url, json=payload, headers=self.get_headers(), timeout=5)
            
            return response is not None and response.status_code == 200
        
        if endpoint == "message" and not self.session_id:
            self.create_session()
        
        with ThreadPoolExecutor(max_workers=threads) as executor:
            futures = [executor.submit(single_attack) for _ in range(count)]
            successful = sum(1 for future in futures if future.result())
        
        print(f"Concurrent attack complete: {successful}/{count} successful")

def main():
    parser = argparse.ArgumentParser(description="API Attack Script for Testing DoS Protection")
    parser.add_argument("--url", default="http://localhost:3000", help="Base URL of the server")
    parser.add_argument("--randomize-ip", action="store_true", help="Randomize X-Forwarded-For header")
    parser.add_argument("--endpoint", choices=["echo", "message", "both"], default="both", help="Which endpoint to attack")
    parser.add_argument("--count", type=int, default=20, help="Number of requests per attack")
    parser.add_argument("--concurrent", action="store_true", help="Use concurrent attacks")
    parser.add_argument("--threads", type=int, default=5, help="Number of concurrent threads")
    parser.add_argument("--delay", type=float, default=0.1, help="Delay between requests (seconds)")
    
    args = parser.parse_args()
    
    print("🔥 API Attack Script Started")
    print(f"Target: {args.url}")
    print(f"IP Randomization: {'ON' if args.randomize_ip else 'OFF'}")
    print(f"Endpoint: {args.endpoint}")
    print("-" * 50)
    
    attacker = APIAttacker(args.url, args.randomize_ip)
    
    try:
        if args.concurrent:
            if args.endpoint in ["echo", "both"]:
                attacker.attack_concurrent("echo", args.count, args.threads)
            if args.endpoint in ["message", "both"]:
                attacker.attack_concurrent("message", args.count, args.threads)
        else:
            if args.endpoint in ["echo", "both"]:
                attacker.attack_echo(args.count)
                if args.endpoint == "both":
                    time.sleep(args.delay)
            
            if args.endpoint in ["message", "both"]:
                attacker.attack_message(args.count)
    
    except KeyboardInterrupt:
        print("\n⚠️  Attack interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
    
    print("\n🏁 Attack script finished")

if __name__ == "__main__":
    main()