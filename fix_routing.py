
import os
import sys

file_path = r"c:\Users\Bianca\Downloads\💅-financeiropro\FinanPRO\App.tsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Read {len(lines)} lines")

idx_return_start = -1
idx_dashboard_start = -1
idx_dashboard_end = -1
idx_return_end = -1

for i, line in enumerate(lines):
    # Match return (
    if "return (" in line:
        # We want the main App return, which is usually around line 491
        # But let's just pick the last one before line 500?
        if i > 480 and i < 500:
            idx_return_start = i
            print(f"Found return at {i}: {line.strip()}")
    
    # Match dashboard start
    if '<Route path="/app/*" element={' in line:
        idx_dashboard_start = i + 1
        print(f"Found dashboard start at {i+1}")

    # Match dashboard end (look for the closing tag of ProtectedRoute inside the Route element)
    if "</ProtectedRoute>" in line:
        # We need the one that closes the dashboard
        if i > 1300:
            idx_dashboard_end = i
            print(f"Found dashboard end at {i}: {line.strip()}")

    # Match return end
    if ");" in line:
        if i > 1330:
            idx_return_end = i
            print(f"Found return end at {i}: {line.strip()}")

if -1 in [idx_return_start, idx_dashboard_start, idx_dashboard_end, idx_return_end]:
    print("Error: Could not find all indices")
    sys.exit(1)

# Reconstruct
new_lines = []
new_lines.extend(lines[:idx_return_start])

new_lines.append("\n  const isAppSubdomain = window.location.hostname.startsWith('app');\n\n")
new_lines.append("  const DashboardContent = (\n")

# Capture dashboard
new_lines.extend(lines[idx_dashboard_start : idx_dashboard_end + 1])

new_lines.append("\n  );\n\n")

new_lines.append("  return (\n")
new_lines.append("    <Routes>\n")
# Main route: if subdomain, show dashboard. Else landing page.
new_lines.append("      <Route path=\"/\" element={isAppSubdomain ? DashboardContent : <LandingPage isAuthenticated={isAuthenticated} userEmail={userEmail} />} />\n")
# Login: if authenticated, go to root (which handles dashboard/landing logic).
new_lines.append("      <Route path=\"/login\" element={isAuthenticated ? <Navigate to=\"/\" replace /> : <AuthScreen appName={appName} appColor={appColor} />} />\n")
# /app: if subdomain, redirect to root (clean URL). If domain, show dashboard (backward compat).
new_lines.append("      <Route path=\"/app/*\" element={isAppSubdomain ? <Navigate to=\"/\" replace /> : DashboardContent} />\n")
new_lines.append("      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n")
new_lines.append("    </Routes>\n")
new_lines.append("  );\n")

new_lines.extend(lines[idx_return_end + 1:])

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully rewrote App.tsx")
