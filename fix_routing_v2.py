
import os
import sys

print("SCRIPT STARTING")

file_path = "App.tsx"
absolute_path = os.path.abspath(file_path)
print(f"Targeting file: {absolute_path}")

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f"Read {len(lines)} lines")
except Exception as e:
    print(f"Error reading file: {e}")
    try:
        with open(file_path, 'r', encoding='cp1252') as f:
            lines = f.readlines()
        print(f"Read {len(lines)} lines with cp1252")
    except Exception as e2:
        print(f"Error reading file with cp1252: {e2}")
        sys.exit(1)

idx_return_start = -1
idx_dashboard_start = -1
idx_dashboard_end = -1
idx_return_end = -1

for i, line in enumerate(lines):
    if "return (" in line:
        if i > 480 and i < 500:
            idx_return_start = i
            print(f"Found return at {i}")
    
    if '<Route path="/app/*" element={' in line:
        idx_dashboard_start = i + 1
        print(f"Found dashboard start at {i+1}")

    if "</ProtectedRoute>" in line:
        if i > 1300:
            idx_dashboard_end = i
            print(f"Found dashboard end at {i}")

    if ");" in line:
        if i > 1330:
            idx_return_end = i
            print(f"Found return end at {i}")

if -1 in [idx_return_start, idx_dashboard_start, idx_dashboard_end, idx_return_end]:
    print(f"Error: Indices found: {idx_return_start}, {idx_dashboard_start}, {idx_dashboard_end}, {idx_return_end}")
    sys.exit(1)

new_lines = []
new_lines.extend(lines[:idx_return_start])

new_lines.append("\n  const isAppSubdomain = window.location.hostname.startsWith('app');\n\n")
new_lines.append("  const DashboardContent = (\n")
new_lines.extend(lines[idx_dashboard_start : idx_dashboard_end + 1])
new_lines.append("\n  );\n\n")

new_lines.append("  return (\n")
new_lines.append("    <Routes>\n")
# If isAppSubdomain, render DashboardContent at root. Else LandingPage.
new_lines.append("      <Route path=\"/\" element={isAppSubdomain ? DashboardContent : <LandingPage isAuthenticated={isAuthenticated} userEmail={userEmail} />} />\n")
# If authenticated, navigate to root (which handles subdomain logic).
# Note: If user is on finapro.shop and logs in, they go to /, which shows LandingPage (authenticated?).
# Wait. LandingPage usually has a "Go to Dashboard" button if authenticated.
# Or if authenticated on main domain, should we redirect to app.finapro.shop?
# User wants app.finapro.shop to be the dashboard.
# If they are on finapro.shop and click Login, they authenticate.
# Then <Navigate to="/app" /> was the old logic.
# If we change to <Navigate to="/" />, they stay on Landing Page.
# We should probably redirect to the subdomain if possible, but cross-domain redirect might lose session if cookies aren't set for domain=.finapro.shop.
# For now, let's keep it simple: If on main domain, /app shows dashboard (as backward compatibility).
# If on subdomain, /app redirects to /.
new_lines.append("      <Route path=\"/login\" element={isAuthenticated ? <Navigate to=\"/\" replace /> : <AuthScreen appName={appName} appColor={appColor} />} />\n")
new_lines.append("      <Route path=\"/app/*\" element={isAppSubdomain ? <Navigate to=\"/\" replace /> : DashboardContent} />\n")
new_lines.append("      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n")
new_lines.append("    </Routes>\n")
new_lines.append("  );\n")

new_lines.extend(lines[idx_return_end + 1:])

try:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully rewrote App.tsx")
except Exception as e:
    print(f"Error writing file: {e}")
    sys.exit(1)
