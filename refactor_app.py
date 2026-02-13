
import os

file_path = r"c:\Users\Bianca\Downloads\💅-financeiropro\FinanPRO\App.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find key indices
idx_return_start = -1
idx_dashboard_start = -1
idx_dashboard_end = -1
idx_return_end = -1

for i, line in enumerate(lines):
    if "return (" in line and i > 480 and i < 500:
        idx_return_start = i
    if '<Route path="/app/*" element={' in line:
        idx_dashboard_start = i + 1 # Start capturing from next line (ProtectedRoute)
    if "</ProtectedRoute>" in line and i > 1300:
        idx_dashboard_end = i # Include this line
    if ");" in line and i > 1330:
        idx_return_end = i

print(f"Indices found: Return Start: {idx_return_start}, Dashboard Start: {idx_dashboard_start}, Dashboard End: {idx_dashboard_end}, Return End: {idx_return_end}")

if -1 in [idx_return_start, idx_dashboard_start, idx_dashboard_end, idx_return_end]:
    print("Error: Could not find all necessary code blocks.")
    exit(1)

# Construct new content
new_lines = []

# Part 1: Everything before return
new_lines.extend(lines[:idx_return_start])

# Part 2: Subdomain logic and Dashboard component
new_lines.append("\n  const isAppSubdomain = window.location.hostname.startsWith('app');\n\n")
new_lines.append("  const Dashboard = () => (\n")

# Part 3: Dashboard Content (lines[idx_dashboard_start] to lines[idx_dashboard_end])
# We include idx_dashboard_end
captured_dashboard = lines[idx_dashboard_start : idx_dashboard_end + 1]
new_lines.extend(captured_dashboard)

new_lines.append("\n  );\n\n")

# Part 4: New Return Block
new_lines.append("  return (\n")
new_lines.append("    <Routes>\n")
new_lines.append("      <Route path=\"/\" element={isAppSubdomain ? <Dashboard /> : <LandingPage isAuthenticated={isAuthenticated} userEmail={userEmail} />} />\n")
new_lines.append("      <Route path=\"/login\" element={isAuthenticated ? <Navigate to=\"/\" replace /> : <AuthScreen appName={appName} appColor={appColor} />} />\n")
# If on subdomain 'app', /app/* should redirect to / to keep URL clean.
# If on main domain, /app/* keeps working as dashboard for backward compatibility.
new_lines.append("      <Route path=\"/app/*\" element={isAppSubdomain ? <Navigate to=\"/\" replace /> : <Dashboard />} />\n")
new_lines.append("      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n")
new_lines.append("    </Routes>\n")
new_lines.append("  );\n")

# Part 5: Rest of file (after the return block closing ); which is idx_return_end)
new_lines.extend(lines[idx_return_end + 1:])

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Modification successful.")
