# Python Backend - Quick Start Guide

## Quick Setup

1. **Run the setup script:**
   ```powershell
   .\setup-python-backend.ps1
   ```

2. **Edit configuration:**
   - Open `python-backend\.env`
   - Update database credentials and API keys

3. **Create database:**
   ```sql
   CREATE DATABASE webapp_db;
   ```

4. **Start the server:**
   ```powershell
   cd python-backend
   python main.py
   ```

5. **Access API:**
   - API Docs: http://localhost:8000/api/docs
   - API: http://localhost:8000

## Manual Setup

```powershell
cd python-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

## API Features

✓ User authentication (JWT)
✓ Items management
✓ Travel/Rides management
✓ Bookings system
✓ Reviews & ratings
✓ Image uploads (Cloudinary)
✓ Advanced filtering & search
✓ Role-based access control

## Documentation

- Full README: `python-backend/README.md`
- API Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
