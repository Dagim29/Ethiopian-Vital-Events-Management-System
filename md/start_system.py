#!/usr/bin/env python3
"""
Startup script for Ethiopian Vital Management System
This script helps you start both the backend and frontend servers
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

def print_banner():
    """Print the system banner"""
    print("=" * 60)
    print("🇪🇹 ETHIOPIAN VITAL MANAGEMENT SYSTEM")
    print("=" * 60)
    print("Starting the system...")
    print()

def check_requirements():
    """Check if required software is installed"""
    print("🔍 Checking requirements...")
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
        print(f"✅ Python: {result.stdout.strip()}")
    except:
        print("❌ Python not found")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
    except:
        print("❌ Node.js not found")
        return False
    
    # Check MongoDB (optional)
    try:
        result = subprocess.run(['mongod', '--version'], capture_output=True, text=True)
        print(f"✅ MongoDB: {result.stdout.split()[2]}")
    except:
        print("⚠️  MongoDB not found - make sure MongoDB is running")
    
    print()
    return True

def install_backend_dependencies():
    """Install backend dependencies"""
    print("📦 Installing backend dependencies...")
    backend_dir = Path("backend")
    
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      cwd=backend_dir, check=True)
        print("✅ Backend dependencies installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install backend dependencies")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    frontend_dir = Path("frontend/frontend")
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    try:
        subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
        print("✅ Frontend dependencies installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install frontend dependencies")
        return False

def initialize_database():
    """Initialize the database with sample data"""
    print("🗄️  Initializing database...")
    backend_dir = Path("backend")
    
    try:
        subprocess.run([sys.executable, "init_database.py"], cwd=backend_dir, check=True)
        print("✅ Database initialized with sample data")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to initialize database")
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    backend_dir = Path("backend")
    
    try:
        process = subprocess.Popen([sys.executable, "run.py"], cwd=backend_dir)
        print("✅ Backend server started on http://localhost:5000")
        return process
    except Exception as e:
        print(f"❌ Failed to start backend server: {e}")
        return None

def start_frontend():
    """Start the frontend server"""
    print("🚀 Starting frontend server...")
    frontend_dir = Path("frontend/frontend")
    
    try:
        process = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)
        print("✅ Frontend server started on http://localhost:5173")
        return process
    except Exception as e:
        print(f"❌ Failed to start frontend server: {e}")
        return None

def main():
    """Main function"""
    print_banner()
    
    # Check requirements
    if not check_requirements():
        print("❌ Requirements check failed. Please install missing software.")
        return 1
    
    # Install dependencies
    if not install_backend_dependencies():
        print("❌ Failed to install backend dependencies")
        return 1
    
    if not install_frontend_dependencies():
        print("❌ Failed to install frontend dependencies")
        return 1
    
    # Initialize database
    if not initialize_database():
        print("❌ Failed to initialize database")
        return 1
    
    # Start servers
    backend_process = start_backend()
    if not backend_process:
        return 1
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        return 1
    
    print()
    print("🎉 System started successfully!")
    print()
    print("📱 Access the application:")
    print("   Frontend: http://localhost:5173")
    print("   Backend API: http://localhost:5000")
    print()
    print("🔑 Login credentials:")
    print("   Admin: admin@vms.et / admin123")
    print("   Officer 1: officer1@vms.et / officer123")
    print("   Officer 2: officer2@vms.et / officer123")
    print()
    print("Press Ctrl+C to stop the system")
    
    try:
        # Wait for both processes
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping system...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ System stopped")
        return 0

if __name__ == "__main__":
    sys.exit(main())
